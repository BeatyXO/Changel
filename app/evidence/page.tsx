"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Camera, FileImage, RefreshCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TxStatus } from "@/components/tx-status";
import { contractAddress, explorerUrl } from "@/lib/config";
import {
  isWalletCase,
  parseContractList,
  toCustodyCase,
  toEvidenceItem,
  type ContractCase,
  type ContractEvidence,
} from "@/lib/custodi-contract";
import { formatGenLayerError, readCustodi, writeCustodi } from "@/lib/genlayer";
import type { CustodyCase, EvidenceItem } from "@/lib/types";
import { shortAddress } from "@/lib/utils";
import { useWallet } from "@/lib/wallet";

type EvidenceWriteKind = "pickup_photo" | "return_photo";
type SubmitStatus = "idle" | "submitting" | "finalized" | "error";

const selectClass =
  "flex h-10 w-full rounded-md border border-vault-700/40 bg-vault-100 px-3 py-2 text-sm text-vault-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amberline";

export default function EvidencePage() {
  const wallet = useWallet();
  const [cases, setCases] = useState<CustodyCase[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  const selectedCase = useMemo(
    () => cases.find((item) => String(item.id) === selectedCaseId),
    [cases, selectedCaseId],
  );

  const loadEvidence = useCallback(async (caseId: string) => {
    if (!caseId) {
      setEvidence([]);
      return;
    }

    try {
      setLoadingEvidence(true);
      const result = await readCustodi("get_evidence", [caseId]);
      setEvidence(parseContractList<ContractEvidence>(result).map(toEvidenceItem).filter((item) => item.id > 0));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read evidence from GenLayer.");
    } finally {
      setLoadingEvidence(false);
    }
  }, []);

  const loadCases = useCallback(async () => {
    if (!contractAddress) {
      setError("No Custodi contract address is configured.");
      setLoadingCases(false);
      return;
    }

    if (!wallet.address) {
      setCases([]);
      setEvidence([]);
      setSelectedCaseId("");
      setLoadingCases(false);
      return;
    }

    try {
      setLoadingCases(true);
      setError(undefined);
      const result = await readCustodi("get_cases", [100]);
      const walletCases = parseContractList<ContractCase>(result)
        .map((item) => toCustodyCase(item))
        .filter((item) => item.id > 0 && isWalletCase(item, wallet.address));

      setCases(walletCases);
      const nextSelected = selectedCaseId && walletCases.some((item) => String(item.id) === selectedCaseId)
        ? selectedCaseId
        : String(walletCases[walletCases.length - 1]?.id ?? "");
      setSelectedCaseId(nextSelected);
      await loadEvidence(nextSelected);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load your Custodi cases from GenLayer.");
    } finally {
      setLoadingCases(false);
    }
  }, [loadEvidence, selectedCaseId, wallet.address]);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setTxHash(undefined);

    if (!wallet.address || wallet.mode === "none") {
      setStatus("error");
      setError("Choose injected or browser wallet before submitting evidence.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const caseId = String(form.get("caseId") ?? "").trim();
    const kind = String(form.get("kind") ?? "pickup_photo") as EvidenceWriteKind;
    const url = String(form.get("url") ?? "").trim();
    const note = String(form.get("note") ?? "").trim();

    if (url.length < 12 || url.length > 300 || !url.startsWith("http")) {
      setStatus("error");
      setError("Evidence URL must be a public http(s) URL between 12 and 300 characters.");
      return;
    }

    if (note.length > 500) {
      setStatus("error");
      setError("Evidence note is too long for the contract. Keep it at 500 characters or less.");
      return;
    }

    const identity =
      wallet.mode === "browser" && wallet.privateKey
        ? ({ mode: "browser", privateKey: wallet.privateKey } as const)
        : ({ mode: "injected", address: wallet.address } as const);

    try {
      setStatus("submitting");
      const functionName = kind === "return_photo" ? "submit_release_evidence" : "submit_pickup_evidence";
      const result = await writeCustodi(identity, functionName, [caseId, url, note]);
      setTxHash(result.hash);
      setStatus("finalized");
      await loadEvidence(caseId);
    } catch (caught) {
      setStatus("error");
      setError(formatGenLayerError(caught, "Evidence transaction failed."));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Register evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="caseId">Custody case</Label>
              <select
                className={selectClass}
                disabled={!wallet.address || loadingCases || cases.length === 0}
                id="caseId"
                name="caseId"
                onChange={(event) => {
                  setSelectedCaseId(event.target.value);
                  void loadEvidence(event.target.value);
                }}
                required
                value={selectedCaseId}
              >
                {cases.length === 0 ? <option value="">No wallet cases found</option> : null}
                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} — Case #{item.id}
                  </option>
                ))}
              </select>
              {selectedCase ? (
                <p className="text-xs text-vault-950/60">
                  Lender {shortAddress(selectedCase.lender)} · Borrower {shortAddress(selectedCase.borrower)}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="kind">Evidence kind</Label>
              <select className={selectClass} id="kind" name="kind" required>
                <option value="pickup_photo">Pickup photo / baseline proof</option>
                <option value="return_photo">Return photo / handback proof</option>
              </select>
              <p className="text-xs text-vault-950/60">
                Repair quotes can be attached as a public URL in the note, but the contract settlement flow compares pickup and return evidence.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Public URL</Label>
              <Input id="url" maxLength={300} name="url" type="url" placeholder="https://…" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Evidence note</Label>
              <Textarea id="note" maxLength={500} name="note" placeholder="What should validators compare or notice?" />
              <p className="text-xs text-vault-950/60">Max 500 characters. Keep it factual; public URL content is what validators compare.</p>
            </div>
            <Button type="submit" disabled={!wallet.address || !selectedCaseId || status === "submitting"}>
              <Upload className="h-4 w-4" /> {status === "submitting" ? "Writing evidence…" : "Submit evidence"}
            </Button>
            {!wallet.address ? <p className="text-sm text-vault-950/70">Connect a wallet to list cases tied to your address.</p> : null}
            {error ? <p className="rounded-md border border-rustline/40 bg-rustline/10 p-3 text-sm text-rustline">{error}</p> : null}
            {txHash ? (
              <div className="rounded-md border border-vault-700/20 bg-vault-100/60 p-3 text-sm text-vault-950/75">
                <p className="font-semibold text-vault-950">Evidence transaction finalized.</p>
                <Link className="mt-1 block break-all font-mono text-xs underline" href={`${explorerUrl}/transactions/${txHash}`} target="_blank">
                  {txHash}
                </Link>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Evidence registry</CardTitle>
                <p className="mt-1 text-sm text-vault-950/70">
                  {selectedCase ? `${selectedCase.title} — Case #${selectedCase.id}` : "Select a case to inspect its evidence."}
                </p>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={() => void loadEvidence(selectedCaseId)} disabled={!selectedCaseId || loadingEvidence}>
                <RefreshCcw className={loadingEvidence ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {evidence.length === 0 ? (
              <div className="rounded-md border border-vault-700/20 p-6">
                <p className="text-sm leading-6 text-vault-950/75">
                  {loadingEvidence ? "Loading evidence from GenLayer…" : "No evidence has been submitted for this case yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {evidence.map((item) => (
                  <article key={item.id} className="rounded-md border border-vault-700/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="inline-flex items-center gap-2 font-semibold">
                        {item.kind === "pickup_photo" ? <Camera className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
                        {item.kind.replace("_", " ")} #{item.id}
                      </p>
                      <span className="font-mono text-xs text-vault-950/60">{shortAddress(item.submittedBy)}</span>
                    </div>
                    <Link className="mt-2 block break-all text-sm underline" href={item.url} target="_blank">
                      {item.url}
                    </Link>
                    {item.note ? <p className="mt-2 text-sm leading-6 text-vault-950/75">{item.note}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {status === "submitting" ? <TxStatus current="PROPOSING" /> : null}
        {status === "finalized" ? <TxStatus current="FINALIZED" /> : null}
      </div>
    </div>
  );
}

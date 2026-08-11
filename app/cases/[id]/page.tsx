"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, FileWarning, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TxStatus } from "@/components/tx-status";
import { readCustodi, writeCustodi, formatGenLayerError, type WriteIdentity } from "@/lib/genlayer";
import { useWallet } from "@/lib/wallet";
import { formatGen, shortAddress } from "@/lib/utils";
import { parseContractList, toCustodyCase, toEvidenceItem, type ContractCase, type ContractEvidence } from "@/lib/custodi-contract";
import type { CustodyCase, EvidenceItem } from "@/lib/types";

type TxStage = "idle" | "signing" | "pending" | "done" | "error";

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address, mode, privateKey } = useWallet();

  const [item, setItem] = useState<CustodyCase | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState<TxStage>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const [caseRaw, evidenceRaw] = await Promise.all([
        readCustodi("get_case", [String(id)]),
        readCustodi("get_evidence", [id]).catch(() => []),
      ]);

      const parsed =
        typeof caseRaw === "string" ? (JSON.parse(caseRaw) as ContractCase) : (caseRaw as ContractCase);
      const evidenceList = parseContractList<ContractEvidence>(evidenceRaw).map(toEvidenceItem);

      setEvidence(evidenceList);
      setItem(toCustodyCase(parsed, evidenceList));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not reach the Custodi contract.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runWrite(functionName: string, args: unknown[] = [], value = 0n) {
    if (!address) return;
    setActionError(null);
    setTxHash(undefined);
    setStage("signing");
    try {
      const identity: WriteIdentity =
        mode === "browser" && privateKey ? { mode: "browser", privateKey } : { mode: "injected", address };
      const { hash } = await writeCustodi(identity, functionName, args as never[], value);
      setTxHash(hash);
      setStage("done");
      await load();
    } catch (err) {
      setActionError(formatGenLayerError(err));
      setStage("error");
    }
  }

  const isBusy = stage === "signing" || stage === "pending";

  // ── role detection ──────────────────────────────────────────────────────────
  const normalizedAddress = address?.toLowerCase();
  const isLender = item ? item.lender.toLowerCase() === normalizedAddress : false;
  const isBorrower = item ? item.borrower.toLowerCase() === normalizedAddress : false;

  // ── action visibility rules ─────────────────────────────────────────────────
  const showAccept = item?.status === "awaiting_borrower" && isBorrower;
  const showRelease = item?.status === "return_submitted" && isLender;
  const showReview = item?.status === "return_submitted" && (isLender || isBorrower);
  const showDispute = item?.status === "return_submitted" && (isLender || isBorrower);
  const showUnacceptedRecovery = item?.status === "awaiting_borrower" && isLender;
  const showUndeterminedRecovery = item?.status === "undetermined" && (isLender || isBorrower);

  // ── render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 animate-pulse rounded bg-vault-800/40" />
        <div className="h-40 animate-pulse rounded-lg border border-vault-700/20 bg-vault-900/40" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">{loadError}</p>
        <Button variant="outline" onClick={load}>
          <RefreshCcw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  if (!item) {
    return <p className="text-vault-400">Case #{id} not found.</p>;
  }

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/cases"
            className="inline-flex items-center gap-1 text-xs text-vault-400 hover:text-vault-100"
          >
            <ArrowLeft className="h-3 w-3" /> All cases
          </Link>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.24em] text-amberline">Case #{item.id}</p>
          <h1 className="mt-1 text-4xl font-black">{item.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={item.status} />
          <Button variant="outline" size="sm" onClick={load} disabled={isBusy}>
            <RefreshCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* stat cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Deposit</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black">{formatGen(item.deposit)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Category</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{item.category}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pickup proofs</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black">{item.pickupEvidence}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Return proofs</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black">{item.returnEvidence}</p></CardContent>
        </Card>
      </section>

      {/* details + verdict */}
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* evidence trail */}
        <Card>
          <CardHeader><CardTitle>Evidence trail</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {evidence.length === 0 ? (
              <p className="text-sm text-vault-950/60">No evidence submitted yet.</p>
            ) : (
              <ul className="space-y-3">
                {evidence.map((ev) => (
                  <li key={ev.id} className="rounded-md border border-vault-700/20 bg-vault-900/30 p-3 text-sm">
                    <p className="font-semibold capitalize">{ev.kind.replace(/_/g, " ")}</p>
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-xs text-amberline underline"
                    >
                      {ev.url}
                    </a>
                    {ev.note ? <p className="mt-1 text-xs text-vault-950/70">{ev.note}</p> : null}
                    <p className="mt-1 text-xs text-vault-950/50">
                      {shortAddress(ev.submittedBy)} · {ev.submittedAt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* right column */}
        <div className="space-y-4">
          {/* parties */}
          <Card>
            <CardHeader><CardTitle>Parties</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-xs font-bold text-vault-950/50">Lender</p>
                <p className="font-mono">{shortAddress(item.lender)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-vault-950/50">Borrower</p>
                <p className="font-mono">{item.borrower ? shortAddress(item.borrower) : "Not yet accepted"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-vault-950/50">Due</p>
                <p>{item.dueAt || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* verdict (if resolved) */}
          {item.verdict ? (
            <Card>
              <CardHeader><CardTitle>Consensus verdict</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold capitalize">{item.verdict.class.replace(/_/g, " ")}</p>
                <p className="text-xs text-vault-950/60">{item.verdict.reasoning}</p>
                <p className="text-xs">
                  Release to borrower: {formatGen(item.verdict.releaseToBorrower)} · to lender:{" "}
                  {formatGen(item.verdict.releaseToLender)}
                </p>
                <p className="text-xs text-vault-950/50">Confidence: {item.verdict.confidence}%</p>
              </CardContent>
            </Card>
          ) : null}

          {/* tx status */}
          {stage !== "idle" ? (
            <TxStatus
              current={stage === "done" ? "FINALIZED" : stage === "error" ? "CANCELED" : "PENDING"}
            />
          ) : null}
          {txHash ? (
            <p className="break-all font-mono text-xs text-vault-400">Tx: {txHash}</p>
          ) : null}

          {actionError ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {actionError}
            </p>
          ) : null}

          {/* wallet prompt */}
          {!address ? (
            <p className="rounded-md border border-amberline/30 bg-amberline/10 p-3 text-xs text-vault-100">
              Connect a wallet to take actions on this case.
            </p>
          ) : null}

          {/* action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* borrower: accept handoff */}
            {showAccept ? (
              <Button
                disabled={isBusy}
                onClick={() => runWrite("accept_promise", [String(item.id)])}
              >
                Accept promise
              </Button>
            ) : null}

            {/* always: add evidence */}
            <Link href={`/evidence?case=${item.id}`}>
              <Button variant="secondary" disabled={isBusy}>
                <Camera className="h-4 w-4" /> Add evidence
              </Button>
            </Link>

            {/* lender: release without dispute */}
            {showRelease ? (
              <Button
                variant="outline"
                disabled={isBusy}
                onClick={() => runWrite("release_without_dispute", [String(item.id)])}
              >
                <ShieldCheck className="h-4 w-4" /> Release deposit
              </Button>
            ) : null}

            {/* either party: request AI review */}
            {showReview ? (
              <Button
                variant="outline"
                disabled={isBusy}
                onClick={() => runWrite("challenge_promise", [String(item.id)])}
              >
                <ShieldCheck className="h-4 w-4" /> Request review
              </Button>
            ) : null}

            {/* either party: dispute return */}
            {showDispute ? (
              <Button
                variant="danger"
                disabled={isBusy}
                onClick={() => runWrite("challenge_promise", [String(item.id)])}
              >
                <FileWarning className="h-4 w-4" /> Challenge usage
              </Button>
            ) : null}

            {showUnacceptedRecovery ? (
              <Button variant="outline" disabled={isBusy} onClick={() => runWrite("recover_unaccepted", [String(item.id)])}>
                Recover unaccepted deposit
              </Button>
            ) : null}

            {showUndeterminedRecovery ? (
              <Button variant="outline" disabled={isBusy} onClick={() => runWrite("recover_undetermined", [String(item.id)])}>
                Recover inconclusive deposit
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

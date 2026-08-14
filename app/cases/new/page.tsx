"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Camera, Coins, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TxStatus } from "@/components/tx-status";
import { explorerUrl } from "@/lib/config";
import { formatGenLayerError, writeCustodi } from "@/lib/genlayer";
import { parseGenToWei } from "@/lib/utils";
import { useWallet } from "@/lib/wallet";

type SubmitStatus = "idle" | "submitting" | "finalized" | "error";

export default function NewCasePage() {
  const wallet = useWallet();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setTxHash(undefined);

    if (!wallet.address || wallet.mode === "none") {
      setStatus("error");
      setError("Choose injected or browser wallet before writing.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
    const releaseRef = String(form.get("releaseRef") ?? "").trim();
    const borrower = String(form.get("borrower") ?? "").trim();
    const baseline = String(form.get("baseline") ?? "").trim();
    const dueAt = String(form.get("due") ?? "").trim();
    const depositWei = parseGenToWei(String(form.get("deposit") ?? ""));

    if (depositWei === null) {
      setStatus("error");
      setError("Deposit must be a positive GEN amount with no more than 18 decimal places.");
      return;
    }

    const identity =
      wallet.mode === "browser" && wallet.privateKey
        ? ({ mode: "browser", privateKey: wallet.privateKey } as const)
        : ({ mode: "injected", address: wallet.address } as const);

    try {
      setStatus("submitting");
      const result = await writeCustodi(
        identity,
        "create_promise",
        [title, category, sourceUrl, releaseRef, borrower, baseline, dueAt],
        depositWei,
      );
      setTxHash(result.hash);
      setStatus("finalized");
    } catch (caught) {
      setStatus("error");
      setError(formatGenLayerError(caught));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">New promise</p>
          <h1 className="mt-2 text-4xl font-black">Create a release promise</h1>
          <p className="mt-3 max-w-2xl text-vault-200">
            The team defines the release claim and bond. The public can inspect evidence and challenge fulfillment.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Promise terms</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="title">Release promise title</Label>
                <Input id="title" name="title" placeholder="v2 authentication migration" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="category">Release scope</Label>
                  <Input id="category" name="category" placeholder="API, security, migration, feature" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deposit">Review bond in GEN</Label>
                  <Input id="deposit" name="deposit" type="number" min="0.000000000000000001" step="any" placeholder="Deposit amount" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="borrower">Designated challenger address</Label>
                  <Input id="borrower" name="borrower" placeholder="0x…" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due">Evidence-close date and time</Label>
                  <Input id="due" name="due" type="datetime-local" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sourceUrl">Bound source repository</Label>
                <Input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://github.com/org/repo" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="releaseRef">Immutable release reference</Label>
                <Input id="releaseRef" name="releaseRef" placeholder="v3.2.0 or commit SHA" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseline">Promise terms</Label>
                <Textarea
                  id="baseline"
                  name="baseline"
                  placeholder="State the migration, security, API, or feature claims this release must fulfill."
                  required
                />
              </div>
              <div className="grid gap-2">
                <p className="text-xs text-vault-950/60">Evidence is added after creation. Each evidence URL must point to the bound GitHub repository and exact release reference.</p>
              </div>
              <Button type="submit" size="lg" disabled={!wallet.address || status === "submitting"}>
                <FilePlus2 className="h-4 w-4" /> {status === "submitting" ? "Writing to GenLayer…" : "Create bonded promise"}
              </Button>
              {!wallet.address ? <p className="text-sm text-vault-950/70">Choose injected or browser wallet before writing.</p> : null}
              {error ? <p className="rounded-md border border-rustline/40 bg-rustline/10 p-3 text-sm text-rustline">{error}</p> : null}
              {txHash ? (
                <div className="rounded-md border border-vault-700/20 bg-vault-100/60 p-3 text-sm text-vault-950/75">
                  <p className="font-semibold text-vault-950">Release promise transaction finalized.</p>
                  <Link className="mt-1 block break-all font-mono text-xs underline" href={`${explorerUrl}/transactions/${txHash}`} target="_blank">
                    {txHash}
                  </Link>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>What goes on-chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-vault-950/75">
            <p className="flex gap-2"><Coins className="h-4 w-4 shrink-0" /> Deposit value and settlement state.</p>
            <p className="flex gap-2"><Camera className="h-4 w-4 shrink-0" /> Promise, repository, release reference, evidence URLs, and author.</p>
            <p>Validators only admit evidence bound to the named GitHub repository and release reference. Both parties can submit evidence until the evidence-close time; review opens after it.</p>
          </CardContent>
        </Card>
        {status === "submitting" ? <TxStatus current="PROPOSING" /> : null}
        {status === "finalized" ? <TxStatus current="FINALIZED" /> : null}
      </aside>
    </div>
  );
}

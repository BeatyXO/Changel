"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PackageOpen, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseCard } from "@/components/case-card";
import { contractAddress } from "@/lib/config";
import { parseContractList, toCustodyCase, type ContractCase } from "@/lib/custodi-contract";
import { readCustodi } from "@/lib/genlayer";
import type { CustodyCase } from "@/lib/types";

export default function CasesPage() {
  const [cases, setCases] = useState<CustodyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadCases = useCallback(async () => {
    if (!contractAddress) {
      setCases([]);
      setLoading(false);
      setError("No Custodi contract address is configured.");
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      const result = await readCustodi("get_cases", [100]);
      setCases(parseContractList<ContractCase>(result).map((item) => toCustodyCase(item)).filter((item) => item.id > 0));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read Custodi cases from GenLayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Case explorer</p>
          <h1 className="mt-2 text-4xl font-black">Custody cases</h1>
          <p className="mt-3 max-w-2xl text-vault-200">
            Read-only browsing works without a wallet. Cases below are loaded from the deployed Custodi contract.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={loadCases} disabled={loading}>
          <RefreshCcw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh cases
        </Button>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <PackageOpen className="h-8 w-8 text-vault-700" />
            <CardTitle>Could not load cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-vault-950/75">{error}</p>
            <p className="break-all font-mono text-xs text-vault-950/70">{contractAddress || "No contract configured"}</p>
          </CardContent>
        </Card>
      ) : null}

      {!error && loading ? (
        <Card>
          <CardHeader>
            <RefreshCcw className="h-8 w-8 animate-spin text-vault-700" />
            <CardTitle>Loading on-chain cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-vault-950/75">Reading `get_cases(100)` from the deployed Custodi contract.</p>
          </CardContent>
        </Card>
      ) : null}

      {!error && !loading && cases.length === 0 ? (
        <Card>
          <CardHeader>
            <PackageOpen className="h-8 w-8 text-vault-700" />
            <CardTitle>No cases found on-chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-vault-950/75">
              This page read the deployed Custodi contract, but it returned an empty case list:
              <span className="mt-2 block break-all font-mono text-xs">{contractAddress || "No contract configured"}</span>
            </p>
            <Link href="/cases/new">
              <Button>Create the first handoff</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {!error && !loading && cases.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

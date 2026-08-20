"use client";

import { useEffect, useState } from "react";
import { Activity, Camera, Coins, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGen } from "@/lib/utils";
import { contractAddress } from "@/lib/config";
import { parseContractList, toCustodyCase, type ContractCase } from "@/lib/custodi-contract";
import { readCustodi } from "@/lib/genlayer";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ open: 0, deposits: 0n, evidence: 0, review: 0 });
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void readCustodi("get_promises", [100]).then((raw) => {
      const cases = parseContractList<ContractCase>(raw).map((item) => toCustodyCase(item));
      if (!active) return;
      setMetrics({
        open: cases.filter((item) => item.status === "open" || item.status === "evidence_submitted").length,
        deposits: cases.reduce((sum, item) => sum + item.deposit, 0n),
        evidence: cases.reduce((sum, item) => sum + item.pickupEvidence + item.returnEvidence, 0),
        review: cases.filter((item) => item.status === "evidence_submitted").length,
      });
    }).catch(() => { if (active) setError("Live dashboard metrics could not be read from GenLayer."); });
    return () => { active = false; };
  }, []);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ["Open cases", metrics.open, Activity],
    ["Deposits tracked", formatGen(metrics.deposits), Coins],
    ["Evidence items", metrics.evidence, Camera],
    ["Under review", metrics.review, Scale],
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Protocol desk</p>
        <h1 className="mt-2 text-4xl font-black">Changel dashboard</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5" />{label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-black">{value}</p></CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Live contract source</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-vault-950/75">
            Metrics are read from the deployed contract. Counts include the first 100 promises returned by `get_promises`.
          </p>
          {error ? <p className="mt-3 text-sm text-rustline">{error}</p> : null}
          <p className="mt-3 break-all font-mono text-xs text-vault-950/70">{contractAddress || "No contract configured"}</p>
        </CardContent>
      </Card>
    </div>
  );
}

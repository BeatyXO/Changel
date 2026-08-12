import { Activity, Camera, Coins, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGen } from "@/lib/utils";
import { contractAddress } from "@/lib/config";

export default function DashboardPage() {
  const stats: Array<[string, string | number, LucideIcon]> = [
    ["Open cases", 0, Activity],
    ["Deposits tracked", formatGen(0), Coins],
    ["Evidence items", 0, Camera],
    ["Under review", 0, Scale],
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
            Local seed metrics have been removed. Wire this dashboard to `get_cases`, `get_case`, and `get_evidence`
            on the deployed contract to show live counts.
          </p>
          <p className="mt-3 break-all font-mono text-xs text-vault-950/70">{contractAddress || "No contract configured"}</p>
        </CardContent>
      </Card>
    </div>
  );
}

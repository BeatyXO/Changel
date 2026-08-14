import Link from "next/link";
import { Camera, Coins, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatGen, shortAddress } from "@/lib/utils";
import type { CustodyCase } from "@/lib/types";

export function CaseCard({ item }: { item: CustodyCase }) {
  return (
    <Link href={`/cases/${item.id}`} className="block">
      <Card className="h-full transition-transform hover:-translate-y-0.5">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-vault-700">Case #{item.id}</p>
              <CardTitle>{item.title}</CardTitle>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm text-vault-950/75">
            <p>{item.category}</p>
            <p>Team {shortAddress(item.lender)} · Challenger {shortAddress(item.borrower)}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-vault-700/20 p-2">
              <Coins className="mb-1 h-4 w-4" />
              {formatGen(item.deposit)}
            </div>
            <div className="rounded-md border border-vault-700/20 p-2">
              <Camera className="mb-1 h-4 w-4" />
              {item.pickupEvidence + item.returnEvidence} evidence items
            </div>
            <div className="rounded-md border border-vault-700/20 p-2">
              <Timer className="mb-1 h-4 w-4" />
              {new Date(item.dueAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

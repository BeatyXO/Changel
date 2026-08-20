import { Badge } from "@/components/ui/badge";
import type { CustodyStatus } from "@/lib/types";

const copy: Record<CustodyStatus, string> = {
  open: "Open",
  evidence_submitted: "Evidence submitted",
  settled: "Settled",
  undetermined: "Undetermined",
  recovered_undetermined: "Bond recovered",
  recovered_expired: "Expired bond recovered",
  settled_single_party_evidence: "Single-party evidence settled",
};

const tone: Record<CustodyStatus, string> = {
  open: "border-skyline/70 bg-skyline/20",
  evidence_submitted: "border-amberline/80 bg-amberline/25",
  settled: "border-vault-500/80 bg-vault-500/25",
  undetermined: "border-rustline/80 bg-rustline/20",
  recovered_undetermined: "border-vault-500/80 bg-vault-500/25",
  recovered_expired: "border-vault-500/80 bg-vault-500/25",
  settled_single_party_evidence: "border-vault-500/80 bg-vault-500/25",
};

export function StatusBadge({ status }: { status: CustodyStatus }) {
  return <Badge className={tone[status]}>{copy[status]}</Badge>;
}

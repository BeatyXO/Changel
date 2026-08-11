import { Badge } from "@/components/ui/badge";
import type { CustodyStatus } from "@/lib/types";

const copy: Record<CustodyStatus, string> = {
  draft: "Draft",
  awaiting_borrower: "Awaiting borrower",
  active: "Active custody",
  return_submitted: "Return submitted",
  under_review: "Consensus review",
  released: "Deposit released",
  partial_release: "Partial release",
  slashed: "Deposit slashed",
  undetermined: "Retry needed",
  recovered_unaccepted: "Deposit recovered",
  recovered_undetermined: "Deposit returned",
};

const tone: Record<CustodyStatus, string> = {
  draft: "border-vault-700/40 bg-vault-200",
  awaiting_borrower: "border-skyline/70 bg-skyline/20",
  active: "border-amberline/80 bg-amberline/25",
  return_submitted: "border-skyline/70 bg-skyline/20",
  under_review: "border-amberline/80 bg-amberline/25",
  released: "border-vault-500/80 bg-vault-500/25",
  partial_release: "border-amberline/80 bg-amberline/25",
  slashed: "border-rustline/80 bg-rustline/25",
  undetermined: "border-rustline/80 bg-rustline/20",
  recovered_unaccepted: "border-vault-500/80 bg-vault-500/25",
  recovered_undetermined: "border-vault-500/80 bg-vault-500/25",
};

export function StatusBadge({ status }: { status: CustodyStatus }) {
  return <Badge className={tone[status]}>{copy[status]}</Badge>;
}

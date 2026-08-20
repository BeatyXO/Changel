import { CheckCircle2, Circle, Loader2, RotateCcw, XCircle } from "lucide-react";

const stages = ["PENDING", "PROPOSING", "COMMITTING", "REVEALING", "ACCEPTED", "FINALIZED"];

export function TxStatus({ current = "PROPOSING" }: { current?: string }) {
  const currentIndex = stages.indexOf(current);
  const isFinalized = current === "FINALIZED";
  const isRetryable = ["UNDETERMINED", "VALIDATORS_TIMEOUT", "LEADER_TIMEOUT"].includes(current);

  if (isRetryable) {
    return (
      <div className="rounded-lg border border-rustline/50 bg-rustline/15 p-4 text-sm text-vault-100">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <RotateCcw className="h-4 w-4" /> Consensus did not settle. Nothing was written; retry is safe.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 rounded-lg border border-vault-300/15 bg-vault-900/80 p-4">
      {!isFinalized ? <p className="mb-1 text-xs text-vault-300/80">Waiting for GenLayer consensus to finalize this write. Keep this page open; refreshes are safe.</p> : null}
      {stages.map((stage, index) => {
        const done = isFinalized ? index <= currentIndex : index < currentIndex;
        const active = !isFinalized && index === currentIndex;
        const Icon = done ? CheckCircle2 : active ? Loader2 : current === "CANCELED" ? XCircle : Circle;
        return (
          <div key={stage} className="flex items-center gap-3 text-sm">
            <Icon className={active ? "h-4 w-4 animate-spin text-amberline" : "h-4 w-4 text-vault-300"} />
            <span className={done || active ? "text-vault-100" : "text-vault-300/65"}>{stage}</span>
          </div>
        );
      })}
    </div>
  );
}

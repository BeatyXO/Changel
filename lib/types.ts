export type CustodyStatus = "open" | "evidence_submitted" | "settled" | "undetermined" | "recovered_undetermined" | "recovered_expired";
export type DamageVerdict = "fulfilled" | "partially_fulfilled" | "not_fulfilled" | "undetermined";
export type EvidenceKind = "release_evidence" | "counter_evidence";

export type CustodyCase = {
  id: number; title: string; category: string; lender: string; borrower: string; deposit: bigint;
  status: CustodyStatus; startedAt: string; dueAt: string; pickupEvidence: number; returnEvidence: number;
  repositoryUrl: string; releaseRef: string; promiseTerms: string;
  verdict?: { class: DamageVerdict; releaseToBorrower: bigint; releaseToLender: bigint; confidence: number; reasoning: string };
};
export type EvidenceItem = { id: number; caseId: number; kind: EvidenceKind; url: string; note: string; submittedBy: string; submittedAt: string };

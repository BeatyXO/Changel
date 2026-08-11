export type CustodyStatus =
  | "draft"
  | "awaiting_borrower"
  | "active"
  | "return_submitted"
  | "under_review"
  | "released"
  | "partial_release"
  | "slashed"
  | "undetermined"
  | "recovered_unaccepted"
  | "recovered_undetermined";

export type EvidenceKind = "pickup_photo" | "return_photo" | "receipt" | "condition_note" | "repair_quote";

export type DamageVerdict = "no_new_damage" | "minor_wear" | "material_damage" | "undetermined";

export type CustodyCase = {
  id: number;
  title: string;
  category: string;
  lender: string;
  borrower: string;
  deposit: bigint;
  status: CustodyStatus;
  startedAt: string;
  dueAt: string;
  pickupEvidence: number;
  returnEvidence: number;
  verdict?: {
    class: DamageVerdict;
    releaseToBorrower: bigint;
    releaseToLender: bigint;
    confidence: number;
    reasoning: string;
  };
};

export type EvidenceItem = {
  id: number;
  caseId: number;
  kind: EvidenceKind;
  url: string;
  note: string;
  submittedBy: string;
  submittedAt: string;
};

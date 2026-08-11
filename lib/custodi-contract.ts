import type { CustodyCase, CustodyStatus, DamageVerdict, EvidenceItem, EvidenceKind } from "@/lib/types";

export type ContractCase = {
  id?: string;
  title?: string;
  category?: string;
  lender?: string;
  borrower?: string;
  deposit?: string;
  status?: string;
  due_at?: string;
  created_at?: string;
  verdict_class?: string;
  release_to_borrower?: string;
  release_to_lender?: string;
  confidence?: number;
  reasoning?: string;
};

export type ContractEvidence = {
  id?: string;
  case_id?: string;
  kind?: string;
  url?: string;
  note?: string;
  submitted_by?: string;
  submitted_at?: string;
};

const statuses: CustodyStatus[] = [
  "draft",
  "awaiting_borrower",
  "active",
  "return_submitted",
  "under_review",
  "released",
  "partial_release",
  "slashed",
  "undetermined",
  "recovered_unaccepted",
  "recovered_undetermined",
];

const verdicts: DamageVerdict[] = ["no_new_damage", "minor_wear", "material_damage", "undetermined"];
const evidenceKinds: EvidenceKind[] = ["pickup_photo", "return_photo", "receipt", "condition_note", "repair_quote"];

export function parseContractList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string" || value.trim() === "") return [];
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

export function toCustodyCase(item: ContractCase, evidence: EvidenceItem[] = []): CustodyCase {
  const status = statuses.includes(item.status as CustodyStatus) ? (item.status as CustodyStatus) : "draft";
  const verdictClass = verdicts.includes(item.verdict_class as DamageVerdict) ? (item.verdict_class as DamageVerdict) : undefined;

  return {
    id: Number(item.id ?? 0),
    title: item.title ?? "Untitled handoff",
    category: item.category ?? "Uncategorized",
    lender: item.lender ?? "",
    borrower: item.borrower ?? "",
    deposit: BigInt(item.deposit ?? 0),
    status,
    startedAt: item.created_at ?? "",
    dueAt: item.due_at ?? "",
    pickupEvidence: evidence.filter((record) => record.kind === "pickup_photo").length,
    returnEvidence: evidence.filter((record) => record.kind === "return_photo").length,
    verdict: verdictClass
      ? {
          class: verdictClass,
          releaseToBorrower: BigInt(item.release_to_borrower ?? 0),
          releaseToLender: BigInt(item.release_to_lender ?? 0),
          confidence: Number(item.confidence ?? 0),
          reasoning: item.reasoning ?? "",
        }
      : undefined,
  };
}

export function toEvidenceItem(item: ContractEvidence): EvidenceItem {
  const kind = evidenceKinds.includes(item.kind as EvidenceKind) ? (item.kind as EvidenceKind) : "condition_note";

  return {
    id: Number(item.id ?? 0),
    caseId: Number(item.case_id ?? 0),
    kind,
    url: item.url ?? "",
    note: item.note ?? "",
    submittedBy: item.submitted_by ?? "",
    submittedAt: item.submitted_at ?? "",
  };
}

export function isWalletCase(item: CustodyCase, address?: string) {
  if (!address) return false;
  const normalized = address.toLowerCase();
  return item.lender.toLowerCase() === normalized || item.borrower.toLowerCase() === normalized;
}

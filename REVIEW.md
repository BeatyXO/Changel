# Steward request response

The inherited physical-item labels, damage criteria, and payout bands have been removed.

- The contract now adjudicates explicit release outcomes: `fulfilled`, `partially_fulfilled`, `not_fulfilled`, and `undetermined`.
- Bond allocation is stored on-chain and documented: 100/0, 70/30, 0/100, or recoverable to the posting team for an undetermined decision.
- The UI displays the stored promise terms, GitHub repository URL, exact release reference, evidence, outcome, and recipient allocations.
- Counter-evidence is supported for the designated challenger.
- Both parties are guaranteed validator representation: four release slots and four counter-evidence slots, with review blocked until each has submitted evidence.
- Evidence uses canonical GitHub paths bound to an immutable 40-character commit SHA; substring and lookalike URLs are rejected.
- Render statuses and SHA-256 content fingerprints are persisted. Malformed validator output becomes recoverable `undetermined`.
- Direct lifecycle tests cover payouts, lookalike URLs, slot starvation, malformed validator output, rendering failure, ordering, recovery, and string IDs.

# Steward request response

The inherited physical-item labels, damage criteria, and payout bands have been removed.

- The contract now adjudicates explicit release outcomes: `fulfilled`, `partially_fulfilled`, `not_fulfilled`, and `undetermined`.
- Bond allocation is stored on-chain and documented: 100/0, 70/30, 0/100, or recoverable to the posting team for an undetermined decision.
- The UI displays the stored promise terms, GitHub repository URL, exact release reference, evidence, outcome, and recipient allocations.
- Counter-evidence is supported for the designated challenger.
- Both release and counter evidence are contract-checked to include the stored GitHub repository and exact release reference before they can be admitted.
- Direct lifecycle tests cover all three payout bands, rejected unrelated counter-evidence, undetermined recovery, and string promise IDs in the detail client.

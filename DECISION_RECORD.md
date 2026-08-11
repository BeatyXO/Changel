# Custodi Decision Record

## Candidate scan

The nearby project folders already cover grants, grading, citations, generic claim verification, ESG, support triage, arbitration, tenant and service complaints, receipts, bounties, bug reports, reputation, debate judging, research replication, prediction games, food/agri validation, and archive/memory tools.

Custodi was selected to avoid that repetition. It is not another truth verifier or complaint court. It is a deposit-backed physical item handoff product where the disputed fact is visual: did the item come back with new damage?

## Candidates considered

1. Custodi: item handoff deposits with pickup/return photo consensus and GEN settlement.
2. LicenseGate: commercial-use license checker for datasets, repos, and content sources.
3. ConsentClip: media consent-use checker for creator campaigns and testimonials.
4. ChangelogBond: release-promise accountability for SaaS/open-source teams.
5. SourceQuote: quote authenticity and context verifier for journalists.
6. ReturnRight: ecommerce return-policy dispute resolver.
7. BoundaryPass: community rule interpretation for edge-case conduct.
8. ProofOfHumanWork: freelancer milestone acceptance with bonded deliverables.

Capabilities represented: image/visual evidence, native GEN value, live web fetch, semantic consensus, deterministic settlement, abstention, and transaction lifecycle tracking.

## Chosen project

Custodi has a simple public sentence: lend or rent an item with a deposit, then let GenLayer judge pickup and return evidence if damage is disputed.

Gate A, counterfactual: without GenLayer, the app operator, lender, borrower, or a payment processor decides who gets the deposit. That is exactly the trust problem.

Gate B, distrusting parties: lender wants compensation for real damage; borrower wants the deposit returned and protection from exaggerated claims.

Gate C, irreducibly semantic: comparing condition photos and written notes requires judgment about item identity, pre-existing marks, normal wear, and material damage.

Gate D, contract-side evidence: the contract stores public evidence URLs and fetches them during consensus. User claims are inputs, not facts.

Gate E, repeat use: rentals, borrowed tools, cameras, bikes, instruments, event gear, and creator kits produce recurring handoffs.

Gate F, beyond submission: the product can grow into community gear libraries, peer rental groups, film/photo crews, maker spaces, and campus equipment pools.

Gate G, latency: registration, acceptance, and evidence submission are deterministic writes. Only `request_damage_review` performs non-deterministic consensus, and it is permissionless for either party to trigger after return evidence exists.

## Non-determinism budget

Only `request_damage_review` performs non-determinism:

1. Fetch up to eight public evidence URLs.
2. Ask validators to compare pickup and return evidence and classify damage.

Settlement math is deterministic. Access control, status transitions, caps, and transfer amounts are deterministic.

## Self-audit

Distinct capabilities represented: native value, visual/public evidence, web fetch, semantic consensus, deterministic settlement, abstention.

Ideas most at risk of overlapping old projects: ReturnRight overlaps Redress/Reymedi; ProofOfHumanWork overlaps BountyLens/Lexora. Custodi is the cleanest break from the existing project pile.

If web access did not exist, the best alternative would be a pure on-chain multi-party condition attestation product, but it would be weaker because GenLayer would no longer inspect the evidence itself.

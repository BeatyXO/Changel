# Changel review response

## Latest steward request

> Please add a terminal transition for promises where exactly one party submitted evidence before the deadline, with a documented bond outcome that cannot strand funds. Add tests for both team-only and challenger-only evidence after expiry.

### Resolution

Implemented `settle_expired_single_party_evidence(promise_id)`.

- Team-only evidence after the deadline pays 100% of the bond to the team.
- Challenger-only evidence after the deadline pays 100% of the bond to the designated challenger.
- No evidence after the deadline remains handled by `recover_expired_without_evidence` and returns the bond to the team.
- Both-party evidence proceeds through GenLayer semantic review.
- Undetermined or malformed review results remain recoverable by the team that posted the bond.
- Every terminal path records status, outcome, allocations, recipients, and reasoning before transferring GEN.

## Earlier steward feedback resolved

- Removed inherited custody/damage terminology and replaced it with explicit release outcomes: `fulfilled`, `partially_fulfilled`, `not_fulfilled`, and `undetermined`.
- Documented and implemented bond allocations: 100/0, 70/30, 0/100, or team recovery for undetermined results.
- Stored and displayed the complete promise, repository URL, immutable commit reference, evidence, adjudication result, and payout recipients.
- Added designated challenger counter-evidence.
- Bound every evidence URL to the exact repository slug and immutable 40-character commit SHA; lookalike and substring URLs are rejected.
- Restricted evidence slots by party and blocked review until both parties have evidence.
- Added render-failure handling so unavailable sources become recoverable `undetermined`, never an accidental payout.
- Added defensive validator-output parsing and malformed-output recovery.
- Added strict fingerprint attestation validation: every fetched evidence item must have a valid status and, when rendered, a 64-character hexadecimal SHA-256 digest. Incomplete attestations cannot release funds.
- Removed unsupported appeal/expiry claims and implemented the actual empty-expiry, undetermined, and one-sided-expiry paths.
- Added string promise-ID handling in the case-detail client.
- Added live dashboard reads from the deployed contract and honest finality messaging while writes wait for GenLayer consensus.
- Added serialized, cached reads to reduce StudioNet traffic under the 30-request-per-minute limit.

## Tests

The direct lifecycle suite passes 10 tests, including:

- Fulfilled, partially fulfilled, and not-fulfilled payout bands.
- Team-only evidence after expiry.
- Challenger-only evidence after expiry.
- Empty expiry recovery.
- Undetermined recovery.
- Repository/release binding and hostile lookalike URLs.
- Evidence ordering and slot limits.
- Render failure.
- Malformed validator output.
- Incomplete fingerprint attestation.
- String case IDs.

Quality gates passed:

```text
genvm-lint check contracts/changel.py --json
python -m unittest contracts.test_changel_lifecycle -v
npm run typecheck
npm run lint
npm run build
```

## Final live proof

Final StudioNet contract:

`0xC2b5CF24701887Dd6a0C61F09d7e387e508cAb75`

The completed two-party proof finalized promise 2 with team and challenger evidence, then ran `challenge_promise` through GenLayer consensus. The result was `fulfilled`, confidence `1`, status `settled`, and a full `0.01 GEN` allocation to the team. Two matching evidence SHA-256 fingerprints were read back from contract storage.

Review transaction:

`0x52620f4c1634918052799f5995ed31537fd23055fc209f6998de05307cdddbbc`

The one-sided expiry branches were also finalized live on the preceding deployment, proving both recipient directions and terminal allocations.

## Source and deployment

- Repository: https://github.com/BeatyXO/Changel
- Final source commit: `bf1fcca`
- StudioNet explorer: https://explorer.genlayer.com/address/0xC2b5CF24701887Dd6a0C61F09d7e387e508cAb75
- Vercel must use `NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS=0xC2b5CF24701887Dd6a0C61F09d7e387e508cAb75`.

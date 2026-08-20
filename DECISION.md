# Changel decision model

Changel uses GenLayer only for the part that cannot be reduced to a deterministic rule: deciding whether a released repository materially fulfilled written promise terms.

## Evidence boundary

The team and designated challenger have separate evidence slots. Every URL must be HTTPS and must point to the exact lower-cased repository slug and immutable 40-character commit SHA stored in the promise. Review cannot start until both parties have supplied evidence. Validators fetch each admitted URL themselves; the leader records a render status and SHA-256 fingerprint for every fetched item, and the contract rejects incomplete or malformed fingerprint attestations as recoverable `undetermined`.

## Consensus boundary

`challenge_promise` runs one comparative equivalence round. The leader fetches the bound evidence and asks for one of `fulfilled`, `partially_fulfilled`, `not_fulfilled`, or `undetermined`. Validators compare decision meaning, not exact prose. Evidence rendering failure, missing sources, or malformed output must resolve to `undetermined`, never to a payout.

## Deterministic settlement boundary

The contract alone applies the documented allocations after consensus: 100/0 for fulfilled, 70/30 for partially fulfilled, and 0/100 for not fulfilled. Undetermined returns the bond to the posting team. After the evidence deadline, no-evidence recovery returns the bond to the team; exactly one party's evidence pays the full bond to that participating party. Each path records terminal status and recipient amounts before transferring GEN.

## Rate-limit and UI behavior

Reads are serialized with a short cache and a 2.2-second minimum gap to stay under StudioNet's 30-request-per-minute limit. Writes wait for `FINALIZED`; the UI says it is waiting for GenLayer consensus rather than pretending that submission equals finality.

## Verification commands

```text
genvm-lint check contracts/changel.py --json
python -m unittest contracts.test_changel_lifecycle -v
npm run typecheck
npm run lint
npm run build
```

The live full-cycle runner is `scripts/live-changel-cycle.ts`. It creates a promise, submits both evidence roles, waits for the close period, triggers consensus review, and reads back the final promise and evidence records. It requires the deployed address plus two funded StudioNet test keys through environment variables; keys are never stored in this repository.

# Review Response

Requested by Pavel Kolosov on August 10, 2026 at 07:48.

## Request

Implement contract-side payout or withdrawal paths for every recorded allocation, plus recovery for unaccepted and undetermined cases, so deposited GEN cannot remain trapped. Add lifecycle tests that prove each settlement branch moves the correct value and confirm the case-detail client sends string case IDs.

## Resolution

Completed.

- Added contract-side native GEN payout execution for all settlement allocations.
- Added lender recovery for unaccepted handoffs with `recover_unaccepted`.
- Added party recovery for undetermined reviews with `recover_undetermined`.
- Persisted payout accounting fields on each case: `paid_to_borrower` and `paid_to_lender`.
- Added borrower address validation at handoff creation so payouts target valid EVM addresses.
- Updated case-detail client writes and reads to send string case IDs.
- Updated frontend status handling and action buttons for recovered cases.
- Fixed deposit input handling so UI-entered GEN is converted to wei before contract submission.
- Added lifecycle tests covering full release, partial release, slash, unaccepted recovery, undetermined recovery, and string case ID client behavior.

## StudioNet Deployment

Contract address:

`0xe08849Ba7521CB994B73042a3323387f51eB9f62`

Explorer:

https://explorer-studio.genlayer.com/address/0xe08849Ba7521CB994B73042a3323387f51eB9f62

## Live Flow Verification

Live StudioNet transactions were executed against the new deployment.

- Deploy: `0x600faf6fa93c5154eca3068eed4acece391f688c436519e2b28a4c3470f40e29`
- Create unaccepted recovery case: `0x562a08631f1c644c9ed3bf3858e14a02823b42796c4e4144aca56b6455b5f23b`
- Recover unaccepted deposit: `0x05d44f815c146fdbab0c2081ea41001c9832e93a08f23136e2720ba21f3b0abd`
- Create accepted release case: `0x0e72f1afacd8a33c6a4d1f1c50c0e586863c7a65e3542d38905c1b42133300f0`
- Accept handoff: `0x49dbdba8e54302d94482e91769c97c0019095f74255340bc06772579b02034df`
- Release without dispute: `0xb1b3e82e39a2a257053c9eae61c3557e2831fc8577c325235eeb2f9f7564d827`

Observed on-chain case results:

- Case `1`: `status=recovered_unaccepted`, `paid_to_lender=10000000000000000`, `paid_to_borrower=0`
- Case `2`: `status=released`, `paid_to_lender=0`, `paid_to_borrower=10000000000000000`

## Validation

- `python -m unittest contracts.test_custodi_lifecycle`
- `npm.cmd run typecheck`
- `npx.cmd eslint scripts/live-custodi-flow.ts scripts/live-custodi-flow-continue.ts app/cases/new/page.tsx "app/cases/[id]/page.tsx" lib/utils.ts lib/types.ts lib/custodi-contract.ts --max-warnings=0`
- `NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS=0xe08849Ba7521CB994B73042a3323387f51eB9f62 npm.cmd run verify:schema`
- `git diff --check`

## Vercel Environment

Set this Vercel environment variable before redeploying:

```text
NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS=0xe08849Ba7521CB994B73042a3323387f51eB9f62
```

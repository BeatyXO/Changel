# Changel

**Bonded release-promise accountability for open-source and SaaS teams on GenLayer.**

Changel lets a team publish a specific release promise, lock a GEN bond, attach public release evidence, and let users challenge whether the shipped release materially fulfilled the promise.

## Why GenLayer matters

A version number can prove that code shipped. It cannot decide whether a migration guide covers the breaking endpoints, whether a security claim is actually addressed, or whether the documentation matches the promise. Changel asks GenLayer validators to fetch public GitHub, documentation, package, issue, and CI evidence and agree on the meaning of the result.

If evidence is unreachable, contradictory, or irrelevant, the contract records `undetermined` instead of forcing a confident verdict.

## Live project

- App: https://changel-release-bonds.onwukweify19.chatgpt.site
- Contract: `0x12CD16108aCFC99660280D677EB498b927b5a2a3`
- Network: GenLayer StudioNet

## Workflow

1. The team creates a promise with a release scope, target date, terms, and GEN bond.
2. The user accepts the promise as the public counterparty.
3. The team submits baseline promise evidence.
4. The user submits the shipped release evidence.
5. Either party challenges fulfillment.
6. GenLayer fetches the public sources, compares them semantically, and records the verdict.

## Verified StudioNet cycle

The complete two-wallet flow was executed on-chain using separate generated team and user identities.

| Step | Transaction |
|---|---|
| `create_promise` | `0x229824f4f9994bf810932a59257ac1599849eabbcfe064a57bbfe0e4a03c9bc4` |
| `accept_promise` | `0x2ee5e8f82123b15c469f043730c23350361be358bc7fa47721d2f74e3ed22392` |
| `submit_pickup_evidence` | `0xb157001e05179aaece0d580da1b495cd4304885f549e2faed89b4bf755abbb5c` |
| `submit_release_evidence` | `0x66b6d23146ecb2f8ff30585b280f6ec9e30b5bc99643fb69fc210d97a15580f3` |
| `challenge_promise` | `0xee0479d7f87c8753fdf23fa3f33836d2f827c511a5b854dd5ef319546431c21c` |

The final result was `undetermined`: the submitted sources did not contain the promised API migration and security evidence. This demonstrates the contract's abstention path rather than a fabricated success.

## Contract surface

The Changel-specific methods are:

```text
create_promise(title, scope, team, promise_terms, target_date) payable
accept_promise(promise_id)
submit_release_evidence(promise_id, url, note)
challenge_promise(promise_id)
get_case(promise_id)
get_cases(limit)
get_evidence(promise_id)
```

The contract also retains deterministic recovery and settlement paths for bonded promises.

## Rate-limit protection

StudioNet currently limits requests to approximately 30 per minute. Changel protects users by serializing reads with a minimum gap, caching repeated reads for six seconds, clearing the cache after finalized writes, and polling transaction finalization every eight seconds.

## Development

```bash
git clone https://github.com/BeatyXO/Changel.git
cd Changel
npm install
cp .env.local.example .env.local
npm run dev
```

Environment variables:

```text
NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS=0xeACF4B63Fca65378001b5D2b6370289E9Bb7c498
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://genlayer-explorer.vercel.app
```

Validation completed: GenLayer contract lint, five lifecycle tests, ESLint, TypeScript, and production build.

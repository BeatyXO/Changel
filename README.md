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

The deterministic two-wallet flow was executed on-chain using the configured team and user identities. The final consensus request was submitted, but StudioNet's hourly RPC ceiling was reached while polling its receipt.

| Step | Transaction |
|---|---|
| `create_promise` | `0x7a7f82550217768413e019db36ff0dc892e0535b31ba3fb66cc64eb95d49b995` |
| `accept_promise` | `0x1dfba726937d00db77c1f71a599713c41fc624b21f9198187e6222ecb716d866` |
| `submit_pickup_evidence` | `0x83fed5f218a3b4b9c1ac4246bbefb1e9312848a9545527ff19f73343fa4746ac` |
| `submit_release_evidence` | `0x016ae11a7b05b23a520d1fcfff10c521420c8eddfcac32f437c698077ce97ce9` |
| `submit_counter_evidence` | `0x266331f29979339ff8dbde3e1a3af7226671a41085d963486d7b3160a4ebd23d` |
| `challenge_promise` | Submitted; receipt polling hit StudioNet's hourly RPC limit |

The final verdict is still pending receipt confirmation for promise `3`; no verdict is claimed until the consensus transaction can be read after the rate-limit window resets.

## Contract surface

The Changel-specific methods are:

```text
create_promise(title, scope, source_url, release_ref, team, promise_terms, target_date) payable
accept_promise(promise_id)
submit_release_evidence(promise_id, url, note)
challenge_promise(promise_id)
get_case(promise_id)
get_cases(limit)
get_evidence(promise_id)
```

The contract also retains deterministic recovery and settlement paths for bonded promises.

## Rate-limit protection

StudioNet currently limits requests to approximately 30 per minute and may enforce a broader hourly ceiling. Changel serializes reads, avoids duplicate refreshes, clears the cache after finalized writes, and polls transaction finalization every 30 seconds in the live runner.

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
NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS=0x12CD16108aCFC99660280D677EB498b927b5a2a3
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://genlayer-explorer.vercel.app
```

Validation completed: GenLayer contract lint, five lifecycle tests, ESLint, TypeScript, and production build.

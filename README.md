# Changel

Changel is a bonded release-promise accountability app for open-source and SaaS teams on GenLayer.

A team locks a GEN bond against a precise promise, one canonical GitHub repository, and one immutable 40-character commit SHA. The designated challenger can submit counter-evidence. GenLayer validators receive both parties' evidence only after the evidence-close period.

## Contract outcomes and allocations

| Outcome | Team | Designated challenger |
| --- | ---: | ---: |
| `fulfilled` | 100% | 0% |
| `partially_fulfilled` | 70% | 30% |
| `not_fulfilled` | 0% | 100% |
| `undetermined` | No immediate transfer; either party can return 100% to the team that posted the bond | 0% |

There are no appeal or expiry functions. The contract exposes only paths it implements.

## Evidence binding

The contract stores the promise terms, canonical `https://github.com/owner/repository` URL, and immutable commit SHA. It admits only canonical exact GitHub commit URLs or raw GitHub URLs beginning with that exact owner/repo/SHA path—lookalike and substring URLs are rejected. Each side may submit up to four evidence items; review requires at least one team and one challenger item. Validators record URL, render status, and SHA-256 content fingerprints. Malformed validator output settles only as recoverable `undetermined`.

## Contract surface

Current StudioNet contract: `0x74E9f63087480Dd899443b117ba8d8b65DeE43B3`.

```text
create_promise(title, scope, repository_url, immutable_commit_sha, challenger, promise_terms, evidence_close_at) payable
submit_release_evidence(promise_id, url, note)                 # team only
submit_counter_evidence(promise_id, url, note)                 # designated challenger only
challenge_promise(promise_id)                                  # either party; GenLayer consensus
recover_undetermined(promise_id)                               # either party
get_promise(promise_id)
get_promises(limit)
get_evidence(promise_id)
```

## Development

```bash
npm install
cp .env.local.example .env.local
npm run dev
python -m unittest contracts.test_changel_lifecycle -v
```

```text
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS=<deployed-address>
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
```

StudioNet request protection serializes reads, caches short-lived reads, and uses a slow finality polling interval so interface refreshes do not contend with user writes under the 30-requests-per-minute limit.

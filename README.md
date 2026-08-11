# Custodi

**Deposit-backed physical item handoffs with AI damage arbitration on GenLayer.**

When you lend something valuable, the hardest question is: *who pays if it comes back damaged?* A normal smart contract can't look at photos or reason over condition descriptions. A centralized app could decide, but both parties must trust that operator. Custodi solves this with GenLayer — the deposit is locked on-chain and released based on consensus from independent AI validators comparing real pickup and return evidence.

**Live app:** https://custodi-six.vercel.app
**Contract:** [`0xe08849Ba7521CB994B73042a3323387f51eB9f62`](https://explorer-studio.genlayer.com/address/0xe08849Ba7521CB994B73042a3323387f51eB9f62) on StudioNet

---

## The problem it solves

Physical item lending — camera gear, tools, instruments, vehicles — breaks down at the return moment. Both parties have incentive to lie about the item's condition. There is no neutral party cheap enough to hire and trustworthy enough for both sides to accept. Custodi makes the deposit the arbiter: it stays locked until either the lender releases it voluntarily or GenLayer consensus renders a damage verdict based on independently fetched evidence.

---

## How it works

### Two wallets, one handoff

| Role | Wallet | Actions |
|---|---|---|
| Lender | Wallet A | Create case, lock deposit, submit pickup evidence, release or dispute |
| Borrower | Wallet B | Accept handoff, submit return evidence, request review |

### Full flow

1. **Wallet A** creates a handoff — locks a GEN deposit, sets borrower address, baseline condition note, and return deadline. Status: `awaiting_borrower`.
2. **Wallet B** accepts the handoff. Status: `active`.
3. **Wallet A** submits pickup evidence — a public URL (photo, markdown doc) and a condition note.
4. **Wallet B** submits return evidence — same format. Status: `return_submitted`.
5. **Settlement:**
   - Lender satisfied → `release_without_dispute` → full deposit returned to borrower.
   - Dispute → `request_damage_review` → GenLayer validators independently fetch both evidence URLs, compare against the baseline, and reach consensus on the damage class.

### Damage classes and settlement

| Verdict | Outcome |
|---|---|
| `no_new_damage` | Full deposit returned to borrower |
| `minor_wear` | 20% to lender, 80% to borrower |
| `material_damage` | Full deposit to lender |
| `undetermined` | No immediate allocation; either party can call `recover_undetermined` to return the full deposit to the borrower |

### Why GenLayer is essential

The damage review is the only step that uses consensus — registration, access control, evidence indexing, and settlement math are all deterministic. GenLayer consensus is used exactly where it matters: making a judgment call over public evidence that a plain smart contract cannot read.

Validators run independently, fetch the evidence URLs themselves (`gl.nondet.web.render`), and must agree on the *meaning* of their verdict — not the exact wording — before the result is written on-chain. The equity principle prevents a single compromised or hallucinating validator from changing the outcome.

---

## Verified on-chain (StudioNet)

Full smoke test through one complete damage-review cycle:

| Step | Tx hash |
|---|---|
| `create_handoff` | `0xfe8d09663c23806a715804e638d47c6efd436cfe56137ec471b7ed6849b6dc32` |
| `accept_handoff` | `0xa02be370f440e8f7f9e8efbf224a9f5986ea514e45876d5a8924c1317cead73e` |
| `submit_pickup_evidence` | `0x4ee7e0e31294937d8dcafcec092e095b6f2b389f21c1d49937ea84743241368a` |
| `submit_return_evidence` | `0x0563baf5431433c08e633c032227215eb2c17b1307dd2d867b3074a91f62b583` |
| `request_damage_review` | `0x0e510b1a5eeb42f8be479be846a422d0222f668a36b8c40177ad28bc1cf68f20` |

Final state: `released` · `verdict_class: no_new_damage` · `release_to_borrower: 100` · `release_to_lender: 0`

---

## Contract functions

```
create_handoff(title, category, borrower, baseline_note, due_at) payable
accept_handoff(case_id)
submit_pickup_evidence(case_id, url, note)
submit_return_evidence(case_id, url, note)
release_without_dispute(case_id)
request_damage_review(case_id)          ← GenLayer consensus step
recover_unaccepted(case_id)              ← lender recovers a never-accepted handoff
recover_undetermined(case_id)            ← either party returns an inconclusive deposit to borrower
get_case(case_id)
get_cases(limit)
get_evidence(case_id)
```

---

## Stack

- **Next.js 16 App Router** — TypeScript strict mode
- **Tailwind CSS**
- **genlayer-js 1.1.8** — read/write contract calls, transaction lifecycle
- **GenLayer Intelligent Contract** — `contracts/custodi.py`
- **No backend** — the contract is the source of truth

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/cases` | Live case explorer (reads from contract) |
| `/cases/new` | Create a handoff |
| `/cases/[id]` | Case detail — live status, evidence trail, action buttons |
| `/evidence` | Submit pickup or return evidence |
| `/dashboard` | Protocol overview |

---

## Local setup

```bash
git clone https://github.com/BeatyXO/Custodi.git
cd Custodi
npm install
cp .env.local.example .env.local   # add contract address below
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS=0xe08849Ba7521CB994B73042a3323387f51eB9f62
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
```

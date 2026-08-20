import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const address = process.env.NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS as `0x${string}`;
const teamKey = process.env.CHANGEL_TEAM_PRIVATE_KEY as `0x${string}`;
const challengerKey = process.env.CHANGEL_CHALLENGER_PRIVATE_KEY as `0x${string}`;
if (!address || !teamKey || !challengerKey) throw new Error("Contract address and two test keys are required.");

const teamAccount = createAccount(teamKey);
const challengerAccount = createAccount(challengerKey);
const team = createClient({ chain: studionet, account: teamAccount });
const challenger = createClient({ chain: studionet, account: challengerAccount });
const sha = "a859874dc630943e767523aac6bfd6634c3e565b";
const boundUrl = `https://raw.githubusercontent.com/BeatyXO/Changel/${sha}/README.md`;

async function write(client: typeof team, method: string, args: unknown[], value = 0n) {
  const hash = await client.writeContract({ address, functionName: method, args: args as never[], value });
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 30_000, retries: 20 });
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) throw new Error(`${method} failed: ${hash}`);
  console.log(`${method}: ${hash}`);
  return hash;
}

async function read(promiseId: string) {
  return team.readContract({ address, functionName: "get_promise", args: [promiseId] as never[] });
}

async function promiseIdFor(title: string) {
  const raw = await team.readContract({ address, functionName: "get_promises", args: [100] as never[] });
  const promises = JSON.parse(String(raw)) as Array<{ id: string; title: string }>;
  const id = promises.find(promise => promise.title === title)?.id;
  if (!id) throw new Error(`Could not find created promise: ${title}`);
  return id;
}

async function main() {
  const closeAt = new Date(Date.now() + 12 * 60_000).toISOString().slice(0, 16);
  const runId = String(Date.now()).slice(-6);
  const teamTitle = `Team-only expiry proof ${runId}`;
  const challengerTitle = `Challenger-only expiry proof ${runId}`;
  const terms = "Ship and document the repository-bound release-accountability changes at the stated immutable commit.";
  const common = ["release accountability", "https://github.com/BeatyXO/Changel", sha, challengerAccount.address, terms, closeAt];
  await write(team, "create_promise", [teamTitle, ...common], 10n ** 16n);
  const teamOnlyId = await promiseIdFor(teamTitle);
  await write(team, "submit_release_evidence", [teamOnlyId, boundUrl, "Team-only evidence for deterministic expiry settlement."]);
  await write(team, "create_promise", [challengerTitle, ...common], 10n ** 16n);
  const challengerOnlyId = await promiseIdFor(challengerTitle);
  await write(challenger, "submit_counter_evidence", [challengerOnlyId, boundUrl, "Challenger-only evidence for deterministic expiry settlement."]);
  const waitMs = Math.max(0, new Date(`${closeAt}:00.000Z`).getTime() - Date.now() + 10_000);
  console.log(`Waiting ${Math.ceil(waitMs / 1000)} seconds for the evidence period to close.`);
  if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));
  await write(challenger, "settle_expired_single_party_evidence", [teamOnlyId]);
  await write(team, "settle_expired_single_party_evidence", [challengerOnlyId]);
  console.log(JSON.stringify({ teamOnly: await read(teamOnlyId), challengerOnly: await read(challengerOnlyId) }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });

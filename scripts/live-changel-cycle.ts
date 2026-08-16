import { createAccount, createClient, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const address = process.env.NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS as `0x${string}`;
if (!address) throw new Error("NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS is required.");

const team = createAccount((process.env.CHANGEL_TEAM_PRIVATE_KEY || generatePrivateKey()) as `0x${string}`);
const user = createAccount((process.env.CHANGEL_USER_PRIVATE_KEY || generatePrivateKey()) as `0x${string}`);
const teamClient = createClient({ chain: studionet, account: team });
const userClient = createClient({ chain: studionet, account: user });

async function write(client: typeof teamClient, method: string, args: unknown[] = [], value = 0n) {
  console.log(`Submitting ${method}...`);
  const hash = await client.writeContract({ address, functionName: method, args: args as never[], value });
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 30000,
    retries: 10,
  });
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error(`${method} failed: ${hash}`);
  }
  console.log(`${method} finalized: ${hash}`);
  return hash as string;
}

async function read(client: typeof teamClient, method: string, args: unknown[]) {
  return client.readContract({ address, functionName: method, args: args as never[] });
}

async function main() {
  console.log(`contract=${address}`);
  console.log(`team=${team.address}`);
  console.log(`user=${user.address}`);

  let id = process.env.CHANGEL_PROMISE_ID || "";
  const closeMinutes = Number(process.env.CHANGEL_CLOSE_MINUTES ?? "15");
  const evidenceCloseAt = new Date(Date.now() + closeMinutes * 60_000).toISOString().slice(0, 16);
  let createHash = "skipped_existing_promise";
  let acceptHash = "skipped_existing_promise";
  if (!id) {
    createHash = await write(
      teamClient,
      "create_promise",
      [
        "Q3 API migration promise",
        "open-source SaaS release",
        "https://github.com/BeatyXO/Changel",
        "a859874dc630943e767523aac6bfd6634c3e565b",
        user.address,
        "The release must replace inherited custody code with repository-bound release outcomes, counter-evidence, fair evidence closing, and bond recovery.",
        evidenceCloseAt,
      ],
      10n ** 16n,
    );
    const casesAfterCreate = JSON.parse(String(await read(teamClient, "get_promises", [100]))) as Array<{ id: string }>;
    id = casesAfterCreate.at(-1)?.id || "";
    if (!id) throw new Error("The created promise was not returned by get_promises.");
    console.log(`promise=${id} create_tx=${createHash}`);
    acceptHash = "not required: designated challenger can submit counter-evidence";
  } else {
    console.log(`continuing_existing_promise=${id}`);
  }
  const baselineHash = await write(teamClient, "submit_release_evidence", [
    id,
    "https://raw.githubusercontent.com/BeatyXO/Changel/a859874dc630943e767523aac6bfd6634c3e565b/README.md",
    "The team published the promise and its baseline release terms for the bound Changel source.",
  ]);
  const releaseHash = "not used: only the team can submit release evidence";
  const counterHash = await write(userClient, "submit_counter_evidence", [
    id,
    "https://raw.githubusercontent.com/BeatyXO/Changel/a859874dc630943e767523aac6bfd6634c3e565b/README.md",
    "Counter-evidence asks validators to compare the bound release reference with the published migration and security claims.",
  ]);
  const waitMs = Math.max(0, new Date(`${evidenceCloseAt}:00.000Z`).getTime() - Date.now() + 10_000);
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  const challengeHash = await write(userClient, "challenge_promise", [id]);

  const finalCase = JSON.parse(String(await read(teamClient, "get_promise", [String(id)])));
  const evidence = await read(teamClient, "get_evidence", [String(id)]);
  console.log(JSON.stringify({ id, finalCase, evidence, txs: { createHash, acceptHash, baselineHash, releaseHash, counterHash, challengeHash } }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

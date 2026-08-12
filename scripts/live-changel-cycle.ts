import { createAccount, createClient, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const address = process.env.NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS as `0x${string}`;
if (!address) throw new Error("NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS is required.");

const team = createAccount(generatePrivateKey());
const user = createAccount(generatePrivateKey());
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

  const createHash = await write(
    teamClient,
    "create_promise",
    [
      "Q3 API migration promise",
      "open-source SaaS release",
      "https://github.com/BeatyXO/Changel",
      "74f1167",
      user.address,
      "The release must ship the v3 API migration guide, document the breaking endpoint changes, and publish a security fix summary.",
      "2026-12-31",
    ],
    10n ** 16n,
  );
  const casesAfterCreate = JSON.parse(String(await read(teamClient, "get_cases", [100]))) as Array<{ id: string }>;
  const id = casesAfterCreate.at(-1)?.id;
  if (!id) throw new Error("The created promise was not returned by get_cases.");
  console.log(`promise=${id} create_tx=${createHash}`);

  const acceptHash = await write(userClient, "accept_promise", [id]);
  const baselineHash = await write(teamClient, "submit_pickup_evidence", [
    id,
    "https://raw.githubusercontent.com/BeatyXO/Changel/main/README.md",
    "The team published the promise and its baseline release terms for the bound Changel source.",
  ]);
  const releaseHash = await write(userClient, "submit_release_evidence", [
    id,
    "https://raw.githubusercontent.com/BeatyXO/Changel/74f1167/README.md",
    "The shipped release evidence contains the migration and security documentation claims.",
  ]);
  const counterHash = await write(userClient, "submit_counter_evidence", [
    id,
    "https://raw.githubusercontent.com/BeatyXO/Changel/main/README.md",
    "Counter-evidence asks validators to compare the bound release reference with the published migration and security claims.",
  ]);
  const challengeHash = await write(userClient, "challenge_promise", [id]);

  const finalCase = JSON.parse(String(await read(teamClient, "get_case", [String(id)])));
  const evidence = await read(teamClient, "get_evidence", [String(id)]);
  console.log(JSON.stringify({ id, finalCase, evidence, txs: { createHash, acceptHash, baselineHash, releaseHash, counterHash, challengeHash } }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const address = process.env.NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS as `0x${string}`;
const privateKey = process.env.CHANGEL_CHALLENGER_PRIVATE_KEY as `0x${string}`;
const promiseId = process.env.CHANGEL_PROMISE_ID || "1";
if (!address || !privateKey) throw new Error("Contract address and challenger key are required.");
async function main() {
  const client = createClient({ chain: studionet, account: createAccount(privateKey) });
  const hash = await client.writeContract({ address, functionName: "challenge_promise", args: [promiseId] as never[], value: 0n });
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 30_000, retries: 20 });
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) throw new Error(`Review failed: ${hash}`);
  console.log(`Review finalized: ${hash}`);
}
main().catch(error => { console.error(error); process.exit(1); });

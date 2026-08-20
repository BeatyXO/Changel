import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const address = process.env.NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS as `0x${string}`;
const privateKey = process.env.CHANGEL_SETTLER_PRIVATE_KEY as `0x${string}`;
const promiseId = process.env.CHANGEL_PROMISE_ID;
if (!address || !privateKey || !promiseId) throw new Error("Contract address, settler key, and promise ID are required.");

async function main() {
  const client = createClient({ chain: studionet, account: createAccount(privateKey) });
  const hash = await client.writeContract({ address, functionName: "settle_expired_single_party_evidence", args: [promiseId] as never[], value: 0n });
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 30_000, retries: 20 });
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) throw new Error(`Settlement failed: ${hash}`);
  console.log(`Settlement finalized: ${hash}`);
}
main().catch(error => { console.error(error); process.exit(1); });

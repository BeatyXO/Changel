import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const contractAddress = process.env.NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS as `0x${string}` | undefined;
const privateKey = process.env.CUSTODI_TEST_PRIVATE_KEY as `0x${string}` | undefined;

if (!contractAddress) throw new Error("NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS is required.");
if (!privateKey) throw new Error("CUSTODI_TEST_PRIVATE_KEY is required.");

const custodiAddress = contractAddress;
const account = createAccount(privateKey);
const client = createClient({ chain: studionet, account });
const actor = account.address.toLowerCase();

async function write(functionName: string, args: unknown[] = [], value = 0n) {
  const hash = await client.writeContract({
    address: custodiAddress,
    functionName,
    args: args as never[],
    value,
  });
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 7000,
    retries: 90,
  });

  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error(`${functionName} failed: ${hash}`);
  }

  console.log(`${functionName}: ${hash}`);
}

async function readCase(caseId: string) {
  return client.readContract({
    address: custodiAddress,
    functionName: "get_case",
    args: [caseId] as never[],
  }) as Promise<string>;
}

async function main() {
  await write("recover_unaccepted", ["1"]);
  const recovered = JSON.parse(await readCase("1"));
  console.log(
    `case 1: status=${recovered.status} paid_to_lender=${recovered.paid_to_lender} paid_to_borrower=${recovered.paid_to_borrower}`,
  );

  await write(
    "create_handoff",
    ["Live accepted release test", "test", actor, "Baseline condition is clean and complete.", "2026-08-11"],
    10n ** 16n,
  );
  await write("accept_handoff", ["2"]);
  await write("release_without_dispute", ["2"]);
  const released = JSON.parse(await readCase("2"));
  console.log(
    `case 2: status=${released.status} paid_to_lender=${released.paid_to_lender} paid_to_borrower=${released.paid_to_borrower}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

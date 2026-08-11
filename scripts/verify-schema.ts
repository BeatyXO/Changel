import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { contractAddress, contractFunctions } from "../lib/config";

type HexAddress = `0x${string}`;

async function main() {
  if (!contractAddress) {
    console.log("No NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS set; skipping schema verification.");
    return;
  }

  const client = createClient({ chain: studionet, account: createAccount() });
  const schema = await client.getContractSchema(contractAddress as HexAddress);
  const serialized = JSON.stringify(schema);
  const missing = contractFunctions.filter((name) => !serialized.includes(name));

  if (missing.length) {
    throw new Error(`Missing contract functions: ${missing.join(", ")}`);
  }

  console.log(`Schema verified for ${contractFunctions.length} Custodi functions.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

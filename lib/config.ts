import { localnet, studionet, testnetAsimov, testnetBradbury } from "genlayer-js/chains";

export const chainName = process.env.NEXT_PUBLIC_GENLAYER_CHAIN ?? "studionet";

const CHAINS = {
  localnet,
  studionet,
  testnetAsimov,
  testnetBradbury,
} as const;

export const chain = CHAINS[chainName as keyof typeof CHAINS] ?? studionet;
export const contractAddress = process.env.NEXT_PUBLIC_CHANGEL_CONTRACT_ADDRESS ?? "";
export const explorerUrl = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ?? "https://explorer-studio.genlayer.com";

export const contractFunctions = [
  "create_promise",
  "submit_release_evidence",
  "submit_counter_evidence",
  "challenge_promise",
  "recover_undetermined",
  "recover_expired_without_evidence",
  "get_promise",
  "get_promises",
  "get_evidence",
] as const;

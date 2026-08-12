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
  "accept_promise",
  "submit_release_evidence",
  "submit_counter_evidence",
  "challenge_promise",
  "create_release",
  "accept_release",
  "submit_usage",
  "request_consent_review",
  "create_handoff",
  "accept_handoff",
  "submit_pickup_evidence",
  "submit_return_evidence",
  "request_damage_review",
  "release_without_dispute",
  "recover_unaccepted",
  "recover_undetermined",
  "get_case",
  "get_cases",
  "get_evidence",
] as const;

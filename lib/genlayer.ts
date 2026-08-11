"use client";

import { createAccount, createClient } from "genlayer-js";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import { chain, chainName, contractAddress } from "@/lib/config";

type HexAddress = `0x${string}`;
type CalldataValue = null | boolean | number | bigint | string | Uint8Array | CalldataValue[] | { [key: string]: CalldataValue };

export type WriteIdentity =
  | { mode: "browser"; privateKey: string }
  | { mode: "injected"; address: string };

// StudioNet currently limits RPC traffic to roughly 30 requests/minute. Reads
// are queued and briefly cached so navigation, refresh buttons, and multiple
// mounted panels do not compete with a user's write transaction.
const MIN_READ_GAP_MS = 2200;
const READ_CACHE_MS = 6000;
let readQueue = Promise.resolve();
let lastReadAt = 0;
const readCache = new Map<string, { expiresAt: number; value: unknown }>();

function queueRead<T>(task: () => Promise<T>): Promise<T> {
  const run = readQueue.then(async () => {
    const wait = Math.max(0, MIN_READ_GAP_MS - (Date.now() - lastReadAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastReadAt = Date.now();
    return task();
  });
  readQueue = run.then(() => undefined, () => undefined);
  return run;
}

export function createReadClient() {
  return createClient({ chain, account: createAccount() });
}

export async function createWriteClient(identity: WriteIdentity) {
  if (identity.mode === "browser") {
    return createClient({ chain, account: createAccount(identity.privateKey as HexAddress) });
  }
  const client = createClient({ chain, account: identity.address as HexAddress });
  await client.connect(chainName as never);
  return client;
}

export async function readCustodi(functionName: string, args: CalldataValue[] = []) {
  const key = `${functionName}:${JSON.stringify(args, (_, value) => typeof value === "bigint" ? value.toString() : value)}`;
  const cached = readCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  return queueRead(async () => {
    const client = createReadClient();
    const value = await client.readContract({ address: contractAddress as HexAddress, functionName, args: args as never[] });
    readCache.set(key, { expiresAt: Date.now() + READ_CACHE_MS, value });
    return value;
  });
}

function readRecord(value: unknown, key: string): unknown {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>)[key] : undefined;
}

function stringifyShort(value: unknown) {
  try {
    return JSON.stringify(value).slice(0, 700);
  } catch {
    return String(value).slice(0, 700);
  }
}

function receiptFailureReason(receipt: unknown) {
  const directError = readRecord(receipt, "error");
  if (typeof directError === "string" && directError) return directError;

  const data = readRecord(receipt, "data");
  const leaderReceipt = readRecord(data, "leader_receipt");
  if (Array.isArray(leaderReceipt)) {
    const leaderError = leaderReceipt
      .map((item) => readRecord(item, "error"))
      .find((item): item is string => typeof item === "string" && item.length > 0);
    if (leaderError) return leaderError;
  }

  return undefined;
}

export function formatGenLayerError(caught: unknown, fallback = "GenLayer transaction failed.") {
  if (caught instanceof Error && caught.message) return caught.message;

  const message = readRecord(caught, "message");
  if (typeof message === "string" && message) return message;

  const data = readRecord(caught, "data");
  const dataMessage = readRecord(data, "message");
  if (typeof dataMessage === "string" && dataMessage) return dataMessage;

  if (caught) return `${fallback} ${stringifyShort(caught)}`;
  return fallback;
}

export async function writeCustodi(identity: WriteIdentity, functionName: string, args: CalldataValue[] = [], value = 0n) {
  const client = await createWriteClient(identity);
  const hash = await client.writeContract({ address: contractAddress as HexAddress, functionName, args: args as never[], value });
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    // 8 seconds keeps one consensus transaction below the StudioNet limit
    // while still showing progress promptly.
    interval: 8000,
    retries: 90,
  });

  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    const reason = receiptFailureReason(receipt);
    throw new Error(
      `Contract execution failed for ${functionName}${reason ? `: ${reason}` : ""}. Transaction: ${hash}`,
    );
  }

  readCache.clear();

  return { hash: hash as HexAddress, receipt };
}

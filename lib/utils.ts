import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address?: string) {
  if (!address) return "No wallet";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatGen(value: bigint | number | string) {
  const wei = typeof value === "bigint" ? value : BigInt(value);
  const whole = wei / 10n ** 18n;
  const fraction = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 2).replace(/0+$/, "");
  return `${whole.toLocaleString()}${fraction ? `.${fraction}` : ""} GEN`;
}

export function parseGenToWei(input: string): bigint | null {
  const value = input.trim();
  if (!/^\d+(?:\.\d{1,18})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const wei = BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, "0"));
  return wei > 0n ? wei : null;
}

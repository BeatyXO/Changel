"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createAccount, generatePrivateKey } from "genlayer-js";

type WalletMode = "none" | "injected" | "browser";

type WalletContextValue = {
  address?: string;
  mode: WalletMode;
  privateKey?: string;
  connectInjected: () => Promise<void>;
  ensureBrowserWallet: () => void;
  disconnect: () => void;
  deleteBrowserWallet: () => void;
  exportPrivateKey: () => void;
  importPrivateKey: (value: string) => void;
};

const STORAGE_KEY = "changel.browserWallet.privateKey";
const WalletContext = createContext<WalletContextValue | null>(null);
type HexPrivateKey = `0x${string}`;

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [privateKey, setPrivateKey] = useState<string>();
  const [mode, setMode] = useState<WalletMode>("none");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const account = createAccount(stored as HexPrivateKey);
      setPrivateKey(stored);
      setAddress(account.address);
      setMode("browser");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  async function connectInjected() {
    if (typeof window === "undefined" || !window.ethereum) {
      window.alert("No injected wallet was detected. Use the browser wallet to start immediately.");
      return;
    }
    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
    if (accounts?.[0]) {
      setAddress(accounts[0]);
      setPrivateKey(undefined);
      setMode("injected");
    }
  }

  function ensureBrowserWallet() {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    const pk = existing ?? generatePrivateKey();
    if (!existing) {
      const ok = window.confirm(
        "Changel will create a browser wallet stored in localStorage. Export it if you care about this identity; clearing site data destroys it.",
      );
      if (!ok) return;
      window.localStorage.setItem(STORAGE_KEY, pk);
    }
    const account = createAccount(pk as HexPrivateKey);
    setPrivateKey(pk);
    setAddress(account.address);
    setMode("browser");
  }

  function exportPrivateKey() {
    if (!privateKey) return;
    void navigator.clipboard.writeText(privateKey);
    window.alert("Browser private key copied. Keep it private.");
  }

  function importPrivateKey(value: string) {
    const account = createAccount(value as HexPrivateKey);
    window.localStorage.setItem(STORAGE_KEY, value);
    setPrivateKey(value);
    setAddress(account.address);
    setMode("browser");
  }

  function disconnect() {
    setAddress(undefined);
    setPrivateKey(undefined);
    setMode("none");
  }

  function deleteBrowserWallet() {
    const ok = window.confirm(
      "Delete the saved Changel browser wallet from this browser? Export it first if you want to keep this identity.",
    );
    if (!ok) return;
    window.localStorage.removeItem(STORAGE_KEY);
    disconnect();
  }

  const value = useMemo(
    () => ({
      address,
      mode,
      privateKey,
      connectInjected,
      ensureBrowserWallet,
      disconnect,
      deleteBrowserWallet,
      exportPrivateKey,
      importPrivateKey,
    }),
    [address, mode, privateKey],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}

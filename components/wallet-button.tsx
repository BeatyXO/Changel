"use client";

import type { ButtonHTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, KeyRound, LogOut, PlugZap, Trash2, Upload } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { cn, shortAddress } from "@/lib/utils";

type MiniButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

function MiniButton({ active, className, children, ...props }: MiniButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-start gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
        "border border-transparent text-vault-200 hover:border-vault-300/20 hover:bg-vault-800 hover:text-vault-100",
        active && "border-vault-300/20 bg-vault-100 text-vault-950 hover:bg-vault-100 hover:text-vault-950",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function WalletButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    address,
    mode,
    connectInjected,
    ensureBrowserWallet,
    disconnect,
    deleteBrowserWallet,
    exportPrivateKey,
    importPrivateKey,
  } = useWallet();

  async function onImport() {
    const value = window.prompt("Paste exported Custodi browser private key");
    if (value) importPrivateKey(value.trim());
  }

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function closeAfter(action: () => void | Promise<void>) {
    return async () => {
      await action();
      setOpen(false);
    };
  }

  const isBrowser = mode === "browser";
  const walletLabel = address ? (
    <>
      <span className="text-vault-400">{mode}</span>
      <span className="font-mono text-vault-100">{shortAddress(address)}</span>
    </>
  ) : (
    <span>Connect wallet</span>
  );

  return (
    <div ref={menuRef} className="relative flex max-w-full items-start justify-end">
      <button
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-vault-300/20 bg-vault-900/80 px-3 text-xs font-semibold text-vault-100 shadow-inner shadow-black/20 transition hover:border-vault-300/30 hover:bg-vault-800"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {walletLabel}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-[200] flex w-[190px] flex-col gap-1 rounded-lg border border-vault-300/15 bg-vault-900/95 p-1 shadow-2xl shadow-black/40 backdrop-blur">
          <MiniButton active={mode === "injected"} onClick={closeAfter(connectInjected)}>
            <PlugZap className="h-3.5 w-3.5" /> Injected
          </MiniButton>
          <MiniButton active={isBrowser} onClick={closeAfter(ensureBrowserWallet)}>
            <KeyRound className="h-3.5 w-3.5" /> Browser
          </MiniButton>
          {isBrowser ? (
            <>
              <MiniButton onClick={closeAfter(exportPrivateKey)}>
                <Download className="h-3.5 w-3.5" /> Export
              </MiniButton>
              <MiniButton onClick={closeAfter(onImport)}>
                <Upload className="h-3.5 w-3.5" /> Import
              </MiniButton>
              <MiniButton aria-label="Delete browser wallet" onClick={closeAfter(deleteBrowserWallet)}>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete wallet</span>
              </MiniButton>
            </>
          ) : null}
          {address ? (
            <MiniButton onClick={closeAfter(disconnect)}>
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </MiniButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

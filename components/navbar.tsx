"use client";

import Link from "next/link";
import { Camera, LayoutDashboard, PackageCheck, Search } from "lucide-react";
import { WalletButton } from "@/components/wallet-button";

const links = [
  { href: "/cases", label: "Cases", icon: Search },
  { href: "/cases/new", label: "New promise", icon: PackageCheck },
  { href: "/evidence", label: "Evidence", icon: Camera },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  return (
    <header className="relative z-[100] border-b border-vault-300/10 bg-vault-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-amberline/70 bg-amberline/15">
            <Camera className="h-5 w-5 text-amberline" />
          </div>
          <div>
            <p className="text-base font-black tracking-tight">Changel</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-vault-300">release promise protocol</p>
          </div>
        </Link>
        <nav className="order-3 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:order-none lg:justify-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-vault-200 hover:bg-vault-800 hover:text-vault-100"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 justify-end">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

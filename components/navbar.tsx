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
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-amberline/70 bg-amberline/15">
            <Camera className="h-5 w-5 text-amberline" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">Changel</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-vault-300">release promise protocol</p>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-vault-200 hover:bg-vault-800 hover:text-vault-100"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex justify-start lg:justify-end">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { WalletProvider } from "@/lib/wallet";

export const metadata: Metadata = {
  title: "Changel",
  description: "A GenLayer release-promise accountability market for software teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <Navbar />
          <main className="relative z-0 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}

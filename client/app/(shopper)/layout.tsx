import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function ShopperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-dark text-foreground">
      <header className="border-b border-dark-border px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/shopper" className="font-display text-xl font-bold text-accent">
            {SITE.name} — Shopper
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/shopper/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/shopper/requests" className="text-muted-foreground hover:text-foreground">Requests</Link>
            <Link href="/shopper/earnings" className="text-muted-foreground hover:text-foreground">Earnings</Link>
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

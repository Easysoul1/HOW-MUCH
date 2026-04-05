import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function ShopperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <header className="border-b border-light-border bg-white px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/shopper" className="font-display text-xl font-bold text-green-700">
            {SITE.name} — Shopper
          </Link>
          <nav className="hidden sm:flex gap-4 text-sm">
            <Link href="/shopper/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/shopper/requests" className="text-muted-foreground hover:text-foreground">Pool</Link>
            <Link href="/shopper/my-requests" className="text-muted-foreground hover:text-foreground">My Requests</Link>
            <Link href="/shopper/earnings" className="text-muted-foreground hover:text-foreground">Earnings</Link>
            <Link href="/shopper/kyc" className="text-muted-foreground hover:text-foreground">Verification</Link>
            <Link href="/shopper/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

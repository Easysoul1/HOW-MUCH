import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <header className="border-b border-light-border bg-white px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/vendor" className="font-display text-xl font-bold text-green-700">
            {SITE.name} — Vendor
          </Link>
          <nav className="hidden sm:flex gap-4 text-sm">
            <Link href="/vendor" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/vendor/products" className="text-muted-foreground hover:text-foreground">Products</Link>
            <Link href="/vendor/analytics" className="text-muted-foreground hover:text-foreground">Analytics</Link>
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

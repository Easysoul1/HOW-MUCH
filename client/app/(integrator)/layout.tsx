import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function IntegratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <header className="border-b border-gray-200 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/integrator/docs" className="font-display text-xl font-bold text-accent">
            {SITE.name} — API
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/integrator/docs" className="text-gray-500 hover:text-foreground">Docs</Link>
            <Link href="/integrator/keys" className="text-gray-500 hover:text-foreground">Keys</Link>
            <Link href="/integrator/analytics" className="text-gray-500 hover:text-foreground">Usage</Link>
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

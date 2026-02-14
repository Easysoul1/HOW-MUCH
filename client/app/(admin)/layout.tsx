import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-dark text-foreground">
      <header className="border-b border-dark-border px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="font-display text-xl font-bold text-amber-highlight">
            {SITE.name} — Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/admin/vendor-verification" className="text-muted-foreground hover:text-foreground">Vendors</Link>
            <Link href="/admin/survey-validation" className="text-muted-foreground hover:text-foreground">Survey</Link>
            <Link href="/admin/fraud" className="text-muted-foreground hover:text-foreground">Fraud</Link>
            <Link href="/admin/social" className="text-muted-foreground hover:text-foreground">Social</Link>
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

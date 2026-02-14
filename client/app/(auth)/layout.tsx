import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-light dark:bg-dark flex flex-col">
      <header className="border-b border-light-border dark:border-dark-border py-4">
        <div className="container flex items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-display text-xl font-bold text-primary dark:text-accent">
            {SITE.name}
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}

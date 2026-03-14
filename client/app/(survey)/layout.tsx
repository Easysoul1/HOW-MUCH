import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <header className="border-b border-gray-200 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/survey" className="font-display text-xl font-bold text-accent">
            {SITE.name} — Survey
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/survey/submit" className="text-gray-500 hover:text-foreground">Submit</Link>
            <Link href="/survey/dashboard" className="text-gray-500 hover:text-foreground">Dashboard</Link>
            <Link href="/survey/rewards" className="text-gray-500 hover:text-foreground">Rewards</Link>
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

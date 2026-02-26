import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white py-4">
        <div className="container flex items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-display text-xl font-bold text-gray-900">
            {SITE.name}
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
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

"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" asChild className="text-gray-500">
        <Link href="/search" aria-label="Search">
          <Search className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex-1" />
      <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
        Account
      </Link>
    </header>
  );
}

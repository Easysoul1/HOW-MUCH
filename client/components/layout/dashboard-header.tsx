"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-dark-border bg-dark/95 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/search" aria-label="Search">
          <Search className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex-1" />
      <Link href="/dashboard/settings" className="text-sm text-muted-foreground hover:text-foreground">
        Account
      </Link>
    </header>
  );
}

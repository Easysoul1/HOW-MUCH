"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileVendorNav } from "./MobileVendorNav";

export function VendorHeader() {
  return (
    <header className="h-16 border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-panel sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <MobileVendorNav />
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products or orders..."
            className="w-full bg-light-panel dark:bg-dark-elevated border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/80 focus:bg-white dark:focus:bg-dark-panel transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-status-success/10 text-status-success rounded-full text-xs font-medium border border-status-success/20 dark:bg-status-success/20 dark:border-status-success/30">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          Store Online
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted hover:text-foreground dark:text-muted-foreground dark:hover:text-white"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-status-danger rounded-full border-2 border-white dark:border-dark-panel" />
        </Button>
      </div>
    </header>
  );
}

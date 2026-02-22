"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileBuyerNav } from "./MobileBuyerNav";

export function BuyerHeader() {
  return (
    <header className="h-16 border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-panel sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10">
      <div className="flex items-center gap-4 flex-1">
         <MobileBuyerNav />
         {/* Breadcrumbs or Page Title could go here */}
         <h1 className="font-display font-medium text-lg text-foreground hidden sm:block">My Dashboard</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
                type="text" 
                placeholder="Search market..." 
                className="pl-9 pr-4 py-2 bg-light-panel dark:bg-dark-elevated rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/80 w-48 lg:w-64 transition-all"
            />
        </div>

        <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-muted hover:text-foreground dark:text-muted-foreground dark:hover:text-white">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] flex items-center justify-center rounded-full font-bold">2</span>
            </Button>
        </Link>
        
        <Link href="/dashboard/profile">
            <div className="w-8 h-8 rounded-full bg-light-panel dark:bg-dark-elevated flex items-center justify-center overflow-hidden border border-light-border dark:border-dark-border">
                <User className="w-5 h-5 text-muted-foreground" />
            </div>
        </Link>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileBuyerNav } from "./MobileBuyerNav";

export function BuyerHeader() {
  return (
    <header className="h-16 border-b border-gray-100 bg-white sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10">
      <div className="flex items-center gap-4 flex-1">
         <MobileBuyerNav />
         {/* Breadcrumbs or Page Title could go here */}
         <h1 className="font-milano font-medium text-lg text-black hidden sm:block">My Dashboard</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search market..." 
                className="pl-9 pr-4 py-2 bg-gray-50 rounded-full text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-black w-48 lg:w-64"
            />
        </div>

        <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-black">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">2</span>
            </Button>
        </Link>
        
        <Link href="/dashboard/profile">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                <User className="w-5 h-5 text-gray-500" />
            </div>
        </Link>
      </div>
    </header>
  );
}

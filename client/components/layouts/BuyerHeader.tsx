"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileBuyerNav } from "./MobileBuyerNav";
import { useCart } from "@/lib/cart";

export function BuyerHeader() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="h-14 sm:h-16 border-b border-gray-200 bg-white sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 flex-1">
         <MobileBuyerNav />
         <h1 className="font-display font-medium text-lg text-gray-900 hidden sm:block">My Dashboard</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search market..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 w-48 lg:w-64 transition-all"
            />
        </div>

        <Button variant="ghost" size="icon" onClick={openCart} className="relative text-gray-500 hover:text-gray-900">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Button>
        
        <Link href="/dashboard/profile">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                <User className="w-5 h-5 text-gray-400" />
            </div>
        </Link>
      </div>
    </header>
  );
}

"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VendorHeader() {
  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products or orders..."
            className="w-full bg-gray-50 border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Store Online
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-black"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Button>
      </div>
    </header>
  );
}

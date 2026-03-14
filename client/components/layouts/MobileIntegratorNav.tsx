"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Key, BarChart3, Search } from "lucide-react";

const navItems = [
  { title: "Keys", href: "/integrator/keys", icon: Key },
  { title: "Usage", href: "/integrator/analytics", icon: BarChart3 },
  { title: "Search", href: "/integrator/search", icon: Search },
  { title: "Docs", href: "/integrator/docs", icon: FileText },
];

export function MobileIntegratorNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                isActive ? "text-green-600" : "text-gray-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

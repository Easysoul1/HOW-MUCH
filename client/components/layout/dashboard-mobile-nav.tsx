"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, Search, ShoppingBag, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/saved-items", label: "Saved", icon: Heart },
  { href: "/dashboard/saved-searches", label: "Searches", icon: Search },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
];

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-dark-border bg-dark-panel py-2 md:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs",
            pathname === item.href ? "text-accent" : "text-muted-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

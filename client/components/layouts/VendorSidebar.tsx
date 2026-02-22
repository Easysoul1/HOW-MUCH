"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart,
  Settings,
  Archive,
  LogOut,
} from "lucide-react";

export const vendorItems = [
  {
    title: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/vendor/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
    badge: 5, // Mock pending orders
  },
  {
    title: "Inventory",
    href: "/vendor/inventory",
    icon: Archive,
  },
  {
    title: "Performance",
    href: "/vendor/performance",
    icon: BarChart,
  },
  {
    title: "Store Settings",
    href: "/vendor/settings",
    icon: Settings,
  },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r border-light-border dark:border-dark-border bg-white dark:bg-dark-panel hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
        <Link href="/vendor/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            V
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Vendor Portal
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {vendorItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground"
                    : "text-muted hover:bg-light-panel hover:text-foreground dark:text-muted-foreground dark:hover:bg-dark-elevated dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-primary-foreground text-primary dark:bg-accent-foreground dark:text-accent"
                        : "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="mb-3 px-3 py-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-light-panel dark:bg-dark-elevated flex items-center justify-center">
              <span className="text-xs font-bold text-muted dark:text-muted-foreground">MS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-medium">My Store</span>
              <span className="text-xs text-muted-foreground">vendor@howmuch.ng</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-status-danger hover:bg-status-danger/10 dark:hover:bg-status-danger/20 w-full rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

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
    <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/vendor/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-sm">
            V
          </div>
          <span className="font-display font-bold text-lg text-gray-900">
            Vendor Portal
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {vendorItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center",
                      isActive
                        ? "bg-green-700 text-white"
                        : "bg-green-600 text-white"
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

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 px-3 py-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-xs font-bold text-green-700">MS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium">My Store</span>
              <span className="text-xs text-gray-500">vendor@howmuch.ng</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

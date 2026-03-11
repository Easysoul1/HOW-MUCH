"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { adminProductsApi, sizeRequestsApi } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  ShieldCheck,
  AlertCircle,
  Package,
  LogOut,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Vendors",
    href: "/admin/vendors",
    icon: Users,
  },
  {
    title: "Buyers",
    href: "/admin/buyers",
    icon: ShoppingBag,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Approvals",
    href: "/admin/approvals",
    icon: ShieldCheck,
    badgeKey: "approvals" as const,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "System Health",
    href: "/admin/health",
    icon: AlertCircle,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const [products, sizeRequests] = await Promise.all([
          adminProductsApi.pending(),
          sizeRequestsApi.list("PENDING"),
        ]);
        const productCount = Array.isArray(products) ? products.length : ((products as { results?: unknown[] })?.results?.length ?? 0);
        const sizeCount = Array.isArray(sizeRequests) ? sizeRequests.length : ((sizeRequests as { results?: unknown[] })?.results?.length ?? 0);
        setPendingCount(productCount + sizeCount);
      } catch {
        setPendingCount(0);
      }
    }
    fetchPendingCount();
  }, []);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-sm">
            A
          </div>
          <span className="font-display font-medium text-lg text-gray-900">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const badge = item.badgeKey === "approvals" ? pendingCount : 0;
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
                {badge > 0 && (
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                    {badge}
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
              <span className="text-xs font-bold text-green-700">AD</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium">System Admin</span>
              <span className="text-xs text-gray-500">admin@howmuch.ng</span>
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

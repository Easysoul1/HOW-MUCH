"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
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
    icon: ShoppingBag, // Using ShoppingBag as a proxy for Buyer activity/Orders
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
    badge: 3, // Mock badge
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

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r border-dark-border bg-dark-panel hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-dark-border">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold">
            A
          </div>
          <span className="font-display font-medium text-lg text-white">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/15 text-accent border border-accent/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-dark-border">
        <div className="mb-3 px-3 py-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">AD</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium">System Admin</span>
              <span className="text-xs text-muted-foreground">admin@howmuch.ng</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-status-danger hover:bg-status-danger/10 w-full rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

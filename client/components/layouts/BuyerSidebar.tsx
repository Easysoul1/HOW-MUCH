"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Clock,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export const buyerItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Saved Items",
    href: "/dashboard/saved-items",
    icon: Heart,
  },
  {
    title: "Profile Settings",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: MapPin,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Clock,
  },
];

export function BuyerSidebar() {
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
        <Link href="/" className="flex items-center gap-2">
           <span className="font-display text-xl font-bold tracking-tight text-gray-900">HOW MUCH</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-4 px-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">My Account</h3>
        </div>
        <nav className="space-y-1">
          {buyerItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

       <div className="p-4 border-t border-gray-200">
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

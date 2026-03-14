"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  FileText,
  Key,
  BarChart3,
  Search,
  LogOut,
  Code2,
} from "lucide-react";

const sidebarItems = [
  { title: "API Keys", href: "/integrator/keys", icon: Key },
  { title: "Usage", href: "/integrator/analytics", icon: BarChart3 },
  { title: "Search Preview", href: "/integrator/search", icon: Search },
  { title: "Documentation", href: "/integrator/docs", icon: FileText },
];

export function IntegratorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/integrator/keys" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-display font-medium text-lg text-gray-900">
            API Console
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
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
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="mb-3 px-3 py-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">
                  {(user.first_name?.[0] || user.email?.[0] || "I").toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-gray-900 font-medium truncate">
                  {user.first_name || "Integrator"}
                </span>
                <span className="text-xs text-gray-500 truncate">{user.email}</span>
              </div>
            </div>
          </div>
        )}
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

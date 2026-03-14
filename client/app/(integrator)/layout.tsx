"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Key, BarChart3, Loader2 } from "lucide-react";

export default function IntegratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/integrator/login";
  const isDocsPage = pathname === "/integrator/docs";

  useEffect(() => {
    if (loading) return;
    // Allow unauthenticated access to login and docs pages
    if (isLoginPage || isDocsPage) return;
    if (!user) {
      router.push("/integrator/login");
    } else if (user.user_type !== "INTEGRATOR") {
      router.push("/integrator/login");
    }
  }, [user, loading, pathname]);

  const handleLogout = () => {
    logout();
    router.push("/integrator/login");
  };

  // Login page gets minimal layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navLinks = [
    { href: "/integrator/docs", label: "Docs", icon: FileText },
    { href: "/integrator/keys", label: "Keys", icon: Key },
    { href: "/integrator/analytics", label: "Usage", icon: BarChart3 },
  ];

  if (loading && !isDocsPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <header className="border-b border-gray-200 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/integrator/docs" className="font-display text-xl font-bold text-accent">
            {SITE.name} — API
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex gap-4 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 ${
                    pathname === link.href ? "text-green-600 font-medium" : "text-gray-500 hover:text-foreground"
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
            </nav>
            {user && (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-500 hidden sm:inline">{user.email}</span>
                <Button size="sm" variant="ghost" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            {!user && !isDocsPage && (
              <Link href="/integrator/login" className="text-sm text-green-600 hover:underline ml-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}


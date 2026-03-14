"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { IntegratorSidebar } from "@/components/layouts/IntegratorSidebar";
import { MobileIntegratorNav } from "@/components/layouts/MobileIntegratorNav";

export default function IntegratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/integrator/login";
  const isDocsPage = pathname === "/integrator/docs";

  useEffect(() => {
    if (loading) return;
    if (isLoginPage || isDocsPage) return;
    if (!user) {
      router.push("/login");
    } else if (user.user_type !== "INTEGRATOR") {
      router.push("/login");
    }
  }, [user, loading, pathname]);

  // Login page gets minimal layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading && !isDocsPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <IntegratorSidebar />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      <MobileIntegratorNav />
    </div>
  );
}


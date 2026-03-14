"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function IntegratorLoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && user.user_type === "INTEGRATOR") {
      router.push("/integrator/keys");
    } else {
      router.push("/login");
    }
  }, [user, loading]);

  return null;
}


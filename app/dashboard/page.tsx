"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user?.role === "turf_owner") {
        router.push("/dashboard/owner");
      } else if (user?.role === "user") {
        router.push("/dashboard/user");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="loading-spinner"></div>
    </div>
  );
}

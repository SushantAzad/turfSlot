"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect already-authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "turf_owner") {
        router.replace("/dashboard/owner");
      } else {
        router.replace("/dashboard/user");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
      </div>
    );
  }

  // Don't flash the auth forms if we're about to redirect
  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

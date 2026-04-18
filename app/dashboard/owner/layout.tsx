"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useAuthMutations } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const { logout } = useAuthMutations();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect if not authenticated or not an owner
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "turf_owner")) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user || user.role !== "turf_owner") {
    return null;
  }

  const handleLogout = async () => {
    const result = await logout();
    if (!result.error) {
      toast.success("Logged out successfully");
      router.push("/");
    } else {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">TurfSlot</h1>
          <p className="text-gray-400 text-sm mt-1">Owner Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard/owner"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            📊 Overview
          </Link>
          <Link
            href="/dashboard/owner/turfs"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            🏟️ My Turfs
          </Link>
          <Link
            href="/dashboard/owner/slots"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ⏰ Manage Slots
          </Link>
          <Link
            href="/dashboard/owner/bookings"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            📅 Bookings
          </Link>
          <Link
            href="/dashboard/owner/analytics"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            📈 Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="text-sm text-gray-400">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-red-400"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-50 flex items-center px-4">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
          ☰
        </button>
        <h1 className="text-2xl font-bold ml-4">TurfSlot</h1>

        {menuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-gray-900 p-4 space-y-2">
            <Link
              href="/dashboard/owner"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              📊 Overview
            </Link>
            <Link
              href="/dashboard/owner/turfs"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              🏟️ My Turfs
            </Link>
            <Link
              href="/dashboard/owner/bookings"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              📅 Bookings
            </Link>
            <Link
              href="/dashboard/owner/analytics"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              📈 Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 text-red-400"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:mt-0 mt-16 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

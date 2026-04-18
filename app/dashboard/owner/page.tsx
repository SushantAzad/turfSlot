"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerTurfs, useTurfBookings } from "@/hooks/useData";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const { turfs, isLoading: turfsLoading } = useOwnerTurfs(user?.id || "");

  // Calculate stats
  const stats = useMemo(() => {
    let totalBookings = 0;
    let totalRevenue = 0;
    let pendingBookings = 0;

    // In a real app, we'd fetch all bookings for all turfs
    // For now, we'll just show turf count

    return {
      totalTurfs: turfs.length,
      totalBookings,
      totalRevenue,
      pendingBookings,
    };
  }, [turfs]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.full_name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">Manage your turfs and bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalTurfs}
          </div>
          <p className="text-gray-600 mt-2">Active Turfs</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-3xl font-bold text-green-600">
            {stats.totalBookings}
          </div>
          <p className="text-gray-600 mt-2">Total Bookings</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-3xl font-bold text-purple-600">
            ₹{stats.totalRevenue}
          </div>
          <p className="text-gray-600 mt-2">Total Revenue</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-3xl font-bold text-orange-600">
            {stats.pendingBookings}
          </div>
          <p className="text-gray-600 mt-2">Pending Approval</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <Link
            href="/dashboard/owner/turfs"
            className="btn btn-primary flex-1"
          >
            🏟️ View My Turfs
          </Link>
          <Link
            href="/dashboard/owner/turfs?action=add"
            className="btn btn-secondary flex-1"
          >
            ➕ Add New Turf
          </Link>
          <Link
            href="/dashboard/owner/bookings"
            className="btn btn-secondary flex-1"
          >
            📅 View Bookings
          </Link>
        </div>
      </div>

      {/* Recent Turfs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Your Turfs</h2>

        {turfsLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : turfs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No turfs yet. Create your first turf to get started!</p>
            <Link
              href="/dashboard/owner/turfs?action=add"
              className="btn btn-primary mt-4 inline-block"
            >
              Add Turf
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turfs.map((turf) => (
              <Link
                key={turf.id}
                href={`/dashboard/owner/turfs/${turf.id}`}
                className="card-hover"
              >
                <h3 className="font-bold text-lg mb-2">{turf.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{turf.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    ₹{turf.price_per_slot}/slot
                  </span>
                  <span
                    className={`badge ${turf.is_active === "active" ? "badge-success" : "badge-danger"}`}
                  >
                    {turf.is_active}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

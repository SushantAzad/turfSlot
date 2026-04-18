"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserBookings } from "@/hooks/useData";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { bookings, isLoading } = useUserBookings(user?.id || "");

  const stats = {
    totalBookings: bookings.length,
    approvedBookings: bookings.filter((b) => b.status === "approved").length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.full_name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">Find and book your favorite turfs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalBookings}
          </div>
          <p className="text-gray-600 mt-2">Total Bookings</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-3xl font-bold text-green-600">
            {stats.approvedBookings}
          </div>
          <p className="text-gray-600 mt-2">Confirmed</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-3xl font-bold text-orange-600">
            {stats.pendingBookings}
          </div>
          <p className="text-gray-600 mt-2">Pending</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <Link
            href="/dashboard/user/browse"
            className="btn btn-primary flex-1"
          >
            🏟️ Browse Turfs
          </Link>
          <Link
            href="/dashboard/user/bookings"
            className="btn btn-secondary flex-1"
          >
            📅 View My Bookings
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No bookings yet. Start by browsing available turfs!</p>
            <Link
              href="/dashboard/user/browse"
              className="btn btn-primary mt-4 inline-block"
            >
              Browse Turfs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{booking.turf?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(
                      booking.slot?.slot_date || "",
                    ).toLocaleDateString()}{" "}
                    at {booking.slot?.start_time}
                  </p>
                </div>
                <span
                  className={`badge ${
                    booking.status === "approved"
                      ? "badge-success"
                      : booking.status === "pending"
                        ? "badge-warning"
                        : "badge-danger"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
            {bookings.length > 5 && (
              <Link
                href="/dashboard/user/bookings"
                className="text-blue-600 font-medium hover:underline text-center block mt-4"
              >
                View All Bookings →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerTurfs } from "@/hooks/useData";
import { bookingQueries } from "@/lib/supabase/queries";
import type { Booking } from "@/types";
import toast from "react-hot-toast";

export default function OwnerBookingsPage() {
  const { user } = useAuth();
  const { turfs, isLoading: turfsLoading } = useOwnerTurfs(user?.id || "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  React.useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        const allBookings: Booking[] = [];

        for (const turf of turfs) {
          const turfBookings = await bookingQueries.getTurfBookings(turf.id);
          allBookings.push(...turfBookings);
        }

        setBookings(allBookings);
      } catch (err: any) {
        toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    if (turfs.length > 0) {
      loadBookings();
    } else if (!turfsLoading) {
      setIsLoading(false);
    }
  }, [turfs, turfsLoading]);

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const handleApprove = async (bookingId: string) => {
    try {
      await bookingQueries.updateStatus(bookingId, "approved");
      toast.success("Booking approved!");

      // Refresh bookings
      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "approved" as const } : b,
      );
      setBookings(updated);
    } catch (err) {
      toast.error("Failed to approve booking");
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await bookingQueries.updateStatus(bookingId, "rejected");
      toast.success("Booking rejected!");

      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "rejected" as const } : b,
      );
      setBookings(updated);
    } catch (err) {
      toast.error("Failed to reject booking");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Booking Requests</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {filter === status && ` (${filteredBookings.length})`}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">
            No {filter !== "all" ? filter : ""} bookings yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {booking.turf?.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    <strong>Date:</strong>{" "}
                    {new Date(
                      booking.slot?.slot_date || "",
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <strong>Time:</strong> {booking.slot?.start_time} -{" "}
                    {booking.slot?.end_time}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <strong>Player:</strong>{" "}
                    {booking.user?.full_name || booking.user?.email}
                  </p>
                  <p className="text-gray-600">
                    <strong>Price:</strong> ₹{booking.total_price}
                  </p>
                </div>

                <div>
                  <p className="mb-4">
                    <span
                      className={`badge ${
                        booking.status === "approved"
                          ? "badge-success"
                          : booking.status === "rejected"
                            ? "badge-danger"
                            : booking.status === "pending"
                              ? "badge-warning"
                              : "badge-primary"
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </p>

                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(booking.id)}
                        className="btn btn-success flex-1"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="btn btn-danger flex-1"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

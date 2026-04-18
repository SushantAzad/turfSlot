"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { bookingQueries } from "@/lib/supabase/queries";
import type { Booking } from "@/types";
import toast from "react-hot-toast";

export default function UserBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async (userId: string) => {
    try {
      setIsLoading(true);
      const data = await bookingQueries.getUserBookings(userId);
      setBookings(data);
    } catch (err: any) {
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBookings(user.id);
    }
  }, [user?.id]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingQueries.cancel(bookingId, "User cancelled");
      toast.success("Booking cancelled successfully!");
      if (user?.id) await fetchBookings(user.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const groupedBookings = {
    approved: bookings.filter((b) => b.status === "approved"),
    pending: bookings.filter((b) => b.status === "pending"),
    rejected: bookings.filter((b) => b.status === "rejected"),
    cancelled: bookings.filter((b) => b.status === "cancelled"),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Bookings</h1>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">
            No bookings yet. Browse and book a turf!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Approved Bookings */}
          {groupedBookings.approved.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                ✓ Confirmed Bookings ({groupedBookings.approved.length})
              </h2>
              <div className="space-y-4">
                {groupedBookings.approved.map((booking) => (
                  <div key={booking.id} className="card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {booking.turf?.name}
                        </h3>
                        <p className="text-gray-600">
                          📍 {booking.turf?.location}
                        </p>
                        <p className="text-gray-600 mt-2">
                          📅{" "}
                          {new Date(
                            booking.slot?.slot_date || "",
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          🕒 {booking.slot?.start_time} -{" "}
                          {booking.slot?.end_time}
                        </p>
                      </div>

                      <div>
                        <p className="text-lg font-bold text-blue-600 mb-2">
                          ₹{booking.total_price}
                        </p>
                        <span className="badge badge-success mb-4 block">
                          CONFIRMED
                        </span>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn btn-danger w-full"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Bookings */}
          {groupedBookings.pending.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">
                ⏳ Pending Approval ({groupedBookings.pending.length})
              </h2>
              <div className="space-y-4">
                {groupedBookings.pending.map((booking) => (
                  <div key={booking.id} className="card opacity-75">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {booking.turf?.name}
                        </h3>
                        <p className="text-gray-600">
                          📍 {booking.turf?.location}
                        </p>
                        <p className="text-gray-600 mt-2">
                          📅{" "}
                          {new Date(
                            booking.slot?.slot_date || "",
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          🕒 {booking.slot?.start_time} -{" "}
                          {booking.slot?.end_time}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 mb-2">
                          Awaiting turf owner approval...
                        </p>
                        <span className="badge badge-warning mb-4 block">
                          PENDING
                        </span>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn btn-secondary w-full"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Bookings */}
          {groupedBookings.rejected.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-red-600">
                ✕ Rejected ({groupedBookings.rejected.length})
              </h2>
              <div className="space-y-4">
                {groupedBookings.rejected.map((booking) => (
                  <div key={booking.id} className="card opacity-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {booking.turf?.name}
                        </h3>
                        <p className="text-gray-600">
                          📍 {booking.turf?.location}
                        </p>
                        <p className="text-gray-600 mt-2">
                          📅{" "}
                          {new Date(
                            booking.slot?.slot_date || "",
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <span className="badge badge-danger block">
                          REJECTED
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

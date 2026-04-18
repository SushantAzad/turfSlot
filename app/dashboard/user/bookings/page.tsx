"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { bookingQueries, matchmakingQueries } from "@/lib/supabase/queries";
import type { Booking } from "@/types";
import toast from "react-hot-toast";

// ---- Host Match Modal ----
function HostMatchModal({
  booking,
  onClose,
  onSuccess,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [totalSpots, setTotalSpots] = useState(6);
  const [splitFee, setSplitFee] = useState<number>(
    booking.turf?.price_per_slot
      ? Math.ceil(booking.turf.price_per_slot / 6)
      : 100
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSpots < 1 || splitFee < 0) {
      toast.error("Please fill in valid values.");
      return;
    }
    try {
      setIsSubmitting(true);
      await matchmakingQueries.createOpenGame({
        booking_id: booking.id,
        turf_id: booking.turf_id,
        host_id: booking.user_id,
        total_spots: totalSpots,
        split_fee: splitFee,
      });
      toast.success("Open Game created! Others can now join your match. 🎉");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to create open game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Host an Open Game 🫂</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Set how many players you need and a fair split cost. Others on the
          platform can browse your match and join!
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm border border-gray-100">
          <p className="font-semibold">{booking.turf?.name}</p>
          <p className="text-gray-500">
            📅{" "}
            {new Date(booking.slot?.slot_date || "").toLocaleDateString()} ·
            🕒 {booking.slot?.start_time} – {booking.slot?.end_time}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Players needed (spots to open)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={totalSpots}
              onChange={(e) => setTotalSpots(Number(e.target.value))}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Excluding yourself. e.g. 6 means you need 6 more players.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Split fee per player (₹)
            </label>
            <input
              type="number"
              min={0}
              value={splitFee}
              onChange={(e) => setSplitFee(Number(e.target.value))}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Suggested: ₹
              {booking.turf?.price_per_slot
                ? Math.ceil(booking.turf.price_per_slot / (totalSpots + 1))
                : "—"}{" "}
              (even split including you)
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full mt-2"
          >
            {isSubmitting ? "Creating..." : "Create Open Game"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function UserBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hostingBooking, setHostingBooking] = useState<Booking | null>(null);

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
    } else {
      setIsLoading(false);
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

      {/* Host Match Modal */}
      {hostingBooking && (
        <HostMatchModal
          booking={hostingBooking}
          onClose={() => setHostingBooking(null)}
          onSuccess={() => setHostingBooking(null)}
        />
      )}

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
                        {booking.turf?.owner?.phone_number && (
                          <p className="text-gray-600 mt-1">
                            📞 Contact: {booking.turf.owner.phone_number}
                          </p>
                        )}
                        <p className="text-gray-600 mt-2">
                          📅{" "}
                          {new Date(
                            booking.slot?.slot_date || "",
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          🕒 {booking.slot?.start_time} –{" "}
                          {booking.slot?.end_time}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold text-blue-600">
                          ₹{booking.total_price}
                        </p>
                        <span className="badge badge-success block">
                          CONFIRMED
                        </span>
                        <button
                          onClick={() => setHostingBooking(booking)}
                          className="btn w-full"
                          style={{
                            background:
                              "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "white",
                          }}
                        >
                          🫂 Host Open Game
                        </button>
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
                        {booking.turf?.owner?.phone_number && (
                          <p className="text-gray-600 mt-1">
                            📞 Contact: {booking.turf.owner.phone_number}
                          </p>
                        )}
                        <p className="text-gray-600 mt-2">
                          📅{" "}
                          {new Date(
                            booking.slot?.slot_date || "",
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          🕒 {booking.slot?.start_time} –{" "}
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
                        {booking.turf?.owner?.phone_number && (
                          <p className="text-gray-600 mt-1">
                            📞 Contact: {booking.turf.owner.phone_number}
                          </p>
                        )}
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

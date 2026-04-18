"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTurf } from "@/hooks/useData";
import { slotQueries, bookingQueries } from "@/lib/supabase/queries";
import type { AvailabilitySlot } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export default function TurfDetailPage() {
  const params = useParams();
  const turfId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const { turf, isLoading: turfLoading } = useTurf(turfId);

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  // Fetch slots whenever date or turf changes
  useEffect(() => {
    if (!turfId || !selectedDate) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const data = await slotQueries.getByTurfAndDate(turfId, selectedDate);
        setSlots(data);
      } catch (err) {
        toast.error("Failed to load slots");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [turfId, selectedDate]);

  const handleBook = async (slotId: string) => {
    if (!user) {
      toast.error("Please log in to book a slot");
      router.push("/auth/login");
      return;
    }

    setBookingSlotId(slotId);
    try {
      await bookingQueries.create({
        slot_id: slotId,
        turf_id: turfId,
        user_id: user.id,
        notes: notes || undefined,
      });

      toast.success("Booking request submitted! Awaiting owner approval.");
      // Refresh slots to show updated booked status
      const updated = await slotQueries.getByTurfAndDate(turfId, selectedDate);
      setSlots(updated);
      setShowConfirm(null);
      setNotes("");

      setTimeout(() => {
        router.push("/dashboard/user/bookings");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setBookingSlotId(null);
    }
  };

  if (turfLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500 text-xl mb-4">Turf not found.</p>
        <Link href="/dashboard/user/browse" className="btn btn-primary">
          Back to Browse
        </Link>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => !s.is_booked);
  const bookedSlots = slots.filter((s) => s.is_booked);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/user/browse"
        className="inline-flex items-center text-blue-600 hover:underline text-sm"
      >
        ← Back to Browse
      </Link>

      {/* Turf Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{turf.name}</h1>
            <p className="text-gray-500 mt-1">📍 {turf.location}</p>
            {turf.description && (
              <p className="text-gray-600 mt-3 max-w-xl">{turf.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-blue-600">
              ₹{turf.price_per_slot}
            </div>
            <p className="text-gray-500 text-sm">per slot</p>
          </div>
        </div>

        {/* Turf Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          {turf.surface_type && (
            <div className="text-center">
              <div className="text-2xl mb-1">🌿</div>
              <p className="text-xs text-gray-500">Surface</p>
              <p className="font-medium capitalize">{turf.surface_type}</p>
            </div>
          )}
          {turf.capacity && (
            <div className="text-center">
              <div className="text-2xl mb-1">👥</div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className="font-medium">{turf.capacity} players</p>
            </div>
          )}
          {turf.slot_duration_minutes && (
            <div className="text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-xs text-gray-500">Slot Duration</p>
              <p className="font-medium">{turf.slot_duration_minutes} min</p>
            </div>
          )}
          {turf.opening_time && turf.closing_time && (
            <div className="text-center">
              <div className="text-2xl mb-1">🕐</div>
              <p className="text-xs text-gray-500">Hours</p>
              <p className="font-medium">
                {turf.opening_time} – {turf.closing_time}
              </p>
            </div>
          )}
        </div>

        {/* Amenities */}
        {turf.amenities && turf.amenities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {turf.amenities.map((a, i) => (
                <span key={i} className="badge badge-primary">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Select a Date</h2>
        <input
          type="date"
          value={selectedDate}
          min={getTodayString()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input max-w-xs"
        />
        {selectedDate && (
          <p className="text-gray-500 text-sm mt-2">{formatDate(selectedDate)}</p>
        )}
      </div>

      {/* Slots */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">
          Available Slots
          {!slotsLoading && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({availableSlots.length} available)
            </span>
          )}
        </h2>

        {slotsLoading ? (
          <div className="flex justify-center py-10">
            <div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p>No slots available for this date.</p>
            <p className="text-sm mt-1">Try selecting a different date.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Available Slots */}
            {availableSlots.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">
                  ✓ Available
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <div key={slot.id}>
                      <button
                        onClick={() =>
                          setShowConfirm(showConfirm === slot.id ? null : slot.id)
                        }
                        className="w-full text-left p-3 rounded-lg border-2 border-green-400 bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <div className="font-semibold text-green-800">
                          {slot.start_time}
                        </div>
                        <div className="text-xs text-green-600">
                          to {slot.end_time}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          ₹{turf.price_per_slot}
                        </div>
                      </button>

                      {/* Inline confirm panel */}
                      {showConfirm === slot.id && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                          <p className="text-sm font-medium text-blue-900">
                            Book {slot.start_time} – {slot.end_time}?
                          </p>
                          <textarea
                            placeholder="Notes (optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBook(slot.id)}
                              disabled={bookingSlotId === slot.id}
                              className="btn btn-primary text-sm flex-1"
                            >
                              {bookingSlotId === slot.id
                                ? "Booking..."
                                : "Confirm Book"}
                            </button>
                            <button
                              onClick={() => setShowConfirm(null)}
                              className="btn btn-secondary text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Already Booked Slots */}
            {bookedSlots.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  ✗ Already Booked
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {bookedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                    >
                      <div className="font-semibold text-gray-500">
                        {slot.start_time}
                      </div>
                      <div className="text-xs text-gray-400">
                        to {slot.end_time}
                      </div>
                      <div className="text-xs text-red-400 font-medium mt-1">
                        Booked
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

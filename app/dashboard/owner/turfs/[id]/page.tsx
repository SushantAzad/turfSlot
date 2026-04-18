"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTurf } from "@/hooks/useData";
import { analyticsQueries } from "@/lib/supabase/queries";
import Link from "next/link";

export default function OwnerTurfDetailPage() {
  const params = useParams();
  const turfId = params.id as string;
  const { user } = useAuth();
  const { turf, isLoading: turfLoading } = useTurf(turfId);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!turfId) return;
    const fetchAnalytics = async () => {
      const data = await analyticsQueries.getTurfAnalytics(turfId);
      setAnalytics(data);
    };
    fetchAnalytics();
  }, [turfId]);

  if (turfLoading) {
    return (
      <div className="flex items-center justify-center min-vh-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!turf || (user && turf.owner_id !== user.id)) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500 text-xl mb-4">Turf not found or unauthorized.</p>
        <Link href="/dashboard/owner/turfs" className="btn btn-primary">
          Back to Turfs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/dashboard/owner/turfs" className="inline-flex items-center text-blue-600 hover:underline text-sm">
        ← Back to My Turfs
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{turf.name}</h1>
            <p className="text-gray-500 mt-1">📍 {turf.location}</p>
            {turf.description && <p className="text-gray-600 mt-3 max-w-xl">{turf.description}</p>}
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-blue-600">₹{turf.price_per_slot}</div>
            <p className="text-gray-500 text-sm">per slot</p>
          </div>
        </div>

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
              <p className="font-medium">{turf.opening_time} – {turf.closing_time}</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex gap-4">
            <Link href="/dashboard/owner/slots" className="btn btn-primary flex-1 text-center">Manage Availability Slots</Link>
            <Link href="/dashboard/owner/bookings" className="btn btn-secondary flex-1 text-center">View Bookings</Link>
        </div>
      </div>
      
      {analytics && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Quick Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-blue-600 mb-1">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {analytics.total_bookings}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm font-medium text-green-600 mb-1">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-green-900">
                ₹{analytics.total_revenue}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm font-medium text-purple-600 mb-1">
                Average Rating
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {analytics.average_rating || "N/A"} ⭐
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

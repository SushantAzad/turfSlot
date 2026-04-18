"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerTurfs } from "@/hooks/useData";
import { analyticsQueries } from "@/lib/supabase/queries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OwnerAnalyticsPage() {
  const { user } = useAuth();
  const { turfs, isLoading: turfsLoading } = useOwnerTurfs(user?.id || "");
  const [revenueData, setRevenueData] = React.useState<any[]>([]);
  const [selectedTurfId, setSelectedTurfId] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        if (selectedTurfId || turfs.length > 0) {
          const turfId = selectedTurfId || turfs[0]?.id;
          if (turfId) {
            const stats = await analyticsQueries.getTurfRevenueStats(turfId);
            setRevenueData(stats || []);
          }
        }
      } catch (err) {
        console.error("Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedTurfId, turfs]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics & Reports</h1>

      {/* Turf Selector */}
      {turfs.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Turf
          </label>
          <select
            value={selectedTurfId}
            onChange={(e) => setSelectedTurfId(e.target.value)}
            className="input"
          >
            <option value="">All Turfs</option>
            {turfs.map((turf) => (
              <option key={turf.id} value={turf.id}>
                {turf.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No analytics data available yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total_revenue"
                stroke="#3b82f6"
                name="Revenue (₹)"
              />
              <Line
                type="monotone"
                dataKey="total_bookings"
                stroke="#10b981"
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

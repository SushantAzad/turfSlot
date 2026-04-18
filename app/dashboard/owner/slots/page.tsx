"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerTurfs } from "@/hooks/useData";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function SlotsPage() {
  const { user } = useAuth();
  const { turfs, isLoading: turfsLoading } = useOwnerTurfs(user?.id || "");

  const [selectedTurf, setSelectedTurf] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    slot_date: "",
    start_time: "",
    end_time: "",
    duration_minutes: 60,
  });
  const [bulkData, setBulkData] = useState({
    start_date: "",
    end_date: "",
    start_time: "09:00",
    end_time: "17:00",
    interval_minutes: 60,
  });
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch slots for selected turf
  const fetchSlots = async () => {
    if (!selectedTurf) return;

    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("turf_id", selectedTurf)
      .order("slot_date", { ascending: true });

    if (error) {
      toast.error("Failed to fetch slots");
      return;
    }
    setSlots(data || []);
  };

  useEffect(() => {
    if (selectedTurf) {
      fetchSlots();
    }
  }, [selectedTurf]);

  // Create single slot
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slot_date || !formData.start_time || !formData.end_time) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("availability_slots")
        .insert([
          {
            turf_id: selectedTurf,
            slot_date: formData.slot_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
          },
        ])
        .select();

      if (error) throw error;

      toast.success("Slot created successfully!");
      setFormData({
        slot_date: "",
        start_time: "",
        end_time: "",
        duration_minutes: 60,
      });
      fetchSlots();
    } catch (error: any) {
      toast.error(error.message || "Failed to create slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create bulk slots
  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !bulkData.start_date ||
      !bulkData.end_date ||
      !bulkData.start_time ||
      !bulkData.end_time
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const slots = [];
      const startDate = new Date(bulkData.start_date);
      const endDate = new Date(bulkData.end_date);

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];

        // Generate time slots
        let currentTime = bulkData.start_time;
        while (currentTime < bulkData.end_time) {
          const [hours, mins] = currentTime.split(":").map(Number);
          const endHours = Math.floor(
            (hours * 60 + mins + bulkData.interval_minutes) / 60,
          );
          const endMins = (hours * 60 + mins + bulkData.interval_minutes) % 60;
          const endTimeStr = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

          slots.push({
            turf_id: selectedTurf,
            slot_date: dateStr,
            start_time: currentTime,
            end_time: endTimeStr,
          });

          currentTime = endTimeStr;
        }
      }

      if (slots.length === 0) {
        toast.error("No slots to create");
        return;
      }

      const { error } = await supabase.from("availability_slots").insert(slots);

      if (error) throw error;

      toast.success(`${slots.length} slots created successfully!`);
      setBulkData({
        start_date: "",
        end_date: "",
        start_time: "09:00",
        end_time: "17:00",
        interval_minutes: 60,
      });
      setShowBulkForm(false);
      fetchSlots();
    } catch (error: any) {
      toast.error(error.message || "Failed to create slots");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const { error } = await supabase
        .from("availability_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      toast.success("Slot deleted");
      fetchSlots();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete slot");
    }
  };

  if (turfsLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!turfs || turfs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">
          No turfs found. Create a turf first.
        </p>
        <a href="/dashboard/owner/turfs" className="btn btn-primary">
          Create Turf
        </a>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Slots</h1>
        <p className="text-gray-600">
          Create and manage booking slots for your turfs
        </p>
      </div>

      {/* Turf Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">Select Turf</label>
        <select
          value={selectedTurf}
          onChange={(e) => setSelectedTurf(e.target.value)}
          className="input w-full"
        >
          <option value="">-- Choose a turf --</option>
          {turfs.map((turf) => (
            <option key={turf.id} value={turf.id}>
              {turf.name} - {turf.location}
            </option>
          ))}
        </select>
      </div>

      {selectedTurf && (
        <>
          {/* Form Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowBulkForm(false)}
              className={`px-4 py-2 rounded ${
                !showBulkForm ? "btn-primary" : "btn"
              }`}
            >
              Single Slot
            </button>
            <button
              onClick={() => setShowBulkForm(true)}
              className={`px-4 py-2 rounded ${
                showBulkForm ? "btn-primary" : "btn"
              }`}
            >
              Bulk Create
            </button>
          </div>

          {/* Single Slot Form */}
          {!showBulkForm && (
            <form
              onSubmit={handleCreateSlot}
              className="bg-white p-6 rounded-lg shadow mb-8"
            >
              <h2 className="text-xl font-bold mb-4">Create Single Slot</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.slot_date}
                    onChange={(e) =>
                      setFormData({ ...formData, slot_date: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? "Creating..." : "Create Slot"}
              </button>
            </form>
          )}

          {/* Bulk Create Form */}
          {showBulkForm && (
            <form
              onSubmit={handleBulkCreate}
              className="bg-white p-6 rounded-lg shadow mb-8"
            >
              <h2 className="text-xl font-bold mb-4">Create Multiple Slots</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={bulkData.start_date}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, start_date: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={bulkData.end_date}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, end_date: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bulkData.start_time}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, start_time: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={bulkData.end_time}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, end_time: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interval (minutes)
                  </label>
                  <select
                    value={bulkData.interval_minutes}
                    onChange={(e) =>
                      setBulkData({
                        ...bulkData,
                        interval_minutes: Number(e.target.value),
                      })
                    }
                    className="input w-full"
                  >
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? "Creating..." : "Create All Slots"}
              </button>
            </form>
          )}

          {/* Slots List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                Available Slots ({slots.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No slots created yet
                      </td>
                    </tr>
                  ) : (
                    slots.map((slot) => (
                      <tr key={slot.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {new Date(slot.slot_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {slot.start_time} - {slot.end_time}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${
                              slot.is_booked ? "badge-danger" : "badge-success"
                            }`}
                          >
                            {slot.is_booked ? "Booked" : "Available"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {!slot.is_booked && (
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

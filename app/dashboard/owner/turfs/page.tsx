"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerTurfs } from "@/hooks/useData";
import { turfQueries } from "@/lib/supabase/queries";
import { CreateTurfDTO, TurfStatus } from "@/types";
import { TurfSchema } from "@/lib/validation";
import toast from "react-hot-toast";
import { ZodError } from "zod";

export default function OwnerTurfsPage() {
  const { user } = useAuth();
  const { turfs, isLoading, refetch } = useOwnerTurfs(user?.id || "");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateTurfDTO>({
    name: "",
    location: "",
    price_per_slot: 0,
    description: "",
    surface_type: "grass",
    capacity: 10,
    amenities: [],
    opening_time: "09:00",
    closing_time: "22:00",
    slot_duration_minutes: 60,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price_per_slot" ||
        name === "capacity" ||
        name === "slot_duration_minutes"
          ? Number(value)
          : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      TurfSchema.parse(formData);

      setIsSubmitting(true);

      if (editingId) {
        // Update turf
        await turfQueries.update(editingId, formData);
        toast.success("Turf updated successfully!");
      } else {
        // Create turf
        await turfQueries.create(user?.id || "", formData);
        toast.success("Turf created successfully!");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        location: "",
        price_per_slot: 0,
        description: "",
        surface_type: "grass",
        capacity: 10,
        amenities: [],
        opening_time: "09:00",
        closing_time: "22:00",
        slot_duration_minutes: 60,
      });

      refetch();
    } catch (err) {
      if (err instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path) {
            newErrors[error.path[0]] = error.message;
          }
        });
        setFormErrors(newErrors);
      } else {
        toast.error("Failed to save turf");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Turfs</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              location: "",
              price_per_slot: 0,
              description: "",
              surface_type: "grass",
              capacity: 10,
              amenities: [],
              opening_time: "09:00",
              closing_time: "22:00",
              slot_duration_minutes: 60,
            });
          }}
          className="btn btn-primary"
        >
          ➕ Add New Turf
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Turf Name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="Address"
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Slot (₹)
                </label>
                <input
                  type="number"
                  name="price_per_slot"
                  value={formData.price_per_slot}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
                {formErrors.price_per_slot && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.price_per_slot}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface Type
                </label>
                <select
                  name="surface_type"
                  value={formData.surface_type}
                  onChange={handleChange}
                  className="input"
                >
                  <option>grass</option>
                  <option>astroturf</option>
                  <option>concrete</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slot Duration (minutes)
                </label>
                <input
                  type="number"
                  name="slot_duration_minutes"
                  value={formData.slot_duration_minutes}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Time
                </label>
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Time
                </label>
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Describe your turf..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? "Saving..." : "Save Turf"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Turfs List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : turfs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No turfs created yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary mt-4 inline-block"
          >
            Create Your First Turf
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turfs.map((turf) => (
            <div key={turf.id} className="card">
              <h3 className="text-xl font-bold mb-2">{turf.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{turf.location}</p>

              <div className="space-y-2 mb-4 text-sm">
                <p>
                  <strong>Price:</strong> ₹{turf.price_per_slot}/slot
                </p>
                <p>
                  <strong>Surface:</strong> {turf.surface_type}
                </p>
                <p>
                  <strong>Capacity:</strong> {turf.capacity} players
                </p>
                <p>
                  <strong>Hours:</strong> {turf.opening_time} -{" "}
                  {turf.closing_time}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/owner/turfs/${turf.id}`}
                  className="btn btn-primary flex-1 text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => {
                    setEditingId(turf.id);
                    setFormData({
                      name: turf.name,
                      location: turf.location,
                      price_per_slot: turf.price_per_slot,
                      description: turf.description,
                      surface_type: turf.surface_type,
                      capacity: turf.capacity,
                      amenities: turf.amenities,
                      opening_time: turf.opening_time,
                      closing_time: turf.closing_time,
                      slot_duration_minutes: turf.slot_duration_minutes,
                    });
                    setShowForm(true);
                  }}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

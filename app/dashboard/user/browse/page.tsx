"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTurfs } from "@/hooks/useData";

export default function BrowseTurfsPage() {
  const router = useRouter();
  const { turfs, isLoading } = useTurfs();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    surfaceType: "",
  });

  const filteredTurfs = useMemo(() => {
    return turfs.filter((turf) => {
      const matchesSearch =
        turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        turf.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPrice =
        turf.price_per_slot >= selectedFilters.minPrice &&
        turf.price_per_slot <= selectedFilters.maxPrice;

      const matchesSurface =
        selectedFilters.surfaceType === "" ||
        turf.surface_type === selectedFilters.surfaceType;

      return matchesSearch && matchesPrice && matchesSurface;
    });
  }, [turfs, searchQuery, selectedFilters]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Browse Turfs</h1>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price (₹)
            </label>
            <input
              type="number"
              value={selectedFilters.minPrice}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  minPrice: Number(e.target.value),
                }))
              }
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price (₹)
            </label>
            <input
              type="number"
              value={selectedFilters.maxPrice}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  maxPrice: Number(e.target.value),
                }))
              }
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surface Type
            </label>
            <select
              value={selectedFilters.surfaceType}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  surfaceType: e.target.value,
                }))
              }
              className="input"
            >
              <option value="">All Types</option>
              <option value="grass">Grass</option>
              <option value="astroturf">Astroturf</option>
              <option value="concrete">Concrete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Turfs Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredTurfs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">
            No turfs found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTurfs.map((turf) => (
            <div key={turf.id} className="card-hover group">
              {turf.images_urls && turf.images_urls.length > 0 && (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={turf.images_urls[0]}
                    alt={turf.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{turf.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{turf.location}</p>

              <div className="space-y-2 mb-4 text-sm">
                <p>
                  <strong>Price:</strong> ₹{turf.price_per_slot}/slot
                </p>
                <p>
                  <strong>Surface:</strong> {turf.surface_type}
                </p>
                {turf.capacity && (
                  <p>
                    <strong>Capacity:</strong> {turf.capacity} players
                  </p>
                )}
                {turf.opening_time && turf.closing_time && (
                  <p>
                    <strong>Hours:</strong> {turf.opening_time} -{" "}
                    {turf.closing_time}
                  </p>
                )}
                {turf.owner?.phone_number && (
                  <p>
                    <strong>Contact:</strong> {turf.owner.phone_number}
                  </p>
                )}
              </div>

              {turf.amenities && turf.amenities.length > 0 && (
                <div className="mb-4">
                  <strong className="text-sm">Amenities:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {turf.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="badge badge-primary text-xs">
                        {amenity}
                      </span>
                    ))}
                    {turf.amenities.length > 3 && (
                      <span className="badge badge-primary text-xs">
                        +{turf.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  router.push(`/dashboard/user/turfs/${turf.id}`);
                }}
                className="btn btn-primary w-full"
              >
                View & Book Slots
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

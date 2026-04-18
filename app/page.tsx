"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "turf_owner") {
        router.push("/dashboard/owner");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner z-10"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container flex items-center justify-between h-16">
          <div className="text-2xl font-bold text-blue-600">TurfSlot</div>
          <div className="space-x-4">
            <Link href="/auth/login" className="btn btn-secondary">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Book Your Favorite Turf
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Find and book the perfect sports venue for your game. Browse available
          slots, make instant bookings, and enjoy seamless scheduling.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/auth/signup?role=user"
            className="btn btn-primary btn-lg"
          >
            Book a Slot
          </Link>
          <Link
            href="/auth/signup?role=turf_owner"
            className="btn btn-secondary btn-lg"
          >
            Add Your Turf
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose TurfSlot?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🏟️</div>
              <h3 className="text-xl font-bold mb-2">Easy Browsing</h3>
              <p className="text-gray-600">
                Discover and explore turfs near you with detailed information
                and real-time availability.
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Instant Booking</h3>
              <p className="text-gray-600">
                Request bookings in seconds and get instant confirmations from
                turf owners.
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Reliable Platform</h3>
              <p className="text-gray-600">
                Secure payments, transparent pricing, and 24/7 customer support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p>Turfs Available</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <p>Happy Players</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <p>Bookings Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of players and turf owners on TurfSlot today.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/login" className="btn btn-primary btn-lg">
            Login Now
          </Link>
          <Link href="/auth/signup" className="btn btn-secondary btn-lg">
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container text-center">
          <p>&copy; 2024 TurfSlot. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

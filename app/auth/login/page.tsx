"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthMutations } from "@/hooks/useAuth";
import { LoginSchema } from "@/lib/validation";
import { ZodError } from "zod";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthMutations();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      LoginSchema.parse(formData);

      // Login
      const result = await login(formData.email, formData.password);

      if (result.error) {
        toast.error(result.error);
      } else if (!result.user) {
        toast.error("Login failed: User profile not found");
      } else {
        toast.success("Login successful!");
        // Redirect based on role - add small delay to ensure session is set
        setTimeout(() => {
          if (result.user?.role === "turf_owner") {
            router.push("/dashboard/owner");
          } else if (result.user?.role === "user") {
            router.push("/dashboard/user");
          } else {
            toast.error("Invalid user role");
            router.push("/auth/login");
          }
        }, 500);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path) {
            newErrors[error.path[0]] = error.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TurfSlot</h1>
        <p className="text-gray-600 mt-2">Sign In to Your Account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="input"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="input"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {authError === "Email not confirmed" ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Verify Your Email</p>
            A confirmation email was sent to your inbox when you signed up. Please click the link inside to verify your account before signing in.
          </div>
        ) : authError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {authError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <span className="loading-spinner mr-2"></span>
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="text-blue-600 text-sm hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

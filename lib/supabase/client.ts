import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials in environment variables");
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = () => {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      },
    },
  );
};

// Export types for use throughout the app
export type Database = any; // You can generate this from Supabase

// Supabase table names
export const TABLES = {
  USERS: "users",
  TURFS: "turfs",
  AVAILABILITY_SLOTS: "availability_slots",
  BOOKINGS: "bookings",
  REVIEWS: "reviews",
  PAYMENT_RECORDS: "payment_records",
  NOTIFICATIONS: "notifications",
  ANALYTICS: "analytics",
  AUDIT_LOGS: "audit_logs",
} as const;

// RLS policies
export const RLS_POLICIES = {
  READ_OWN: "read_own_records",
  READ_ALL: "read_all_records",
  WRITE_OWN: "write_own_records",
  ADMIN: "admin_only",
} as const;

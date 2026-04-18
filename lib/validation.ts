import { z } from "zod";

// Auth validation schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["turf_owner", "user"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Turf validation schemas
export const TurfSchema = z.object({
  name: z.string().min(3, "Turf name must be at least 3 characters"),
  description: z.string().max(1000, "Description too long").optional(),
  location: z.string().min(5, "Location must be valid"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price_per_slot: z.number().min(0, "Price must be positive"),
  surface_type: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  amenities: z.array(z.string()).optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  slot_duration_minutes: z
    .number()
    .min(15, "Minimum slot duration is 15 minutes")
    .default(60),
  contact_number: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Contact number must be 10–15 digits")
    .optional()
    .or(z.literal("")),
});

export type TurfInput = z.infer<typeof TurfSchema>;

// Slot validation schemas
export const SlotSchema = z
  .object({
    slot_date: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type SlotInput = z.infer<typeof SlotSchema>;

// Booking validation schemas
export const BookingSchema = z.object({
  slot_id: z.string().uuid("Invalid slot ID"),
  turf_id: z.string().uuid("Invalid turf ID"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

// Booking update schema
export const BookingUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "cancelled"]),
  notes: z.string().max(500).optional(),
  cancellation_reason: z.string().max(500).optional(),
});

export type BookingUpdateInput = z.infer<typeof BookingUpdateSchema>;

// Review validation schemas
export const ReviewSchema = z.object({
  booking_id: z.string().uuid("Invalid booking ID"),
  turf_id: z.string().uuid("Invalid turf ID"),
  rating: z
    .number()
    .min(1, "Minimum rating is 1")
    .max(5, "Maximum rating is 5"),
  comment: z.string().max(1000, "Comment too long").optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

// Profile update schema
export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone_number: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Invalid phone number")
    .optional(),
  bio: z.string().max(500, "Bio too long").optional(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// Pagination validation
export const PaginationSchema = z.object({
  page: z.number().min(1, "Page must be at least 1").default(1),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// Filter validation
export const TurfFilterSchema = z.object({
  location: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  surface_type: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  capacity: z.number().optional(),
});

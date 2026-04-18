// User roles
export type UserRole = "turf_owner" | "user";

// Booking status
export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

// Turf status
export type TurfStatus = "active" | "inactive" | "archived";

// User type
export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  phone_number?: string;
  profile_picture_url?: string;
  bio?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Turf type
export interface Turf {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price_per_slot: number;
  currency: string;
  surface_type?: string;
  capacity?: number;
  amenities?: string[];
  images_urls?: string[];
  is_active: TurfStatus;
  opening_time?: string;
  closing_time?: string;
  slot_duration_minutes: number;
  contact_number?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: User;
}

// Availability Slot type
export interface AvailabilitySlot {
  id: string;
  turf_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
  updated_at: string;
}

// Booking type
export interface Booking {
  id: string;
  user_id: string;
  turf_id: string;
  slot_id: string;
  status: BookingStatus;
  booking_date: string;
  confirmation_date?: string;
  total_price: number;
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
  turf?: Turf;
  slot?: AvailabilitySlot;
}

// Review type
export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  turf_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

// Payment Record type
export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method?: string;
  transaction_id?: string;
  status: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

// Notification type
export interface Notification {
  id: string;
  user_id: string;
  title?: string;
  message: string;
  booking_id?: string;
  is_read: boolean;
  created_at: string;
}

// Analytics type
export interface Analytics {
  id: string;
  turf_id: string;
  total_bookings: number;
  total_revenue: number;
  average_rating?: number;
  total_reviews: number;
  month: string;
  created_at: string;
  updated_at: string;
}

// Open Games types
export interface OpenGame {
  id: string;
  booking_id: string;
  turf_id: string;
  host_id: string;
  total_spots: number;
  available_spots: number;
  split_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  host?: User;
  turf?: Turf;
  booking?: Booking;
}

export interface OpenGameParticipant {
  id: string;
  open_game_id: string;
  user_id: string;
  payment_status: string;
  created_at: string;
  // Joined data
  user?: User;
}

// Waitlist type
export type WaitlistStatus = "waiting" | "notified";

export interface Waitlist {
  id: string;
  slot_id: string;
  user_id: string;
  status: WaitlistStatus;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Authentication session
export interface AuthSession {
  user?: User;
  isLoading: boolean;
  isError: boolean;
}

// Pagination type
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Filter options
export interface TurfFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  surface_type?: string;
  amenities?: string[];
  hasLights?: boolean;
  capacity?: number;
}

// Create/Update DTOs
export interface CreateTurfDTO {
  name: string;
  description?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price_per_slot: number;
  surface_type?: string;
  capacity?: number;
  amenities?: string[];
  opening_time?: string;
  closing_time?: string;
  slot_duration_minutes?: number;
  contact_number?: string;
}

export interface UpdateTurfDTO extends Partial<CreateTurfDTO> {
  id: string;
}

export interface CreateBookingDTO {
  slot_id: string;
  turf_id: string;
  notes?: string;
}

export interface UpdateBookingDTO {
  id: string;
  status: BookingStatus;
  notes?: string;
}

export interface CreateSlotDTO {
  turf_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
}

export interface CreateReviewDTO {
  booking_id: string;
  turf_id: string;
  rating: number;
  comment?: string;
}

// Error response type
export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}

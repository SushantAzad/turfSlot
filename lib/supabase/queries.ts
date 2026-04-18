import { supabase } from "./client";
import { TABLES } from "./client";
import type {
  User,
  Turf,
  Booking,
  AvailabilitySlot,
  Review,
  CreateTurfDTO,
  CreateBookingDTO,
  BookingStatus,
  CreateSlotDTO,
} from "@/types";

// ============ USER QUERIES ============

export const userQueries = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }
    return data;
  },

  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      return null;
    }
    return data;
  },

  async create(user: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([user])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return null;
    }
    return data;
  },
};

// ============ TURF QUERIES ============

export const turfQueries = {
  async getAll(limit = 20, offset = 0): Promise<Turf[]> {
    const { data, error } = await supabase
      .from(TABLES.TURFS)
      .select("*, owner:users(*)")
      .eq("is_active", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching turfs:", error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Turf | null> {
    const { data, error } = await supabase
      .from(TABLES.TURFS)
      .select("*, owner:users(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching turf:", error);
      return null;
    }
    return data;
  },

  async getByOwnerId(ownerId: string): Promise<Turf[]> {
    const { data, error } = await supabase
      .from(TABLES.TURFS)
      .select("*, owner:users(*)")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching owner turfs:", error);
      return [];
    }
    return data || [];
  },

  async create(ownerId: string, turf: CreateTurfDTO): Promise<Turf | null> {
    const { data, error } = await supabase
      .from(TABLES.TURFS)
      .insert([{ ...turf, owner_id: ownerId, is_active: "active" }])
      .select()
      .single();

    if (error) {
      console.error("Error creating turf:", error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<Turf>): Promise<Turf | null> {
    const { data, error } = await supabase
      .from(TABLES.TURFS)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating turf:", error);
      return null;
    }
    return data;
  },

  async search(query: string, limit = 20): Promise<Turf[]> {
    const { data, error } = await supabase
      .from(TABLES.TURFS)
      .select("*, owner:users(*)")
      .eq("is_active", "active")
      .or(
        `name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`,
      )
      .limit(limit);

    if (error) {
      console.error("Error searching turfs:", error);
      return [];
    }
    return data || [];
  },
};

// ============ SLOT QUERIES ============

export const slotQueries = {
  async getByTurfAndDate(
    turfId: string,
    date: string,
  ): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
      .from(TABLES.AVAILABILITY_SLOTS)
      .select("*")
      .eq("turf_id", turfId)
      .eq("slot_date", date)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching slots:", error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<AvailabilitySlot | null> {
    const { data, error } = await supabase
      .from(TABLES.AVAILABILITY_SLOTS)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return null;
    }
    return data;
  },

  async create(slot: CreateSlotDTO): Promise<AvailabilitySlot | null> {
    const { data, error } = await supabase
      .from(TABLES.AVAILABILITY_SLOTS)
      .insert([slot])
      .select()
      .single();

    if (error) {
      console.error("Error creating slot:", error);
      return null;
    }
    return data;
  },

  async createBulk(slots: CreateSlotDTO[]): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
      .from(TABLES.AVAILABILITY_SLOTS)
      .insert(slots)
      .select();

    if (error) {
      console.error("Error creating slots:", error);
      return [];
    }
    return data || [];
  },

  async getAvailableSlots(
    turfId: string,
    startDate: string,
    endDate: string,
  ): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
      .from(TABLES.AVAILABILITY_SLOTS)
      .select("*")
      .eq("turf_id", turfId)
      .eq("is_booked", false)
      .gte("slot_date", startDate)
      .lte("slot_date", endDate)
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching available slots:", error);
      return [];
    }
    return data || [];
  },
};

// ============ BOOKING QUERIES ============

export const bookingQueries = {
  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from(TABLES.BOOKINGS)
      .select(
        `
        *,
        user:users(*),
        turf:turfs(*),
        slot:availability_slots(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      return null;
    }
    return data;
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(TABLES.BOOKINGS)
      .select(
        `
        *,
        turf:turfs(
          *,
          owner:users(*)
        ),
        slot:availability_slots(*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user bookings:", error);
      return [];
    }
    return data || [];
  },

  async getTurfBookings(turfId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(TABLES.BOOKINGS)
      .select(
        `
        *,
        user:users(*),
        slot:availability_slots(*)
      `,
      )
      .eq("turf_id", turfId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching turf bookings:", error);
      return [];
    }
    return data || [];
  },

  async create(
    booking: CreateBookingDTO & { user_id: string },
  ): Promise<Booking | null> {
    // Check if slot is already booked
    const slot = await slotQueries.getById(booking.slot_id);
    if (!slot || slot.is_booked) {
      throw new Error("Slot is not available");
    }

    // Get turf for pricing
    const turf = await turfQueries.getById(booking.turf_id);
    if (!turf) {
      throw new Error("Turf not found");
    }

    const { data, error } = await supabase
      .from(TABLES.BOOKINGS)
      .insert([
        {
          ...booking,
          status: "pending",
          total_price: turf.price_per_slot,
          booking_date: new Date().toISOString(),
        },
      ])
      .select(
        `
        *,
        user:users(*),
        turf:turfs(*),
        slot:availability_slots(*)
      `,
      )
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      throw error;
    }

    return data;
  },

  async updateStatus(
    bookingId: string,
    status: BookingStatus,
  ): Promise<Booking | null> {
    const confirmationData =
      status === "approved"
        ? { confirmation_date: new Date().toISOString() }
        : {};

    const { data, error } = await supabase
      .from(TABLES.BOOKINGS)
      .update({ status, ...confirmationData })
      .eq("id", bookingId)
      .select(
        `
        *,
        user:users(*),
        turf:turfs(*),
        slot:availability_slots(*)
      `,
      )
      .single();

    if (error) {
      console.error("Error updating booking status:", error);
      return null;
    }

    return data;
  },

  async cancel(bookingId: string, reason: string): Promise<Booking | null> {
    return this.updateStatus(bookingId, "cancelled");
  },
};

// ============ REVIEW QUERIES ============

export const reviewQueries = {
  async getByTurf(turfId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from(TABLES.REVIEWS)
      .select("*")
      .eq("turf_id", turfId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
    return data || [];
  },

  async create(review: Review): Promise<Review | null> {
    const { data, error } = await supabase
      .from(TABLES.REVIEWS)
      .insert([review])
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return null;
    }
    return data;
  },
};

// ============ NOTIFICATION QUERIES ============

export const notificationQueries = {
  async getUserNotifications(userId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from(TABLES.NOTIFICATIONS)
      .update({ is_read: true })
      .eq("id", notificationId);
  },
};

// ============ ANALYTICS QUERIES ============

export const analyticsQueries = {
  async getTurfAnalytics(turfId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from(TABLES.ANALYTICS)
      .select("*")
      .eq("turf_id", turfId)
      .order("month", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error fetching analytics:", error);
      return null;
    }
    // Return the most recent record (first after desc sort)
    return data?.[0] ?? null;
  },

  async getTurfRevenueStats(turfId: string): Promise<any> {
    const { data, error } = await supabase
      .from(TABLES.ANALYTICS)
      .select("month, total_revenue, total_bookings")
      .eq("turf_id", turfId)
      .order("month", { ascending: true });

    if (error) {
      console.error("Error fetching revenue stats:", error);
      return [];
    }
    return data || [];
  },
};

// ============ MATCHMAKING & WAITLIST QUERIES ============

export const matchmakingQueries = {
  // --- Waitlist ---
  async joinWaitlist(slotId: string, userId: string) {
    const { data, error } = await supabase
      .from(TABLES.WAITLISTS)
      .insert([{ slot_id: slotId, user_id: userId, status: "waiting" }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async leaveWaitlist(slotId: string, userId: string) {
    const { error } = await supabase
      .from(TABLES.WAITLISTS)
      .delete()
      .eq("slot_id", slotId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async getWaitlistStatus(slotId: string, userId: string) {
    const { data, error } = await supabase
      .from(TABLES.WAITLISTS)
      .select("*")
      .eq("slot_id", slotId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Waitlist fetch error", error);
    }
    return data;
  },

  // --- Open Games ---
  async createOpenGame(gameData: { booking_id: string; turf_id: string; host_id: string; total_spots: number; split_fee: number }) {
    const { data, error } = await supabase
      .from(TABLES.OPEN_GAMES)
      .insert([{
        ...gameData,
        available_spots: gameData.total_spots,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOpenGames() {
    const { data, error } = await supabase
      .from(TABLES.OPEN_GAMES)
      .select(`
        *,
        host:users(*),
        turf:turfs(*),
        booking:bookings(*, slot:availability_slots(*))
      `)
      .eq("is_active", true)
      .gt("available_spots", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching open games:", error);
      return [];
    }
    return data || [];
  },

  async joinOpenGame(openGameId: string, userId: string) {
    // 1. Create participant
    const { data: participant, error: partError } = await supabase
      .from(TABLES.OPEN_GAME_PARTICIPANTS)
      .insert([{ open_game_id: openGameId, user_id: userId, payment_status: "pending" }])
      .select()
      .single();

    if (partError) {
      if (partError.code === "23505") throw new Error("You have already joined this game.");
      throw partError;
    }

    // 2. Decrement available spots (via RPC or optimistic update, we do basic update here)
    const { data: game, error: fetchErr } = await supabase
      .from(TABLES.OPEN_GAMES)
      .select("available_spots")
      .eq("id", openGameId)
      .single();

    if (game && !fetchErr) {
      await supabase
        .from(TABLES.OPEN_GAMES)
        .update({ available_spots: Math.max(0, game.available_spots - 1) })
        .eq("id", openGameId);
    }

    return participant;
  },

  async getGameParticipants(openGameId: string) {
    const { data, error } = await supabase
      .from(TABLES.OPEN_GAME_PARTICIPANTS)
      .select("*, user:users(*)")
      .eq("open_game_id", openGameId);
      
    if (error) return [];
    return data || [];
  }
};

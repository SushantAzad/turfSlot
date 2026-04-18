"use client";

import { useCallback, useEffect, useState } from "react";
import {
  turfQueries,
  slotQueries,
  bookingQueries,
} from "@/lib/supabase/queries";
import type { Turf, AvailabilitySlot, Booking } from "@/types";

// ============ TURFS HOOK ============

export const useTurfs = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTurfs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await turfQueries.getAll();
      setTurfs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTurfs();
  }, [fetchTurfs]);

  return { turfs, isLoading, error, refetch: fetchTurfs };
};

export const useTurf = (id: string) => {
  const [turf, setTurf] = useState<Turf | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        setIsLoading(true);
        const data = await turfQueries.getById(id);
        setTurf(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTurf();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  return { turf, isLoading, error };
};

export const useOwnerTurfs = (ownerId: string) => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTurfsData = useCallback(async () => {
    if (!ownerId) return;
    try {
      setIsLoading(true);
      const data = await turfQueries.getByOwnerId(ownerId);
      setTurfs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (ownerId) {
      fetchTurfsData();
    } else {
      setIsLoading(false);
    }
  }, [ownerId, fetchTurfsData]);

  return { turfs, isLoading, error, refetch: fetchTurfsData };
};

// ============ SLOTS HOOK ============

export const useSlots = (turfId: string, date: string) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const data = await slotQueries.getByTurfAndDate(turfId, date);
        setSlots(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (turfId && date) {
      fetchSlots();
    } else {
      setIsLoading(false);
    }
  }, [turfId, date]);

  return { slots, isLoading, error };
};

export const useAvailableSlots = (
  turfId: string,
  startDate: string,
  endDate: string,
) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const data = await slotQueries.getAvailableSlots(
          turfId,
          startDate,
          endDate,
        );
        setSlots(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (turfId && startDate && endDate) {
      fetchSlots();
    } else {
      setIsLoading(false);
    }
  }, [turfId, startDate, endDate]);

  return { slots, isLoading, error };
};

// ============ BOOKINGS HOOK ============

export const useUserBookings = (userId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const data = await bookingQueries.getUserBookings(userId);
        setBookings(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return { bookings, isLoading, error };
};

export const useTurfBookings = (turfId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingQueries.getTurfBookings(turfId);
      setBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (turfId) {
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, [turfId]);

  return { bookings, isLoading, error, refetch: fetchBookings };
};

export const useBooking = (bookingId: string) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const data = await bookingQueries.getById(bookingId);
        setBooking(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    } else {
      setIsLoading(false);
    }
  }, [bookingId]);

  return { booking, isLoading, error };
};

// ============ MATCHMAKING HOOKS ============

import { matchmakingQueries } from "@/lib/supabase/queries";
import type { OpenGame, Waitlist, OpenGameParticipant } from "@/types";

export const useOpenGames = () => {
  const [games, setGames] = useState<OpenGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await matchmakingQueries.getOpenGames();
      setGames(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, isLoading, error, refetch: fetchGames };
};

export const useWaitlistStatus = (slotId: string, userId: string | undefined) => {
  const [waitlistRecord, setWaitlistRecord] = useState<Waitlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!slotId || !userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await matchmakingQueries.getWaitlistStatus(slotId, userId);
      setWaitlistRecord(data);
    } catch (err: any) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [slotId, userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { waitlistRecord, isLoading, refetch: fetchStatus };
};

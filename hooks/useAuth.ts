"use client";

import { useState, useEffect } from "react";
import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { userQueries } from "@/lib/supabase/queries";
import { authUtils } from "@/lib/auth/utils";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const useAuthStore = create<AuthState>(() => ({
  user: null,
  isLoading: true,
  error: null,
}));

let authListenerRegistered = false;

const initializeAuth = () => {
  if (typeof window === "undefined") return;
  if (authListenerRegistered) return;
  authListenerRegistered = true;

  // Step 1: Initial load
  supabase.auth.getSession().then(async ({ data: { session }, error }) => {
    if (error) {
      useAuthStore.setState({ error: error.message, isLoading: false });
      return;
    }

    if (session?.user) {
      try {
        const profile = await userQueries.getById(session.user.id);
        useAuthStore.setState({ user: profile, isLoading: false });
      } catch (err: any) {
        useAuthStore.setState({ error: err.message, isLoading: false });
      }
    } else {
      useAuthStore.setState({ user: null, isLoading: false });
    }
  });

  // Step 2: Global subscription listener
  supabase.auth.onAuthStateChange(async (_event, session) => {
    try {
      const currentState = useAuthStore.getState();
      
      if (session?.user) {
        // Prevent state churn on tab switch (e.g. TOKEN_REFRESHED) if user is already loaded
        if (currentState.user?.id === session.user.id) {
          return;
        }
        const profile = await userQueries.getById(session.user.id);
        useAuthStore.setState({ user: profile, isLoading: false, error: null });
      } else {
        if (currentState.user !== null) {
          useAuthStore.setState({ user: null, isLoading: false, error: null });
        }
      }
    } catch (err: any) {
      useAuthStore.setState({ error: err.message, isLoading: false });
    }
  });
};

// ============ USE AUTH HOOK ============
export const useAuth = () => {
  useEffect(() => {
    initializeAuth();
  }, []);
  
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  return { user, isLoading, error };
};

// ============ USE AUTH MUTATIONS HOOK ============
export const useAuthMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.login(email, password);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    role: "turf_owner" | "user",
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.signup(email, password, fullName, role);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.logout();
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, signup, logout, isLoading, error };
};

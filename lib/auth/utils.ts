import { supabase } from "@/lib/supabase/client";
import { userQueries } from "@/lib/supabase/queries";
import type { User } from "@/types";

// ============ AUTHENTICATION UTILITIES ============

export const authUtils = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // Fetch user profile from custom users table
      const userProfile = await userQueries.getById(user.id);
      return userProfile;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  async signup(
    email: string,
    password: string,
    fullName: string,
    role: "turf_owner" | "user",
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (authError || !data.user) {
        return { user: null, error: authError?.message || "Sign up failed" };
      }

      // Create user profile
      const newUser = await userQueries.create({
        id: data.user.id,
        email,
        role,
        full_name: fullName,
        is_verified: false,
      });

      if (!newUser) {
        // Note: We cannot call admin.deleteUser from client side (requires service role).
        // The orphan auth user can be cleaned up via Supabase dashboard if needed.
        return {
          user: null,
          error: "Account created but profile setup failed. Please contact support.",
        };
      }

      return { user: newUser, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || "An unexpected error occurred",
      };
    }
  },

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError || !data.user) {
        return {
          user: null,
          error: authError?.message || "Login failed",
        };
      }

      // Fetch user profile
      const userProfile = await userQueries.getById(data.user.id);

      return { user: userProfile, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || "An unexpected error occurred",
      };
    }
  },

  async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || "Logout failed" };
    }
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || "Password reset failed" };
    }
  },

  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || "Password update failed" };
    }
  },

  async updateProfile(
    userId: string,
    updates: Partial<User>,
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const updatedUser = await userQueries.update(userId, updates);

      if (!updatedUser) {
        return {
          user: null,
          error: "Failed to update profile",
        };
      }

      return { user: updatedUser, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || "Profile update failed",
      };
    }
  },

  async verifyEmail(token: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || "Email verification failed" };
    }
  },

  // Check if user has specific role
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await userQueries.getById(userId);
      return user?.role === role;
    } catch {
      return false;
    }
  },

  // Get auth session
  async getSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  },

  // Subscribe to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const userProfile = await userQueries.getById(session.user.id);
        callback(userProfile);
      } else {
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => {
      subscription?.unsubscribe();
    };
  },
};

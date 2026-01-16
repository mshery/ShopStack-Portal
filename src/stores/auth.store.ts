import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlatformUser, TenantUser, AuthUserType } from "@/types";

/**
 * Auth Store - Mock authentication state with persistence
 *
 * RULES:
 * - Stores hold state + expose setters, nothing else
 * - No async logic, no API calls, no UI derivation
 * - Safe defaults for all values
 * - State persists to localStorage to survive page refreshes
 */

interface AuthStoreState {
  // State
  currentUser: PlatformUser | TenantUser | null;
  userType: AuthUserType;
  activeTenantId: string | null;

  // Setters
  setCurrentUser: (user: PlatformUser | TenantUser | null) => void;
  setUserType: (type: AuthUserType) => void;
  setActiveTenantId: (id: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      // Initial state - safe defaults
      currentUser: null,
      userType: null,
      activeTenantId: null,

      // Setters
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserType: (type) => set({ userType: type }),
      setActiveTenantId: (id) => set({ activeTenantId: id }),

      logout: () =>
        set({
          currentUser: null,
          userType: null,
          activeTenantId: null,
        }),
    }),
    {
      name: "saas-auth-storage", // localStorage key
    },
  ),
);

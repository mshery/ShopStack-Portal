import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlatformUser, TenantUser, AuthUserType } from "@/shared/types/models";

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

  // Impersonation state
  isImpersonating: boolean;
  originalPlatformUser: PlatformUser | null;

  // Setters
  setCurrentUser: (user: PlatformUser | TenantUser | null) => void;
  setUserType: (type: AuthUserType) => void;
  setActiveTenantId: (id: string | null) => void;
  logout: () => void;

  // Impersonation actions
  startImpersonation: (
    tenantUser: TenantUser,
    originalUser: PlatformUser,
  ) => void;
  endImpersonation: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      // Initial state - safe defaults
      currentUser: null,
      userType: null,
      activeTenantId: null,
      isImpersonating: false,
      originalPlatformUser: null,

      // Setters
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserType: (type) => set({ userType: type }),
      setActiveTenantId: (id) => set({ activeTenantId: id }),

      logout: () =>
        set({
          currentUser: null,
          userType: null,
          activeTenantId: null,
          isImpersonating: false,
          originalPlatformUser: null,
        }),

      // Impersonation actions
      startImpersonation: (tenantUser, originalUser) =>
        set({
          currentUser: tenantUser,
          userType: "tenant",
          activeTenantId: tenantUser.tenant_id,
          isImpersonating: true,
          originalPlatformUser: originalUser,
        }),

      endImpersonation: () =>
        set((state) => ({
          currentUser: state.originalPlatformUser,
          userType: "platform",
          activeTenantId: null,
          isImpersonating: false,
          originalPlatformUser: null,
        })),
    }),
    {
      name: "saas-auth-storage", // localStorage key
    },
  ),
);

import { create } from "zustand";
import type {
  PlatformUser,
  TenantUser,
  AuthUserType,
} from "@/shared/types/models";
import type { AuthTenant } from "@/modules/auth/api/authApi";

/**
 * Auth Store — in-memory only (zustand-stores.md "boring store" + security.md
 * rule 3). No persist middleware: tokens never touch localStorage, and the
 * auth identity is restored on boot via a silent refresh against
 * `POST /api/auth/refresh-token` (the refresh cookie is sent automatically).
 */

interface LoginData {
  user: PlatformUser | TenantUser;
  userType: AuthUserType;
  tenantId: string | null;
  tenant?: AuthTenant | null;
}

interface AuthState {
  currentUser: PlatformUser | TenantUser | null;
  currentTenant: AuthTenant | null;
  userType: AuthUserType;
  activeTenantId: string | null;
  isImpersonating: boolean;
  originalPlatformUser: PlatformUser | null;
}

interface AuthActions {
  login: (data: LoginData) => void;
  setCurrentUser: (user: PlatformUser | TenantUser | null) => void;
  setUserType: (type: AuthUserType) => void;
  setActiveTenantId: (id: string | null) => void;
  logout: () => void;
  startImpersonation: (
    tenantUser: TenantUser,
    originalUser: PlatformUser,
  ) => void;
  endImpersonation: () => void;
}

const initialState: AuthState = {
  currentUser: null,
  currentTenant: null,
  userType: null,
  activeTenantId: null,
  isImpersonating: false,
  originalPlatformUser: null,
};

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  ...initialState,

  login: ({ user, userType, tenantId, tenant }) =>
    set({
      currentUser: user,
      currentTenant: tenant ?? null,
      userType,
      activeTenantId: tenantId,
      isImpersonating: false,
      originalPlatformUser: null,
    }),

  setCurrentUser: (user) => set({ currentUser: user }),
  setUserType: (type) => set({ userType: type }),
  setActiveTenantId: (id) => set({ activeTenantId: id }),

  logout: () => set(initialState),

  startImpersonation: (tenantUser, originalUser) =>
    set({
      currentUser: tenantUser,
      currentTenant: null,
      userType: "tenant",
      activeTenantId: tenantUser.tenant_id,
      isImpersonating: true,
      originalPlatformUser: originalUser,
    }),

  endImpersonation: () => {
    const state = get();
    set({
      currentUser: state.originalPlatformUser,
      currentTenant: null,
      userType: "platform",
      activeTenantId: null,
      isImpersonating: false,
      originalPlatformUser: null,
    });
  },
}));

/**
 * Hook to check if auth is ready. The store is now memory-only and
 * synchronously initialised, so it is always "hydrated". The export is
 * kept for compatibility with the route guards.
 */
export function useAuthHydrated(): boolean {
  return true;
}

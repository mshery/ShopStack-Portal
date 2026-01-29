import { create } from "zustand";
import type {
  PlatformUser,
  TenantUser,
  AuthUserType,
} from "@/shared/types/models";
import type { AuthTenant } from "@/modules/auth/api/authApi";

/**
 * Auth Store - Authentication state with manual localStorage persistence
 *
 * We use manual localStorage instead of Zustand's persist middleware because
 * the persist middleware has timing issues with async rehydration that cause
 * the initial empty state to overwrite saved state on page load.
 *
 * This store:
 * - Loads from localStorage on initialization
 * - Saves to localStorage on each state change via manual calls
 * - Provides a simpler, more predictable persistence model
 */

const STORAGE_KEY = "saas-auth-storage";

interface LoginData {
  user: PlatformUser | TenantUser;
  userType: AuthUserType;
  tenantId: string | null;
  tenant?: AuthTenant | null; // Tenant info from login response
}

interface PersistedState {
  currentUser: PlatformUser | TenantUser | null;
  currentTenant: AuthTenant | null; // Tenant data from login
  userType: AuthUserType;
  activeTenantId: string | null;
  isImpersonating: boolean;
  originalPlatformUser: PlatformUser | null;
}

// Load initial state from localStorage
function loadPersistedState(): PersistedState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Handle both old format {state: {...}} and new format {...}
      const state = parsed.state || parsed;
      console.log("Loaded auth state from localStorage:", state);
      return {
        currentUser: state.currentUser ?? null,
        currentTenant: state.currentTenant ?? null,
        userType: state.userType ?? null,
        activeTenantId: state.activeTenantId ?? null,
        isImpersonating: state.isImpersonating ?? false,
        originalPlatformUser: state.originalPlatformUser ?? null,
      };
    }
  } catch (e) {
    console.error("Failed to load auth state from localStorage:", e);
  }
  return {
    currentUser: null,
    currentTenant: null,
    userType: null,
    activeTenantId: null,
    isImpersonating: false,
    originalPlatformUser: null,
  };
}

// Save state to localStorage
function saveToLocalStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log("Saved auth state to localStorage");
  } catch (e) {
    console.error("Failed to save auth state to localStorage:", e);
  }
}

interface AuthStoreState extends PersistedState {
  // Atomic login action (sets all state at once and persists)
  login: (data: LoginData) => void;

  // Individual setters
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

// Load initial state from localStorage
const initialState = loadPersistedState();

export const useAuthStore = create<AuthStoreState>()((set, get) => ({
  // Initial state from localStorage
  ...initialState,

  // Atomic login action - sets all auth state and persists
  login: ({ user, userType, tenantId, tenant }) => {
    const newState: PersistedState = {
      currentUser: user,
      currentTenant: tenant ?? null,
      userType: userType,
      activeTenantId: tenantId,
      isImpersonating: false,
      originalPlatformUser: null,
    };
    set(newState);
    saveToLocalStorage(newState);
  },

  // Individual setters
  setCurrentUser: (user) => {
    set({ currentUser: user });
    const state = get();
    saveToLocalStorage({
      currentUser: user,
      currentTenant: state.currentTenant,
      userType: state.userType,
      activeTenantId: state.activeTenantId,
      isImpersonating: state.isImpersonating,
      originalPlatformUser: state.originalPlatformUser,
    });
  },

  setUserType: (type) => {
    set({ userType: type });
    const state = get();
    saveToLocalStorage({
      currentUser: state.currentUser,
      currentTenant: state.currentTenant,
      userType: type,
      activeTenantId: state.activeTenantId,
      isImpersonating: state.isImpersonating,
      originalPlatformUser: state.originalPlatformUser,
    });
  },

  setActiveTenantId: (id) => {
    set({ activeTenantId: id });
    const state = get();
    saveToLocalStorage({
      currentUser: state.currentUser,
      currentTenant: state.currentTenant,
      userType: state.userType,
      activeTenantId: id,
      isImpersonating: state.isImpersonating,
      originalPlatformUser: state.originalPlatformUser,
    });
  },

  logout: () => {
    const emptyState: PersistedState = {
      currentUser: null,
      currentTenant: null,
      userType: null,
      activeTenantId: null,
      isImpersonating: false,
      originalPlatformUser: null,
    };
    set(emptyState);
    saveToLocalStorage(emptyState);
  },

  // Impersonation actions
  startImpersonation: (tenantUser, originalUser) => {
    const newState: PersistedState = {
      currentUser: tenantUser,
      currentTenant: null, // Will be fetched separately during impersonation
      userType: "tenant",
      activeTenantId: tenantUser.tenant_id,
      isImpersonating: true,
      originalPlatformUser: originalUser,
    };
    set(newState);
    saveToLocalStorage(newState);
  },

  endImpersonation: () => {
    const state = get();
    const newState: PersistedState = {
      currentUser: state.originalPlatformUser,
      currentTenant: null,
      userType: "platform",
      activeTenantId: null,
      isImpersonating: false,
      originalPlatformUser: null,
    };
    set(newState);
    saveToLocalStorage(newState);
  },
}));

/**
 * Hook to check if auth is ready (always true with manual persistence)
 * Kept for API compatibility with guards
 */
export function useAuthHydrated(): boolean {
  // With manual persistence, we're always hydrated since we load synchronously
  return true;
}

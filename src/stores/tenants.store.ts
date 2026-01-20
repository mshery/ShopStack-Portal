import { create } from "zustand";
import type { Tenant, TenantSettings } from "@/types";
import { broadcastTenantStatusChange } from "@/hooks/useTenantStatusSync";

/**
 * Tenants Store - Platform-level tenant management
 *
 * RULES:
 * - Arrays are NEVER optional, always []
 * - Stores are boring on purpose
 * - Status changes are broadcast to other tabs
 */

interface TenantsStoreState {
  // State
  tenants: Tenant[];

  // Setters
  setTenants: (tenants: Tenant[]) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  updateTenantSettings: (id: string, settings: Partial<TenantSettings>) => void;
  removeTenant: (id: string) => void;
}

export const useTenantsStore = create<TenantsStoreState>((set) => ({
  // Initial state - arrays always []
  tenants: [],

  // Setters
  setTenants: (tenants) => set({ tenants: tenants ?? [] }),

  addTenant: (tenant) =>
    set((state) => ({
      tenants: [...state.tenants, tenant],
    })),

  updateTenant: (id, updates) =>
    set((state) => {
      // If status is changing, broadcast to other tabs
      if (updates.status) {
        broadcastTenantStatusChange(id, updates.status);
      }

      return {
        tenants: state.tenants.map((t) =>
          t.id === id
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t,
        ),
      };
    }),

  updateTenantSettings: (id, settings) =>
    set((state) => ({
      tenants: state.tenants.map((t) =>
        t.id === id
          ? {
              ...t,
              settings: { ...t.settings, ...settings },
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    })),

  removeTenant: (id) =>
    set((state) => ({
      tenants: state.tenants.filter((t) => t.id !== id),
    })),
}));

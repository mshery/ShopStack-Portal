import { create } from "zustand";
import type { TenantUser, PlatformUser } from "@/shared/types/models";

/**
 * Users Store - Both platform users and tenant users
 */

interface UsersStoreState {
  // Platform users (Super Admin)
  platformUsers: PlatformUser[];

  // Tenant users
  tenantUsers: TenantUser[];

  // Setters for platform users
  setPlatformUsers: (users: PlatformUser[]) => void;

  // Setters for tenant users
  setTenantUsers: (users: TenantUser[]) => void;
  addTenantUser: (user: Omit<TenantUser, "createdAt" | "updatedAt">) => void;
  updateTenantUser: (id: string, updates: Partial<TenantUser>) => void;
  removeTenantUser: (id: string) => void;
}

export const useUsersStore = create<UsersStoreState>((set) => ({
  // Initial state - arrays always []
  platformUsers: [],
  tenantUsers: [],

  // Platform user setters
  setPlatformUsers: (users) => set({ platformUsers: users ?? [] }),

  // Tenant user setters
  setTenantUsers: (users) => set({ tenantUsers: users ?? [] }),

  addTenantUser: (user) =>
    set((state) => ({
      tenantUsers: [
        ...state.tenantUsers,
        {
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as TenantUser,
      ],
    })),

  updateTenantUser: (id, updates) =>
    set((state) => ({
      tenantUsers: state.tenantUsers.map((u) =>
        u.id === id
          ? { ...u, ...updates, updatedAt: new Date().toISOString() }
          : u,
      ),
    })),

  removeTenantUser: (id) =>
    set((state) => ({
      tenantUsers: state.tenantUsers.filter((u) => u.id !== id),
    })),
}));

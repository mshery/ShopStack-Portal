import { create } from "zustand";
import type { Customer } from "@/types";

/**
 * Customers Store - Tenant CRM
 */

interface CustomersStoreState {
  // State
  customers: Customer[];

  // Setters
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
}

export const useCustomersStore = create<CustomersStoreState>((set) => ({
  // Initial state
  customers: [],

  // Setters
  setCustomers: (customers) => set({ customers: customers ?? [] }),

  addCustomer: (customer) =>
    set((state) => ({
      customers: [...state.customers, customer],
    })),

  updateCustomer: (id, updates) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),

  removeCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    })),
}));

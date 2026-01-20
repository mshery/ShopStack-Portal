import { create } from "zustand";
import type { Expense } from "@/shared/types/models";

/**
 * Expenses Store - Business expense tracking
 * Follows ANTIGRAVITY RULES: Boring store - only state and setters
 */

interface ExpensesStoreState {
  // State
  expenses: Expense[];

  // Setters
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
}

export const useExpensesStore = create<ExpensesStoreState>((set) => ({
  // Initial state
  expenses: [],

  // Setters
  setExpenses: (expenses) => set({ expenses: expenses ?? [] }),

  addExpense: (expense) => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      expenses: [
        ...state.expenses,
        {
          ...expense,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Expense,
      ],
    }));
  },

  updateExpense: (id, updates) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e,
      ),
    }));
  },

  removeExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },
}));

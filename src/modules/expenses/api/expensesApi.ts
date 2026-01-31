/**
 * Expenses API
 *
 * API client for expense tracking and reporting.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";
import type { Expense, ExpenseType } from "@/shared/types/models";

// ============================================
// TYPES
// ============================================

export interface CreateExpenseInput {
  category: string;
  expenseType: ExpenseType;
  amount: number;
  description: string;
  vendor?: string;
  date?: string;
  relatedVendorId?: string;
  relatedPurchaseId?: string;
  receiptUrl?: string;
}

export interface UpdateExpenseInput {
  category?: string;
  expenseType?: ExpenseType;
  amount?: number;
  description?: string;
  vendor?: string;
  date?: string;
  relatedVendorId?: string;
  receiptUrl?: string;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  expenseType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseListResponse {
  items: Expense[];
  total: number;
}

export interface ExpenseSummaryStats {
  totalAmount: number;
  totalCount: number;
  byType: {
    expenseType: ExpenseType;
    _sum: { amount: number };
    _count: number;
  }[];
  byCategory: {
    category: string;
    _sum: { amount: number };
    _count: number;
  }[];
}

// ============================================
// API
// ============================================

export const expensesApi = {
  // List expenses with filters
  getExpenses: async (
    params?: ExpenseFilters,
  ): Promise<ExpenseListResponse> => {
    const res = await httpClient.get<
      ApiResponse<{ items: Expense[]; pagination: { total: number } }>
    >(endpoints.tenant.expenses.list, { params });
    return {
      items: res.data.data.items,
      total: res.data.data.pagination.total,
    };
  },

  // Get single expense by ID
  getExpense: async (id: string): Promise<Expense> => {
    const res = await httpClient.get<ApiResponse<Expense>>(
      endpoints.tenant.expenses.byId(id),
    );
    return res.data.data;
  },

  // Create new expense
  createExpense: async (data: CreateExpenseInput): Promise<Expense> => {
    const res = await httpClient.post<ApiResponse<Expense>>(
      endpoints.tenant.expenses.list,
      data,
    );
    return res.data.data;
  },

  // Update existing expense
  updateExpense: async (
    id: string,
    data: UpdateExpenseInput,
  ): Promise<Expense> => {
    const res = await httpClient.put<ApiResponse<Expense>>(
      endpoints.tenant.expenses.byId(id),
      data,
    );
    return res.data.data;
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.tenant.expenses.byId(id));
  },

  // Get expense summary
  getSummary: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseSummaryStats> => {
    const res = await httpClient.get<ApiResponse<ExpenseSummaryStats>>(
      endpoints.tenant.expenses.summary,
      { params },
    );
    return res.data.data;
  },
};

export default expensesApi;

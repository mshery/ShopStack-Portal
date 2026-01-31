import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  expensesApi,
  type CreateExpenseInput,
  type UpdateExpenseInput,
  type ExpenseFilters,
} from "./expensesApi";

// ============ QUERY KEYS ============
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters: ExpenseFilters) =>
    [...expenseKeys.lists(), { ...filters }] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  summary: (params: { startDate?: string; endDate?: string }) =>
    [...expenseKeys.all, "summary", params] as const,
};

// ============ QUERIES ============

export function useExpensesFetch(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expensesApi.getExpenses(filters),
    staleTime: 60000, // 1 minute stale time
  });
}

export function useExpenseFetch(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expensesApi.getExpense(id),
    enabled: !!id,
  });
}

export function useExpenseSummaryFetch(
  params: { startDate?: string; endDate?: string } = {},
) {
  return useQuery({
    queryKey: expenseKeys.summary(params),
    queryFn: () => expensesApi.getSummary(params),
    staleTime: 300000, // 5 minutes stale time for stats
  });
}

// ============ MUTATIONS ============

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expensesApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...expenseKeys.all, "summary"],
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      expensesApi.updateExpense(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...expenseKeys.all, "summary"],
      });
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(data.id) });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...expenseKeys.all, "summary"],
      });
    },
  });
}

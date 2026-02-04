import { useMemo, useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/modules/auth";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useExpensesFetch,
  useExpenseSummaryFetch,
  useDeleteExpense,
} from "../api/queries";
import toast from "react-hot-toast";

export type ExpensesStatus = "loading" | "error" | "empty" | "success";

export function useExpensesScreen() {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId, userType } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const tenantId = paramTenantId || activeTenantId;
  const isOwner = userType === "tenant" || userType === "platform"; // Simple check, refine based on roles

  // Pagination State
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  // Filter State
  const [expenseType, setExpenseType] = useState<string>(
    searchParams.get("type") || "",
  );
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || "",
  );
  const [dateRange, setDateRange] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    end: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
  });

  // Update URL on filter change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (expenseType) params.set("type", expenseType);
    else params.delete("type");

    if (category) params.set("category", category);
    else params.delete("category");

    if (dateRange.start) params.set("startDate", dateRange.start.toISOString());
    if (dateRange.end) params.set("endDate", dateRange.end.toISOString());

    setSearchParams(params);
  }, [expenseType, category, dateRange, setSearchParams, searchParams]);

  // Data Fetching
  const filters = useMemo(
    () => ({
      page,
      limit,
      expenseType: expenseType || undefined,
      category: category || undefined,
      startDate: dateRange.start?.toISOString(),
      endDate: dateRange.end?.toISOString(),
    }),
    [page, limit, expenseType, category, dateRange],
  );

  const {
    data: expensesData,
    isLoading: isListLoading,
    isError: isListError,
    refetch,
  } = useExpensesFetch(filters);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useExpenseSummaryFetch({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const expenses = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (expensesData?.items || []).map((expense: any) => ({
        ...expense,
        amount: Number(expense.amount || 0),
      })),
    [expensesData?.items],
  );
  const totalItems = expensesData?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Mutations
  const deleteMutation = useDeleteExpense();

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      try {
        await deleteMutation.mutateAsync(expenseId);
        toast.success("Expense deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete expense";
        toast.error(message);
      }
    },
    [deleteMutation],
  );

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", newPage.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const normalizedSummary = useMemo(() => {
    if (!summaryData) {
      return {
        totalAmount: 0,
        totalCount: 0,
        byType: [],
        byCategory: [],
      };
    }

    return {
      ...summaryData,
      totalAmount: Number(summaryData.totalAmount || 0),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      byType: (summaryData.byType || []).map((item: any) => ({
        ...item,
        _sum: {
          ...item._sum,
          amount: Number(item._sum?.amount || 0),
        },
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      byCategory: (summaryData.byCategory || []).map((item: any) => ({
        ...item,
        _sum: {
          ...item._sum,
          amount: Number(item._sum?.amount || 0),
        },
      })),
    };
  }, [summaryData]);

  const vm = useMemo(
    () => ({
      expenses,
      summary: normalizedSummary,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      filters: {
        expenseType,
        category,
        dateRange,
      },
      isEmpty: !isListLoading && expenses.length === 0,
      tenantId,
      isOwner,
      isDeleting: deleteMutation.isPending,
    }),
    [
      expenses,
      normalizedSummary,
      totalItems,
      totalPages,
      page,
      limit,
      expenseType,
      category,
      dateRange,
      isListLoading,
      tenantId,
      isOwner,
      deleteMutation.isPending,
    ],
  );

  const actions = useMemo(
    () => ({
      setPage,
      setExpenseType,
      setCategory,
      setDateRange,
      deleteExpense,
      refetch,
    }),
    [setPage, deleteExpense, refetch],
  );

  const status: ExpensesStatus = !tenantId
    ? "error"
    : isListLoading || isSummaryLoading
      ? "loading"
      : isListError || isSummaryError
        ? "error"
        : expenses.length === 0
          ? "empty"
          : "success";

  return { status, vm, actions };
}

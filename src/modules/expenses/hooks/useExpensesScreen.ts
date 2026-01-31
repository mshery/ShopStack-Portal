import { useMemo, useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/modules/auth";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useExpensesFetch,
  useExpenseSummaryFetch,
  useDeleteExpense,
} from "../api/queries";

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
    () => expensesData?.items || [],
    [expensesData?.items],
  );
  const totalItems = expensesData?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Mutations
  const deleteMutation = useDeleteExpense();

  const deleteExpense = useCallback(
    (expenseId: string) => {
      deleteMutation.mutate(expenseId);
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

  const vm = useMemo(
    () => ({
      expenses,
      summary: summaryData || {
        totalAmount: 0,
        totalCount: 0,
        byType: [],
        byCategory: [],
      },
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
    }),
    [
      expenses,
      summaryData,
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

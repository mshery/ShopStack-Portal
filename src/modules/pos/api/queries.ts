/**
 * POS TanStack Query Hooks
 *
 * Query hooks for Sales, Refunds, Receipts, and Held Orders.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  posApi,
  type SalesFilters,
  type RefundsFilters,
  type CreateSaleInput,
  type CreateRefundInput,
  type CreateHeldOrderInput,
} from "./posApi";
import { productKeys } from "@/modules/products/api/queries";

// ============================================
// QUERY KEYS
// ============================================

export const posKeys = {
  all: ["pos"] as const,
  sales: () => [...posKeys.all, "sales"] as const,
  salesList: (params?: SalesFilters) =>
    [...posKeys.sales(), "list", params ?? {}] as const,
  saleDetail: (id: string) => [...posKeys.sales(), "detail", id] as const,
  todaysSummary: () => [...posKeys.sales(), "today"] as const,
  refunds: () => [...posKeys.all, "refunds"] as const,
  refundsList: (params?: RefundsFilters) =>
    [...posKeys.refunds(), "list", params ?? {}] as const,
  refundDetail: (id: string) => [...posKeys.refunds(), "detail", id] as const,
  receipts: () => [...posKeys.all, "receipts"] as const,
  receiptBySale: (saleId: string) =>
    [...posKeys.receipts(), "bySale", saleId] as const,
  receiptByNumber: (number: string) =>
    [...posKeys.receipts(), "byNumber", number] as const,
  heldOrders: () => [...posKeys.all, "heldOrders"] as const,
  heldOrdersList: () => [...posKeys.heldOrders(), "list"] as const,
  heldOrderDetail: (id: string) =>
    [...posKeys.heldOrders(), "detail", id] as const,
};

// ============================================
// SALES QUERIES
// ============================================

export function useSalesFetch(params: SalesFilters = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: posKeys.salesList(params),
    queryFn: () => posApi.getSales(params),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

export function useSaleFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: posKeys.saleDetail(id),
    queryFn: () => posApi.getSale(id),
    enabled: !!id && enabled,
    staleTime: 30000,
  });
}

export function useTodaysSummaryFetch() {
  return useQuery({
    queryKey: posKeys.todaysSummary(),
    queryFn: () => posApi.getTodaysSummary(),
    staleTime: 60000, // 1 minute cache
  });
}

// ============================================
// SALES MUTATIONS
// ============================================

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleInput) => posApi.createSale(data),
    onSuccess: async () => {
      // Invalidate sales list and today's summary
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: posKeys.sales() }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }), // Stock changed
      ]);
    },
  });
}

// ============================================
// REFUNDS QUERIES
// ============================================

export function useRefundsFetch(
  params: RefundsFilters = { page: 1, limit: 10 },
) {
  return useQuery({
    queryKey: posKeys.refundsList(params),
    queryFn: () => posApi.getRefunds(params),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

export function useRefundFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: posKeys.refundDetail(id),
    queryFn: () => posApi.getRefund(id),
    enabled: !!id && enabled,
    staleTime: 30000,
  });
}

// ============================================
// REFUNDS MUTATIONS
// ============================================

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRefundInput) => posApi.processRefund(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: posKeys.refunds() }),
        queryClient.invalidateQueries({ queryKey: posKeys.sales() }), // Refund affects sale
        queryClient.invalidateQueries({ queryKey: productKeys.all }), // Stock restored
      ]);
    },
  });
}

// ============================================
// RECEIPTS QUERIES
// ============================================

export function useReceiptBySaleFetch(saleId: string, enabled = true) {
  return useQuery({
    queryKey: posKeys.receiptBySale(saleId),
    queryFn: () => posApi.getReceiptBySale(saleId),
    enabled: !!saleId && enabled,
    staleTime: Infinity, // Receipts don't change
  });
}

export function useReceiptByNumberFetch(receiptNumber: string, enabled = true) {
  return useQuery({
    queryKey: posKeys.receiptByNumber(receiptNumber),
    queryFn: () => posApi.getReceiptByNumber(receiptNumber),
    enabled: !!receiptNumber && enabled,
    staleTime: Infinity,
  });
}

// ============================================
// HELD ORDERS QUERIES
// ============================================

export function useHeldOrdersFetch() {
  return useQuery({
    queryKey: posKeys.heldOrdersList(),
    queryFn: () => posApi.getHeldOrders(),
    staleTime: 0, // Always fresh
  });
}

export function useHeldOrderFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: posKeys.heldOrderDetail(id),
    queryFn: () => posApi.getHeldOrder(id),
    enabled: !!id && enabled,
    staleTime: 0,
  });
}

// ============================================
// HELD ORDERS MUTATIONS
// ============================================

export function useCreateHeldOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHeldOrderInput) => posApi.createHeldOrder(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: posKeys.heldOrders() });
    },
  });
}

export function useResumeHeldOrder() {
  // Note: Resume returns the cart data but doesn't delete the held order
  // Deletion happens after successful checkout
  return useMutation({
    mutationFn: (id: string) => posApi.resumeHeldOrder(id),
  });
}

export function useDeleteHeldOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => posApi.deleteHeldOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: posKeys.heldOrders() });
    },
  });
}

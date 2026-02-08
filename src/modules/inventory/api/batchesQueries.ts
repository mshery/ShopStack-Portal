/**
 * Batches TanStack Query Hooks
 *
 * Query hooks for batch tracking and expiry alerts.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  batchesApi,
  type CreateBatchInput,
  type UpdateBatchInput,
} from "./batchesApi";

// ============================================
// QUERY KEYS
// ============================================

export const batchKeys = {
  all: ["batches"] as const,
  expiring: (days: number) => [...batchKeys.all, "expiring", days] as const,
  expired: () => [...batchKeys.all, "expired"] as const,
  detail: (id: string) => [...batchKeys.all, "detail", id] as const,
  byProduct: (productId: string) =>
    [...batchKeys.all, "product", productId] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Fetch batches expiring within N days (default: 7)
 */
export function useExpiringBatches(days: number = 7) {
  return useQuery({
    queryKey: batchKeys.expiring(days),
    queryFn: () => batchesApi.getExpiringBatches(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch expired batches
 */
export function useExpiredBatches() {
  return useQuery({
    queryKey: batchKeys.expired(),
    queryFn: () => batchesApi.getExpiredBatches(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch batch by ID
 */
export function useBatchFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: () => batchesApi.getBatchById(id),
    enabled: !!id && enabled,
    staleTime: 30000,
  });
}

/**
 * Fetch batches for a specific product
 */
export function useProductBatches(productId: string, activeOnly = true) {
  return useQuery({
    queryKey: batchKeys.byProduct(productId),
    queryFn: () => batchesApi.getProductBatches(productId, activeOnly),
    enabled: !!productId,
    staleTime: 30000,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Select batches for sale using FIFO strategy
 */
export function useSelectBatchesForSale() {
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => batchesApi.selectBatchesForSale(productId, quantity),
  });
}

/**
 * Create a new batch
 */
export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBatchInput) => batchesApi.createBatch(data),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: batchKeys.all }),
        queryClient.invalidateQueries({
          queryKey: batchKeys.byProduct(variables.productId),
        }),
      ]);
    },
  });
}

/**
 * Update a batch
 */
export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBatchInput }) =>
      batchesApi.updateBatch(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
}

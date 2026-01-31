import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  purchasesApi,
  type PurchaseFilters,
  type CreatePurchaseInput,
} from "./purchasesApi";

// ============ QUERY KEYS ============
export const purchaseKeys = {
  all: ["purchases"] as const,
  lists: () => [...purchaseKeys.all, "list"] as const,
  list: (filters: PurchaseFilters) =>
    [...purchaseKeys.lists(), { ...filters }] as const,
  details: () => [...purchaseKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
  items: (id: string) => [...purchaseKeys.detail(id), "items"] as const,
};

// ============ QUERIES ============

export function usePurchasesFetch(filters: PurchaseFilters = {}) {
  return useQuery({
    queryKey: purchaseKeys.list(filters),
    queryFn: () => purchasesApi.getPurchases(filters),
    staleTime: 60000, // 1 minute
  });
}

export function usePurchaseFetch(id: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => purchasesApi.getPurchase(id),
    enabled: !!id,
  });
}

export function usePurchaseItemsFetch(id: string) {
  return useQuery({
    queryKey: purchaseKeys.items(id),
    queryFn: () => purchasesApi.getPurchaseItems(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseInput) =>
      purchasesApi.createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
  });
}

export function useMarkAsOrdered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasesApi.markAsOrdered(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
  });
}

export function useReceivePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      date,
    }: {
      id: string;
      date?: { receivedDate?: string };
    }) => purchasesApi.receivePurchase(id, date),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
  });
}

export function useCancelPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasesApi.cancelPurchase(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
  });
}

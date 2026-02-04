import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customersApi,
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type CustomerFilters,
} from "./customersApi";

// ============ QUERY KEYS ============
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: CustomerFilters) =>
    [...customerKeys.lists(), { ...filters }] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  purchases: (id: string) => [...customerKeys.detail(id), "purchases"] as const,
};

// ============ QUERIES ============

export function useCustomersFetch(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customersApi.getCustomers(filters),
    staleTime: 0, // Force fresh fetch on mount/invalidation
  });
}

export function useCustomerFetch(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getCustomer(id),
    enabled: !!id,
  });
}

export function useCustomerPurchasesFetch(
  id: string,
  params: { page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: [...customerKeys.purchases(id), params],
    queryFn: () => customersApi.getPurchaseHistory(id, params),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerInput) =>
      customersApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) =>
      customersApi.updateCustomer(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(data.id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  vendorsApi,
  type CreateVendorInput,
  type UpdateVendorInput,
} from "./vendorsApi";

// ============ QUERY KEYS ============
export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

// ============ QUERIES ============

export function useVendorsFetch() {
  return useQuery({
    queryKey: vendorKeys.lists(),
    queryFn: vendorsApi.getVendors,
    staleTime: 60000, // 1 minute stale time
  });
}

export function useVendorFetch(id: string) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorsApi.getVendor(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorInput) => vendorsApi.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorInput }) =>
      vendorsApi.updateVendor(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(data.id) });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorsApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

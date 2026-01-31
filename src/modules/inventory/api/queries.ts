import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  inventoryApi,
  type InventoryFilters,
  type CreateAdjustmentInput,
} from "./inventoryApi";

export type { InventoryFilters, CreateAdjustmentInput };

// ============ QUERY KEYS ============
export const inventoryKeys = {
  all: ["inventory"] as const,
  adjustments: (params?: InventoryFilters) =>
    [...inventoryKeys.all, "adjustments", params ?? {}] as const,
};

// ============ QUERIES ============

export function useAdjustmentsFetch(
  params: InventoryFilters = { page: 1, limit: 10 },
) {
  return useQuery({
    queryKey: inventoryKeys.adjustments(params),
    queryFn: () => inventoryApi.getAdjustments(params),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

// ============ MUTATIONS ============

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdjustmentInput) =>
      inventoryApi.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      // Also invalidate products since stock changed
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

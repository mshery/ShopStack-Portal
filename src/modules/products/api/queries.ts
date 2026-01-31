import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  productsApi,
  type ProductFilters,
  type UpdateProductInput,
} from "./productsApi";
import { inventoryKeys } from "../../inventory/api/queries";

export type { ProductFilters };

// ============ QUERY KEYS ============
export const productKeys = {
  all: ["products"] as const,
  list: (params?: ProductFilters) =>
    [...productKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

// ============ QUERIES ============

export function useProductsFetch(
  params: ProductFilters = { page: 1, limit: 10 },
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

export function useProductFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id && enabled,
    staleTime: 30000,
  });
}

// ============ MUTATIONS ============

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.updateProduct(id, data),
    onSuccess: async (_, { id }) => {
      // Invalidate specific product detail
      await queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      // Invalidate list to reflect changes (e.g. stock, price)
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      // Invalidate inventory adjustments to reflect stock changes
      await queryClient.refetchQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

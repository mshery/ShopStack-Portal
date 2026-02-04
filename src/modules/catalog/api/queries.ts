import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "./catalogApi";

// ============ QUERY KEYS ============
export const catalogKeys = {
  all: ["catalog"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  brands: () => [...catalogKeys.all, "brands"] as const,
};

// ============ CATEGORIES ============
export function useCategoriesFetch() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: catalogApi.getCategories,
    staleTime: 60000, // 1 minute stale time
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      catalogApi.updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
    },
  });
}

// ============ BRANDS ============
export function useBrandsFetch() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: catalogApi.getBrands,
    staleTime: 60000,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogApi.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.brands() });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      catalogApi.updateBrand(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.brands() });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogApi.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.brands() });
    },
  });
}

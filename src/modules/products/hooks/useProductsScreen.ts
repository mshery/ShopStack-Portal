/**
 * Products Screen Hook
 *
 * Screen hook for products list following coding rules:
 * - Returns { status, vm, actions }
 * - Uses TanStack Query for data fetching
 * - Server-side pagination and filtering via URL params
 * - Memoized vm and stable actions
 */

import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  type ProductFilters,
  type UpdateProductInput,
  type Product,
} from "../api/productsApi";
import {
  useProductsFetch,
  useUpdateProduct,
  useDeleteProduct,
} from "../api/queries";
import {
  useCategoriesFetch,
  useBrandsFetch,
} from "@/modules/catalog/api/queries";
import { refetchProductListPage } from "../utils/productQueriesUtils";
import type { AsyncStatus } from "@/shared/types/api";
import toast from "react-hot-toast";

export const ITEMS_PER_PAGE = 10;

export function useProductsScreen() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read pagination and filters from URL (source of truth)
  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const selectedCategory = searchParams.get("category") ?? "all";
  const selectedBrand = searchParams.get("brand") ?? "all";
  const selectedStatus = searchParams.get("status") ?? "all";

  // Update URL helpers
  const updatePage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        prev.set("page", String(newPage));
        prev.set("limit", String(ITEMS_PER_PAGE));
        return prev;
      });
    },
    [setSearchParams],
  );

  const updateSearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        if (value) {
          prev.set("search", value);
        } else {
          prev.delete("search");
        }
        prev.set("page", "1"); // Reset to page 1
        return prev;
      });
    },
    [setSearchParams],
  );

  const updateCategory = useCallback(
    (categoryId: string) => {
      setSearchParams((prev) => {
        if (categoryId !== "all") {
          prev.set("category", categoryId);
        } else {
          prev.delete("category");
        }
        prev.set("page", "1");
        return prev;
      });
    },
    [setSearchParams],
  );

  const updateBrand = useCallback(
    (brandId: string) => {
      setSearchParams((prev) => {
        if (brandId !== "all") {
          prev.set("brand", brandId);
        } else {
          prev.delete("brand");
        }
        prev.set("page", "1");
        return prev;
      });
    },
    [setSearchParams],
  );

  const updateStatus = useCallback(
    (status: string) => {
      setSearchParams((prev) => {
        if (status !== "all") {
          prev.set("status", status);
        } else {
          prev.delete("status");
        }
        prev.set("page", "1");
        return prev;
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({ page: "1", limit: String(ITEMS_PER_PAGE) });
  }, [setSearchParams]);

  // Fetch catalog data (categories & brands) using reusable hooks
  const { data: categories = [] } = useCategoriesFetch();
  const { data: brands = [] } = useBrandsFetch();

  // Fetch products using reusable hook
  const filters: ProductFilters = useMemo(
    () => ({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: search || undefined,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      brandId: selectedBrand !== "all" ? selectedBrand : undefined,
      status:
        selectedStatus !== "all"
          ? (selectedStatus as ProductFilters["status"])
          : undefined,
    }),
    [currentPage, search, selectedCategory, selectedBrand, selectedStatus],
  );

  const { data, isLoading, isError, isFetching, refetch } =
    useProductsFetch(filters);

  // Mutations using reusable hooks
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Mutation Wrappers with Toast
  const handleUpdateSuccess = () => {
    toast.success("Product updated successfully");
  };

  const handleUpdateError = (error: Error) => {
    toast.error(error.message || "Failed to update product");
  };

  const handleDeleteSuccess = () => {
    toast.success("Product deleted successfully");
  };

  const handleDeleteError = (error: Error) => {
    toast.error(error.message || "Failed to delete product");
  };

  // Extract data and normalize
  const { products, pagination } = useMemo(() => {
    // API returns { data: items[], pagination: { page, limit, total, totalPages } }
    const rawItems: Product[] = data?.items ?? [];
    const meta = data?.pagination ?? {
      total: 0,
      limit: ITEMS_PER_PAGE,
      totalPages: 0,
      page: 1,
    };

    const normalizedItems = rawItems.map((p) => ({
      ...p,
      tenant_id: p.tenant_id,
      categoryId: p.categoryId ?? "",
      brandId: p.brandId ?? "",
      vendorId: p.vendorId ?? null,
      imageUrl: p.imageUrl ?? null,
      description: p.description ?? "",
      unitPrice:
        typeof p.unitPrice === "string" ? parseFloat(p.unitPrice) : p.unitPrice,
      costPrice:
        typeof p.costPrice === "string" ? parseFloat(p.costPrice) : p.costPrice,
    }));

    // Map API pagination to UI model (if mismatch exists, currently matches mostly)
    const paginationModel = {
      totalItems: meta.total,
      itemCount: rawItems.length,
      itemsPerPage: meta.limit,
      totalPages: meta.totalPages,
      currentPage: meta.page,
    };

    return { products: normalizedItems, pagination: paginationModel };
  }, [data]);

  // Status derivation with isFetching for page transitions
  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : products.length === 0 && !search && selectedCategory === "all"
        ? "empty"
        : "success";

  // Refetch current page helper (for use after mutations)
  const refetchCurrentPage = useCallback(async () => {
    await refetchProductListPage(queryClient, filters);
  }, [queryClient, filters]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        handleDeleteSuccess();
        // Refetch current page after delete
        await refetchCurrentPage();
      } catch (error) {
        handleDeleteError(error as Error);
      }
    },
    [deleteMutation, refetchCurrentPage],
  );

  const handleUpdateProduct = useCallback(
    async (id: string, data: UpdateProductInput) => {
      try {
        await updateMutation.mutateAsync({ id, data });
        handleUpdateSuccess();
        // Refetch current page after update
        await refetchCurrentPage();
      } catch (error) {
        handleUpdateError(error as Error);
      }
    },
    [updateMutation, refetchCurrentPage],
  );

  // View Model
  const vm = useMemo(
    () => ({
      products,
      categories,
      brands,
      totalItems: pagination.totalItems,
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      itemsPerPage: pagination.itemsPerPage,
      search,
      selectedCategory,
      selectedBrand,
      selectedStatus,
      isEmpty: products.length === 0,
      isFiltered:
        products.length === 0 && (!!search || selectedCategory !== "all"),
      canAddMore: true, // TODO: Check limits from plan
      currentCount: pagination.totalItems,
      maxProducts: 100, // TODO: Get from plan
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      isFetching, // For subtle loading indicator during page transitions
    }),
    [
      products,
      categories,
      brands,
      pagination,
      search,
      selectedCategory,
      selectedBrand,
      selectedStatus,
      updateMutation.isPending,
      deleteMutation.isPending,
      isFetching,
    ],
  );

  const actions = useMemo(
    () => ({
      setSearch: updateSearch,
      setCategory: updateCategory,
      setBrand: updateBrand,
      setStatus: updateStatus,
      setCurrentPage: updatePage,
      deleteProduct: handleDelete,
      clearFilters,
      refresh: refetch,
      updateProduct: handleUpdateProduct,
      refetchCurrentPage, // Exposed for external mutation handlers
    }),
    [
      updateSearch,
      updateCategory,
      updateBrand,
      updateStatus,
      updatePage,
      handleDelete,
      clearFilters,
      refetch,
      handleUpdateProduct,
      refetchCurrentPage,
    ],
  );

  return { status, vm, actions };
}

export type { Product };

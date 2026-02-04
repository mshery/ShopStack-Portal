import { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTenantsFetch } from "../api/queries";
import type { AsyncStatus } from "@/shared/types/models";
import { refetchTenantListPage } from "../utils/tenantQueriesUtils";

export const ITEMS_PER_PAGE = 10;

export function useTenantsListScreen() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read page directly from URL (source of truth)
  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";

  // Update URL when page changes
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

  // Update search in URL
  const updateSearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        if (value) {
          prev.set("search", value);
        } else {
          prev.delete("search");
        }
        // Reset to page 1 when search changes
        prev.set("page", "1");
        return prev;
      });
    },
    [setSearchParams],
  );

  // Fetch with server-side pagination
  const { data, isLoading, isError, isFetching, refetch } = useTenantsFetch({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const tenants = useMemo(() => data?.items ?? [], [data?.items]);
  const pagination = useMemo(
    () =>
      data?.pagination ?? {
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 1,
      },
    [data?.pagination],
  );

  // Client-side search filtering (applied on current page only)
  const filteredTenants = useMemo(() => {
    if (!search.trim()) return tenants;
    const searchLower = search.toLowerCase();
    return tenants.filter(
      (t) =>
        t.companyName.toLowerCase().includes(searchLower) ||
        t.slug.toLowerCase().includes(searchLower),
    );
  }, [tenants, search]);

  // Status derivation with isFetching for page transitions
  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : tenants.length === 0
        ? "empty"
        : "success";

  // View Model - memoized
  const vm = useMemo(
    () => ({
      tenants: filteredTenants,
      allTenantsCount: pagination.total,
      search,
      isEmpty: tenants.length === 0 && !search,
      isFiltered: filteredTenants.length === 0 && !!search,
      isFetching, // For subtle loading indicator during page transitions
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.total,
      },
    }),
    [
      filteredTenants,
      pagination.total,
      pagination.page,
      pagination.totalPages,
      search,
      tenants.length,
      isFetching,
    ],
  );

  // Refetch current page helper (for use after mutations)
  const refetchCurrentPage = useCallback(async () => {
    await refetchTenantListPage(queryClient, {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    });
  }, [queryClient, currentPage]);

  const actions = useMemo(
    () => ({
      setSearch: updateSearch,
      setCurrentPage: updatePage,
      nextPage: () =>
        updatePage(Math.min(currentPage + 1, pagination.totalPages)),
      prevPage: () => updatePage(Math.max(1, currentPage - 1)),
      refresh: refetch,
      refetchCurrentPage, // Exposed for mutation handlers
    }),
    [
      updateSearch,
      updatePage,
      currentPage,
      pagination.totalPages,
      refetch,
      refetchCurrentPage,
    ],
  );

  return { status, vm, actions };
}

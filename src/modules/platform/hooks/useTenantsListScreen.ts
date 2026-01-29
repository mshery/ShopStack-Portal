import { useState, useMemo, useCallback } from "react";
import { useTenantsFetch } from "../api/queries";
import type { AsyncStatus } from "@/shared/types/models";

const ITEMS_PER_PAGE = 10;

export function useTenantsListScreen() {
  // Trigger fetch - syncs to store via onSuccess
  const { data: tenants = [], isLoading, isError, refetch } = useTenantsFetch();

  // UI state stays LOCAL to hook - no separate Zustand store needed
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Derived data - memoized to prevent re-renders
  const filteredTenants = useMemo(() => {
    if (!search.trim()) return tenants;
    const searchLower = search.toLowerCase();
    return tenants.filter(
      (t) =>
        t.companyName.toLowerCase().includes(searchLower) ||
        t.slug.toLowerCase().includes(searchLower),
    );
  }, [tenants, search]);

  const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);

  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTenants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTenants, currentPage]);

  // Status derivation
  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : filteredTenants.length === 0
        ? "empty"
        : "success";

  // View Model - memoized
  const vm = useMemo(
    () => ({
      tenants: paginatedTenants,
      allTenantsCount: filteredTenants.length,
      search,
      isEmpty: filteredTenants.length === 0 && !search,
      isFiltered: filteredTenants.length === 0 && !!search,
      pagination: {
        currentPage,
        totalPages,
        totalItems: filteredTenants.length,
      },
    }),
    [paginatedTenants, filteredTenants.length, search, currentPage, totalPages],
  );

  // Actions - stable callbacks
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const actions = useMemo(
    () => ({
      setSearch: handleSearch,
      setCurrentPage,
      nextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
      prevPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
      refresh: refetch,
    }),
    [handleSearch, totalPages, refetch],
  );

  return { status, vm, actions };
}

import { useCallback, useMemo, useState } from "react";
import { useTenantsStore } from "@/modules/platform";

export type TenantsStatus = "loading" | "error" | "empty" | "success";

const ITEMS_PER_PAGE = 10;

export function useTenantsListScreen() {
  const { tenants } = useTenantsStore();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTenants = useMemo(() => {
    return tenants.filter(
      (t) =>
        t.companyName.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tenants, search]);

  // Pagination
  const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTenants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTenants, currentPage]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const vm = useMemo(
    () => ({
      tenants: paginatedTenants,
      allTenantsCount: filteredTenants.length,
      search,
      isEmpty: filteredTenants.length === 0,
      pagination: {
        currentPage,
        totalPages,
        totalItems: filteredTenants.length,
      },
    }),
    [paginatedTenants, filteredTenants.length, search, currentPage, totalPages],
  );

  const actions = useMemo(
    () => ({
      setSearch: handleSearch,
      setCurrentPage,
      nextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
      prevPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    }),
    [handleSearch, totalPages],
  );

  const status: TenantsStatus = tenants.length === 0 ? "empty" : "success";

  return { status, vm, actions };
}

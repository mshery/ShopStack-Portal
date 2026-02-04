import { useMemo, useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/modules/auth";
import { useParams, useSearchParams } from "react-router-dom";
import { useCustomersFetch, useDeleteCustomer } from "../api/queries";
import { useDebounce } from "@/shared/hooks/useDebounce";
import toast from "react-hot-toast";

export type CustomersStatus = "loading" | "error" | "empty" | "success";

export function useCustomersScreen() {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId, userType, isImpersonating } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const tenantId = paramTenantId || activeTenantId;
  const isSuperAdmin = userType === "platform" || isImpersonating;

  // Pagination & Search State
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);

  // Update URL on search change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
      params.set("page", "1"); // Reset to page 1 on search
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  }, [debouncedSearch, setSearchParams, searchParams]);

  // Data Fetching
  const {
    data: customersData,
    isLoading,
    isError,
    refetch,
  } = useCustomersFetch({
    page,
    limit,
    search: debouncedSearch,
  });

  const customers = useMemo(
    () => customersData?.items || [],
    [customersData?.items],
  );
  const totalItems = customersData?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Mutations
  const deleteMutation = useDeleteCustomer();

  const deleteCustomer = useCallback(
    async (customerId: string) => {
      try {
        await deleteMutation.mutateAsync(customerId);
        toast.success("Customer deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete customer";
        toast.error(message);
      }
    },
    [deleteMutation],
  );

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", newPage.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const vm = useMemo(
    () => ({
      customers,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      search,
      isEmpty: !isLoading && customers.length === 0,
      tenantId,
      isSuperAdmin,
      isDeleting: deleteMutation.isPending,
    }),
    [
      customers,
      totalItems,
      totalPages,
      page,
      limit,
      search,
      isLoading,
      tenantId,
      isSuperAdmin,
      deleteMutation.isPending,
    ],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      setPage,
      deleteCustomer,
      refetch,
    }),
    [setPage, deleteCustomer, refetch],
  );

  const status: CustomersStatus = !tenantId
    ? "error"
    : isLoading
      ? "loading"
      : isError
        ? "error"
        : customers.length === 0
          ? "empty"
          : "success";

  return { status, vm, actions };
}

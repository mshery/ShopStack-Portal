import { useState, useMemo } from "react";
import { usePurchasesFetch } from "../api/queries";
import type { AsyncStatus } from "@/shared/types/models";
export function usePurchasesScreen() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("");

  const { data, isLoading, isError } = usePurchasesFetch({
    page,
    limit: 10,
    status: statusFilter || undefined,
    vendorId: vendorId || undefined,
  });

  const vm = useMemo(() => {
    return {
      purchases: data?.items ?? [],
      pagination: {
        page,
        total: data?.total ?? 0,
        totalPages: Math.ceil((data?.total ?? 0) / 10),
      },
      filters: {
        status: statusFilter,
        vendorId,
      },
      isLoading,
      isEmpty: !isLoading && (data?.items ?? []).length === 0,
    };
  }, [data, page, statusFilter, vendorId, isLoading]);

  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : vm.isEmpty && !statusFilter && !vendorId
        ? "empty"
        : "success";

  return {
    status,
    vm,
    actions: {
      setPage,
      setStatusFilter,
      setVendorId,
    },
  };
}

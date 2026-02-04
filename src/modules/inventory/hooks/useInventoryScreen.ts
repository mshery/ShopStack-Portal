import { useState, useMemo } from "react";
import {
  useAdjustmentsFetch,
  useCreateAdjustment,
  type InventoryFilters,
  type CreateAdjustmentInput,
} from "../api/queries";
import { toast } from "react-hot-toast";
import type { AsyncStatus } from "@/shared/types/models";

export function useInventoryScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Fetch adjustments history
  const filters: InventoryFilters = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined, // Search typically filters product name or reason
    }),
    [page, search],
  );

  const {
    data: adjustmentsData,
    isLoading: isAdjustmentsLoading,
    isError: isAdjustmentsError,
  } = useAdjustmentsFetch(filters);

  const createMutation = useCreateAdjustment();

  const status: AsyncStatus = isAdjustmentsLoading
    ? "loading"
    : isAdjustmentsError
      ? "error"
      : "success";

  const vm = {
    adjustments: adjustmentsData?.items || [],
    pagination: {
      page: adjustmentsData?.pagination.page ?? 1,
      totalPages: adjustmentsData?.pagination.totalPages ?? 1,
      total: adjustmentsData?.pagination.total ?? 0,
    },
    // products: [], // Removed unused product list fetch to prevent performance issues
    search,
    isAdjustmentModalOpen,
    isLoading: status === "loading",
    isError: status === "error",
    isCreating: createMutation.isPending,
  };

  const actions = {
    setPage,
    setSearch,
    setIsAdjustmentModalOpen,
    createAdjustment: async (data: CreateAdjustmentInput) => {
      try {
        await createMutation.mutateAsync(data);
        toast.success("Inventory adjustment recorded");
        setIsAdjustmentModalOpen(false);
      } catch (error) {
        toast.error("Failed to record adjustment");
        console.error(error);
      }
    },
  };

  return { status, vm, actions };
}

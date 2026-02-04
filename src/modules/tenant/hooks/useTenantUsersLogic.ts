import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/modules/auth";
import {
  useTeamMembersFetch,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
} from "../api/queries";
import type { AsyncStatus } from "@/shared/types/api";

/**
 * useTenantUsersLogic - Tenant users list logic hook
 *
 * Uses real API via TanStack Query. Follows the rules:
 * - Screen hook owns fetching, actions, side effects
 * - Returns status, vm, actions
 */
export function useTenantUsersLogic() {
  const { currentUser, currentTenant } = useAuthStore();
  const isOwner = currentUser?.role === "owner";

  // Pagination State
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // TanStack Query hooks
  const { data, isLoading, isError, refetch, isFetching } = useTeamMembersFetch(
    { page, limit: ITEMS_PER_PAGE },
  );

  // Extract items and pagination from response
  const teamMembers = useMemo(() => data?.items ?? [], [data]);
  const pagination = useMemo(
    () =>
      data?.pagination ?? {
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 1,
      },
    [data],
  );

  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();

  // Local state
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derive status
  const status: AsyncStatus = useMemo(() => {
    if (isLoading) return "loading";
    if (isError) return "error";
    if (teamMembers.length === 0 && !search && page === 1) return "empty";
    return "success";
  }, [isLoading, isError, teamMembers.length, search, page]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return teamMembers;
    const lowerSearch = search.toLowerCase();
    return teamMembers.filter(
      (u) =>
        u.name.toLowerCase().includes(lowerSearch) ||
        u.email.toLowerCase().includes(lowerSearch),
    );
  }, [teamMembers, search]);

  // View model
  const vm = useMemo(
    () => ({
      users: filteredUsers,
      search,
      canAddMore: isOwner && (currentTenant?.maxUsers ?? 10) > pagination.total,
      maxUsers: currentTenant?.maxUsers ?? 10,
      currentCount: pagination.total,
      isOwner,
      isMutating:
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending,
      errorMessage,
      isFetching,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.total,
      },
    }),
    [
      filteredUsers,
      search,
      isOwner,
      currentTenant,
      pagination,
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      errorMessage,
      isFetching,
    ],
  );

  // Actions
  const createUser = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      if (!isOwner || !vm.canAddMore) {
        setErrorMessage("Cannot add more users or insufficient permissions");
        return {
          success: false,
          error: "Cannot add more users or insufficient permissions",
        };
      }

      try {
        setErrorMessage(null);
        await createMutation.mutateAsync(data);
        // If successful, reset to page 1 to see new user
        if (page !== 1) setPage(1);
        return { success: true };
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string; error?: string } };
          message?: string;
        };
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to create user";
        setErrorMessage(message);
        return { success: false, error: message };
      }
    },
    [isOwner, vm.canAddMore, createMutation, page],
  );

  const updateUser = useCallback(
    async (
      id: string,
      data: {
        name?: string;
        email?: string;
        status?: "active" | "inactive" | "suspended";
        phone?: string;
        role?: "owner" | "cashier";
      },
    ) => {
      try {
        setErrorMessage(null);
        await updateMutation.mutateAsync({ id, data });
        return { success: true };
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string; error?: string } };
          message?: string;
        };
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to update user";
        setErrorMessage(message);
        return { success: false, error: message };
      }
    },
    [updateMutation],
  );

  const toggleStatus = useCallback(
    async (
      userId: string,
      currentStatus: "active" | "inactive" | "suspended",
    ) => {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      return updateUser(userId, { status: newStatus });
    },
    [updateUser],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      const userToDelete = teamMembers.find((u) => u.id === userId);
      // If user not in current page list (unlikely for click action), proceed if we trust ID.
      // But we should verify ownership logic. The hook checks 'isOwner'.
      if (!isOwner) {
        setErrorMessage("Only owner can delete users");
        return { success: false, error: "Only owner can delete users" };
      }

      // Owner update check relies on filtering which relies on userToDelete being found
      if (userToDelete && userToDelete.role === "owner") {
        setErrorMessage("Cannot delete owner user");
        return { success: false, error: "Cannot delete owner user" };
      }

      try {
        setErrorMessage(null);
        await deleteMutation.mutateAsync(userId);
        return { success: true };
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string; error?: string } };
          message?: string;
        };
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to delete user";
        setErrorMessage(message);
        return { success: false, error: message };
      }
    },
    [isOwner, teamMembers, deleteMutation],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      createUser,
      updateUser,
      toggleStatus,
      deleteUser,
      refresh: refetch,
      clearError: () => setErrorMessage(null),
      nextPage: () => setPage((p) => Math.min(p + 1, pagination.totalPages)),
      prevPage: () => setPage((p) => Math.max(1, p - 1)),
    }),
    [
      createUser,
      updateUser,
      toggleStatus,
      deleteUser,
      refetch,
      pagination.totalPages,
    ],
  );

  return { status, vm, actions };
}

/**
 * Brands Screen Hook
 *
 * Screen hook for brand management following coding rules:
 * - Returns { status, vm, actions }
 * - Uses TanStack Query for data fetching
 * - Memoized vm and stable actions
 */

import { useState, useMemo, useCallback } from "react";
import { type Brand } from "../api/catalogApi";
import {
  useBrandsFetch,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "../api/queries";
import type { AsyncStatus } from "@/shared/types/api";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export function useBrandsScreen() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Fetch brands
  const { data: brands = [], isLoading, isError, refetch } = useBrandsFetch();

  // Mutations
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const deleteMutation = useDeleteBrand();

  // Mutation Wrappers with Toast logic
  const handleCreateSuccess = () => {
    toast.success("Brand created successfully");
  };

  const handleCreateError = (error: Error) => {
    toast.error(error.message || "Failed to create brand");
  };

  const handleUpdateSuccess = () => {
    setEditingId(null);
    setEditingName("");
    toast.success("Brand updated successfully");
  };

  const handleUpdateError = (error: Error) => {
    toast.error(error.message || "Failed to update brand");
  };

  const handleDeleteSuccess = () => {
    toast.success("Brand deleted successfully");
  };

  const handleDeleteError = (error: Error) => {
    toast.error(error.message || "Failed to delete brand");
  };

  // Filtered brands
  const filteredBrands = useMemo(() => {
    if (!search) return brands;
    return brands.filter((b: Brand) =>
      b.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [brands, search]);

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBrands.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBrands, currentPage]);

  // Status
  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : brands.length === 0
        ? "empty"
        : "success";

  // View Model
  const vm = useMemo(
    () => ({
      brands: paginatedBrands,
      totalBrands: filteredBrands.length,
      currentPage,
      totalPages,
      search,
      editingId,
      editingName,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    }),
    [
      paginatedBrands,
      filteredBrands.length,
      currentPage,
      totalPages,
      search,
      editingId,
      editingName,
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
    ],
  );

  // Actions
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleCreate = useCallback(
    (name: string) => {
      if (!name.trim()) return;
      createMutation.mutate(name.trim(), {
        onSuccess: handleCreateSuccess,
        onError: handleCreateError,
      });
    },
    [createMutation],
  );

  const handleStartEdit = useCallback((brand: Brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editingName.trim()) return;
    updateMutation.mutate(
      { id: editingId, name: editingName.trim() },
      {
        onSuccess: handleUpdateSuccess,
        onError: handleUpdateError,
      },
    );
  }, [editingId, editingName, updateMutation]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: handleDeleteSuccess,
        onError: handleDeleteError,
      });
    },
    [deleteMutation],
  );

  const actions = useMemo(
    () => ({
      setSearch: handleSearch,
      setCurrentPage,
      setEditingName,
      create: handleCreate,
      startEdit: handleStartEdit,
      saveEdit: handleSaveEdit,
      cancelEdit: handleCancelEdit,
      delete: handleDelete,
      refresh: refetch,
    }),
    [
      handleSearch,
      handleCreate,
      handleStartEdit,
      handleSaveEdit,
      handleCancelEdit,
      handleDelete,
      refetch,
    ],
  );

  return { status, vm, actions };
}

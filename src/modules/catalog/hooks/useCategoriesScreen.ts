/**
 * Categories Screen Hook
 *
 * Screen hook for category management following coding rules:
 * - Returns { status, vm, actions }
 * - Uses TanStack Query for data fetching
 * - Memoized vm and stable actions
 */

import { useState, useMemo, useCallback } from "react";
import { type Category } from "../api/catalogApi";
import {
  useCategoriesFetch,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../api/queries";
import type { AsyncStatus } from "@/shared/types/api";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export function useCategoriesScreen() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Fetch categories
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useCategoriesFetch();

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Mutation Wrappers with Toast logic (view logic)
  const handleCreateSuccess = () => {
    toast.success("Category created successfully");
  };

  const handleCreateError = (error: Error) => {
    toast.error(error.message || "Failed to create category");
  };

  const handleUpdateSuccess = () => {
    setEditingId(null);
    setEditingName("");
    toast.success("Category updated successfully");
  };

  const handleUpdateError = (error: Error) => {
    toast.error(error.message || "Failed to update category");
  };

  const handleDeleteSuccess = () => {
    toast.success("Category deleted successfully");
  };

  const handleDeleteError = (error: Error) => {
    toast.error(error.message || "Failed to delete category");
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter((c: Category) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categories, search]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  // Status
  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : categories.length === 0
        ? "empty"
        : "success";

  // View Model
  const vm = useMemo(
    () => ({
      categories: paginatedCategories,
      totalCategories: filteredCategories.length,
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
      paginatedCategories,
      filteredCategories.length,
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

  const handleStartEdit = useCallback((category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
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

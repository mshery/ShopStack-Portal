import { useState, useMemo, useCallback } from "react";
import {
  useVendorsFetch,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "../api/queries";
import type { Vendor } from "@/shared/types/models";
import type { AsyncStatus } from "@/shared/types/models";
import { toast } from "react-hot-toast";
import type { CreateVendorInput, UpdateVendorInput } from "../api/vendorsApi";

export function useVendorsScreen() {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // Queries
  const { data: vendors = [], isLoading, isError } = useVendorsFetch();

  // Mutations
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();

  // Actions
  const handleCreate = useCallback(
    async (data: CreateVendorInput) => {
      try {
        await createMutation.mutateAsync(data);
        setIsAddModalOpen(false);
        toast.success("Vendor created successfully");
      } catch (err) {
        toast.error("Failed to create vendor");
        console.error(err);
      }
    },
    [createMutation],
  );

  const handleUpdate = useCallback(
    async (id: string, data: UpdateVendorInput) => {
      try {
        await updateMutation.mutateAsync({ id, data });
        setSelectedVendor(null);
        toast.success("Vendor updated successfully");
      } catch (err) {
        toast.error("Failed to update vendor");
        console.error(err);
      }
    },
    [updateMutation],
  );

  const handleDelete = useCallback(async () => {
    if (!vendorToDelete) return;
    try {
      await deleteMutation.mutateAsync(vendorToDelete.id);
      setVendorToDelete(null);
      toast.success("Vendor deleted successfully");
    } catch (err) {
      toast.error("Failed to delete vendor");
      console.error(err);
    }
  }, [deleteMutation, vendorToDelete]);

  // View Model
  const vm = useMemo(() => {
    const filteredVendors = vendors.filter((v) => {
      if (!search) return true;
      const lowerSearch = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(lowerSearch) ||
        v.contactPerson?.toLowerCase().includes(lowerSearch)
      );
    });

    return {
      vendors: filteredVendors,
      isAddModalOpen,
      selectedVendor,
      vendorToDelete,
      search,
      isLoading:
        isLoading ||
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending,
      isEmpty: filteredVendors.length === 0,
    };
  }, [
    vendors,
    search,
    isAddModalOpen,
    selectedVendor,
    vendorToDelete,
    isLoading,
    createMutation.isPending,
    updateMutation.isPending,
    deleteMutation.isPending,
  ]);

  // Derived Status
  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : vendors.length === 0
        ? "empty"
        : "success";

  return {
    status,
    vm,
    actions: {
      setSearch,
      setIsAddModalOpen,
      setSelectedVendor,
      setVendorToDelete,
      createVendor: handleCreate,
      updateVendor: handleUpdate,
      deleteVendor: handleDelete,
    },
  };
}

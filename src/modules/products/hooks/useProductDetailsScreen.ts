import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useProductFetch,
  useUpdateProduct,
  useDeleteProduct,
} from "../api/queries";
import { type UpdateProductInput } from "@/modules/products/api/productsApi";
import {
  useCategoriesFetch,
  useBrandsFetch,
} from "@/modules/catalog/api/queries";
import { useVendorsStore } from "@/modules/vendors";
import { refetchProductListPage } from "../utils/productQueriesUtils";
import toast from "react-hot-toast";

export type ProductDetailsStatus = "loading" | "error" | "success";

export function useProductDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { vendors } = useVendorsStore();

  // Get pagination params for list refetch
  const pageFromParams = Number(searchParams.get("page") ?? 1);
  const limitFromParams = Number(searchParams.get("limit") ?? 10);

  // Fetch categories and brands via TanStack Query
  const { data: categories = [] } = useCategoriesFetch();
  const { data: brands = [] } = useBrandsFetch();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch product using reusable hook
  const { data: product, isLoading, isError } = useProductFetch(id || "", !!id);

  // Normalize product data
  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      tenant_id: product.tenantId,
      unitPrice:
        typeof product.unitPrice === "string"
          ? parseFloat(product.unitPrice)
          : product.unitPrice,
      costPrice:
        typeof product.costPrice === "string"
          ? parseFloat(product.costPrice)
          : product.costPrice,
      categoryId: product.categoryId ?? "",
      brandId: product.brandId ?? "",
      vendorId: product.vendorId ?? null,
      imageUrl: product.imageUrl ?? null,
      description: product.description ?? "",
    };
  }, [product]);

  // Find vendor, category, brand names
  const vendor = useMemo(() => {
    if (!normalizedProduct?.vendorId) return null;
    return vendors.find((v) => v.id === normalizedProduct.vendorId);
  }, [vendors, normalizedProduct]);

  const categoryName = useMemo(() => {
    if (!normalizedProduct?.categoryId) return "Unknown";
    return (
      categories.find((c) => c.id === normalizedProduct.categoryId)?.name ??
      "Unknown"
    );
  }, [categories, normalizedProduct]);

  const brandName = useMemo(() => {
    if (!normalizedProduct?.brandId) return "Unknown";
    return (
      brands.find((b) => b.id === normalizedProduct.brandId)?.name ?? "Unknown"
    );
  }, [brands, normalizedProduct]);

  // Calculate profit info
  const profitInfo = useMemo(() => {
    if (!normalizedProduct) return { margin: 0, percentage: "0" };
    const margin = normalizedProduct.unitPrice - normalizedProduct.costPrice;
    const percentage =
      normalizedProduct.costPrice > 0
        ? ((margin / normalizedProduct.costPrice) * 100).toFixed(1)
        : "100";
    return { margin, percentage };
  }, [normalizedProduct]);

  // Stock warning
  const stockWarning = useMemo(() => {
    if (!normalizedProduct) return false;
    return normalizedProduct.currentStock <= normalizedProduct.minimumStock;
  }, [normalizedProduct]);

  // Mutations using reusable hooks
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Actions
  const openEdit = useCallback(() => setIsEditModalOpen(true), []);
  const closeEdit = useCallback(() => setIsEditModalOpen(false), []);
  const openDelete = useCallback(() => setIsDeleteModalOpen(true), []);
  const closeDelete = useCallback(() => setIsDeleteModalOpen(false), []);

  const confirmDelete = useCallback(async () => {
    if (normalizedProduct) {
      try {
        await deleteMutation.mutateAsync(normalizedProduct.id);
        toast.success("Product deleted successfully");
        // Refetch current page after delete
        await refetchProductListPage(queryClient, {
          page: pageFromParams,
          limit: limitFromParams,
        });
        navigate("/tenant/products?page=1&limit=10");
      } catch (error) {
        toast.error((error as Error).message || "Failed to delete product");
      }
    }
  }, [
    normalizedProduct,
    deleteMutation,
    navigate,
    queryClient,
    pageFromParams,
    limitFromParams,
  ]);

  const updateProduct = useCallback(
    async (productId: string, data: UpdateProductInput) => {
      try {
        await updateMutation.mutateAsync({ id: productId, data });
        toast.success("Product updated successfully");
        // Refetch current page after update
        await refetchProductListPage(queryClient, {
          page: pageFromParams,
          limit: limitFromParams,
        });
        setIsEditModalOpen(false);
      } catch (error) {
        toast.error((error as Error).message || "Failed to update product");
        throw error;
      }
    },
    [updateMutation, queryClient, pageFromParams, limitFromParams],
  );

  // View Model
  const vm = useMemo(
    () => ({
      product: normalizedProduct,
      vendor,
      categoryName,
      brandName,
      profitInfo,
      stockWarning,
      isEditModalOpen,
      isDeleteModalOpen,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    }),
    [
      normalizedProduct,
      vendor,
      categoryName,
      brandName,
      profitInfo,
      stockWarning,
      isEditModalOpen,
      isDeleteModalOpen,
      updateMutation.isPending,
      deleteMutation.isPending,
    ],
  );

  const actions = useMemo(
    () => ({
      openEdit,
      closeEdit,
      openDelete,
      closeDelete,
      confirmDelete,
      updateProduct,
    }),
    [
      openEdit,
      closeEdit,
      openDelete,
      closeDelete,
      confirmDelete,
      updateProduct,
    ],
  );

  const status: ProductDetailsStatus = isLoading
    ? "loading"
    : isError || !normalizedProduct
      ? "error"
      : "success";

  return { status, vm, actions };
}

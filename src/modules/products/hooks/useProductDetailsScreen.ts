import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductsStore } from "@/modules/products";
import { useVendorsStore } from "@/modules/vendors";
import { useAuthStore } from "@/modules/auth";

export type ProductDetailsStatus = "loading" | "error" | "success";

export function useProductDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, removeProduct } = useProductsStore();
  const { vendors } = useVendorsStore();
  const { activeTenantId } = useAuthStore();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Find product
  const product = useMemo(() => {
    return products.find((p) => p.id === id && p.tenant_id === activeTenantId);
  }, [products, id, activeTenantId]);

  // Find vendor
  const vendor = useMemo(() => {
    if (!product?.vendorId) return null;
    return vendors.find((v) => v.id === product.vendorId);
  }, [vendors, product]);

  // Calculate profit info
  const profitInfo = useMemo(() => {
    if (!product) return { margin: 0, percentage: "0" };
    const margin = product.unitPrice - product.costPrice;
    const percentage = ((margin / product.costPrice) * 100).toFixed(1);
    return { margin, percentage };
  }, [product]);

  // Stock warning
  const stockWarning = useMemo(() => {
    if (!product) return false;
    return product.currentStock <= product.minimumStock;
  }, [product]);

  // Actions - all memoized for stability
  const openEdit = useCallback(() => setIsEditModalOpen(true), []);
  const closeEdit = useCallback(() => setIsEditModalOpen(false), []);
  const openDelete = useCallback(() => setIsDeleteModalOpen(true), []);
  const closeDelete = useCallback(() => setIsDeleteModalOpen(false), []);

  const confirmDelete = useCallback(() => {
    if (product) {
      removeProduct(product.id);
      navigate("/tenant/products");
    }
  }, [product, removeProduct, navigate]);

  // View Model - memoized
  const vm = useMemo(
    () => ({
      product,
      vendor,
      profitInfo,
      stockWarning,
      isEditModalOpen,
      isDeleteModalOpen,
    }),
    [
      product,
      vendor,
      profitInfo,
      stockWarning,
      isEditModalOpen,
      isDeleteModalOpen,
    ],
  );

  // Actions object - memoized
  const actions = useMemo(
    () => ({
      openEdit,
      closeEdit,
      openDelete,
      closeDelete,
      confirmDelete,
    }),
    [openEdit, closeEdit, openDelete, closeDelete, confirmDelete],
  );

  // Status
  const status: ProductDetailsStatus = !product ? "error" : "success";

  return { status, vm, actions };
}

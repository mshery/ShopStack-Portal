import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchasesStore } from "../stores/purchases.store";
import { useVendorsStore } from "../stores/vendors.store";
import { useProductsStore } from "../stores/products.store";
import { useAuthStore } from "../stores/auth.store";

export type PurchaseDetailsStatus = "error" | "empty" | "success";

export function usePurchaseDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchases, removePurchase } = usePurchasesStore();
  const { vendors } = useVendorsStore();
  const { products } = useProductsStore();
  const { activeTenantId } = useAuthStore();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const purchase = useMemo(() => {
    return purchases.find((p) => p.id === id && p.tenant_id === activeTenantId);
  }, [purchases, id, activeTenantId]);

  const vendor = useMemo(() => {
    if (!purchase?.vendorId) return null;
    return vendors.find((v) => v.id === purchase.vendorId);
  }, [vendors, purchase]);

  const enrichedItems = useMemo(() => {
    if (!purchase) return [];
    return purchase.items.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }));
  }, [purchase, products]);

  const totals = useMemo(() => {
    if (!purchase) return { units: 0, cost: 0 };
    return {
      units: purchase.items.reduce((sum, item) => sum + item.quantity, 0),
      cost: purchase.totalCost,
    };
  }, [purchase]);

  // Actions - all memoized for stability
  const openEdit = useCallback(() => setIsEditModalOpen(true), []);
  const closeEdit = useCallback(() => setIsEditModalOpen(false), []);
  const openDelete = useCallback(() => setIsDeleteModalOpen(true), []);
  const closeDelete = useCallback(() => setIsDeleteModalOpen(false), []);

  const confirmDelete = useCallback(() => {
    if (purchase) {
      removePurchase(purchase.id);
      navigate("/tenant/purchases");
    }
  }, [purchase, removePurchase, navigate]);

  // View Model - memoized
  const vm = useMemo(
    () => ({
      purchase,
      vendor,
      items: enrichedItems,
      totals,
      isValid: !!purchase,
      isEditModalOpen,
      isDeleteModalOpen,
    }),
    [
      purchase,
      vendor,
      enrichedItems,
      totals,
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

  const status: PurchaseDetailsStatus = !purchase ? "error" : "success";

  return { status, vm, actions };
}

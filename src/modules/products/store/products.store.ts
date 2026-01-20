import { create } from "zustand";
import type { Product } from "@/shared/types/models";
import { useAuditStore } from "./audit.store";

/**
 * Products Store - Tenant inventory management with audit logging
 */

interface ProductsStoreState {
  // State
  products: Product[];

  // Setters
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product, userId?: string, userName?: string) => void;
  updateProduct: (
    id: string,
    updates: Partial<Product>,
    userId?: string,
    userName?: string,
  ) => void;
  removeProduct: (id: string, userId?: string, userName?: string) => void;
  updateStock: (
    id: string,
    quantity: number,
    userId?: string,
    userName?: string,
  ) => void;
}

export const useProductsStore = create<ProductsStoreState>((set, get) => ({
  // Initial state
  products: [],

  // Setters
  setProducts: (products) => set({ products: products ?? [] }),

  addProduct: (product, userId = "system", userName = "System") => {
    set((state) => ({
      products: [...state.products, product],
    }));

    // Log product creation
    useAuditStore.getState().addLog({
      tenant_id: product.tenant_id,
      action: "product_created",
      entityType: "product",
      entityId: product.id,
      userId,
      userName,
      before: null,
      after: { product },
      metadata: { sku: product.sku, name: product.name },
    });
  },

  updateProduct: (id, updates, userId = "system", userName = "System") => {
    const before = get().products.find((p) => p.id === id);

    set((state) => ({
      products: state.products.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p,
      ),
    }));

    const after = get().products.find((p) => p.id === id);

    // Log product update
    if (before && after) {
      useAuditStore.getState().addLog({
        tenant_id: before.tenant_id,
        action: "product_updated",
        entityType: "product",
        entityId: id,
        userId,
        userName,
        before: { product: before },
        after: { product: after },
        metadata: {
          updatedFields: Object.keys(updates),
          sku: before.sku,
        },
      });
    }
  },

  removeProduct: (id, userId = "system", userName = "System") => {
    const product = get().products.find((p) => p.id === id);

    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));

    // Log product deletion
    if (product) {
      useAuditStore.getState().addLog({
        tenant_id: product.tenant_id,
        action: "product_deleted",
        entityType: "product",
        entityId: id,
        userId,
        userName,
        before: { product },
        after: null,
        metadata: { sku: product.sku, name: product.name },
      });
    }
  },

  updateStock: (id, quantity, userId = "system", userName = "System") => {
    const before = get().products.find((p) => p.id === id);

    set((state) => ({
      products: state.products.map((p) => {
        if (p.id !== id) return p;
        const newStock = p.currentStock + quantity;
        let status = p.status;
        if (newStock <= 0) status = "out_of_stock";
        else if (newStock <= p.minimumStock) status = "low_stock";
        else status = "in_stock";
        return {
          ...p,
          currentStock: Math.max(0, newStock),
          status,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    const after = get().products.find((p) => p.id === id);

    // Log inventory update
    if (before && after) {
      useAuditStore.getState().addLog({
        tenant_id: before.tenant_id,
        action: "inventory_update",
        entityType: "product",
        entityId: id,
        userId,
        userName,
        before: { currentStock: before.currentStock, status: before.status },
        after: { currentStock: after.currentStock, status: after.status },
        metadata: {
          quantityChange: quantity,
          sku: before.sku,
          name: before.name,
        },
      });
    }
  },
}));

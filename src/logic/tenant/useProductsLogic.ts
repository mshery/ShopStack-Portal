import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useProductsStore } from "@/stores/products.store";
import { generateId } from "@/utils/normalize";
import type { AsyncStatus, Product, ProductStatus } from "@/types";

/**
 * useProductsLogic - Product management logic hook
 */
export function useProductsLogic() {
  const { activeTenantId } = useAuthStore();
  const { products, addProduct, updateProduct, removeProduct, updateStock } =
    useProductsStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductStatus | "all">("all");

  const filteredProducts = useMemo(() => {
    if (!activeTenantId) return [];
    return products
      .filter((p) => p.tenant_id === activeTenantId)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((p) => filter === "all" || p.status === filter);
  }, [activeTenantId, products, search, filter]);

  const vm = useMemo(
    () => ({
      products: filteredProducts,
      search,
      filter,
    }),
    [filteredProducts, search, filter],
  );

  const createProduct = useCallback(
    (
      data: Omit<
        Product,
        "id" | "tenant_id" | "createdAt" | "updatedAt" | "status"
      >,
    ) => {
      if (!activeTenantId) return;

      const status: ProductStatus =
        data.currentStock <= 0
          ? "out_of_stock"
          : data.currentStock <= data.minimumStock
            ? "low_stock"
            : "in_stock";

      const newProduct: Product = {
        ...data,
        id: generateId("product"),
        tenant_id: activeTenantId,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addProduct(newProduct);
    },
    [activeTenantId, addProduct],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      setFilter,
      createProduct,
      updateProduct,
      removeProduct,
      updateStock,
    }),
    [createProduct, updateProduct, removeProduct, updateStock],
  );

  return { status: "success" as AsyncStatus, vm, actions };
}

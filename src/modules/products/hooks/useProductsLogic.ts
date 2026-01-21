import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/modules/auth";
import { useProductsStore } from "@/modules/products";
import { useTenantsStore } from "@/modules/platform";
import { generateId } from "@/shared/utils/normalize";
import type { AsyncStatus, Product, ProductStatus } from "@/shared/types/models";

/**
 * useProductsLogic - Product management logic hook
 */
export function useProductsLogic() {
  const { activeTenantId } = useAuthStore();
  const { products, addProduct, updateProduct, removeProduct, updateStock } =
    useProductsStore();
  const { tenants } = useTenantsStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductStatus | "all">("all");

  const tenant = useMemo(
    () => tenants.find((t) => t.id === activeTenantId),
    [tenants, activeTenantId],
  );

  const tenantProducts = useMemo(() => {
    if (!activeTenantId) return [];
    return products.filter((p) => p.tenant_id === activeTenantId);
  }, [activeTenantId, products]);

  const filteredProducts = useMemo(() => {
    return tenantProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((p) => filter === "all" || p.status === filter);
  }, [tenantProducts, search, filter]);

  const vm = useMemo(
    () => ({
      products: filteredProducts,
      search,
      filter,
      canAddMore: tenant ? tenantProducts.length < tenant.maxProducts : false,
      maxProducts: tenant?.maxProducts ?? 0,
      currentCount: tenantProducts.length,
    }),
    [filteredProducts, search, filter, tenant, tenantProducts.length],
  );

  const createProduct = useCallback(
    (
      data: Omit<
        Product,
        "id" | "tenant_id" | "createdAt" | "updatedAt" | "status"
      >,
    ) => {
      if (!activeTenantId || !vm.canAddMore) return;

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
    [activeTenantId, addProduct, vm.canAddMore],
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

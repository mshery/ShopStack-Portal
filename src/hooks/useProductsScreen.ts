import { useMemo, useState } from "react";
import { useProductsStore } from "../stores/products.store";
import { useAuthStore } from "../stores/auth.store";
import { useParams } from "react-router-dom";
import type { Product } from "../types";

export type ProductsStatus = "loading" | "error" | "empty" | "success";

const ITEMS_PER_PAGE = 10;

export function useProductsScreen() {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId } = useAuthStore();
  const { products: allProducts } = useProductsStore();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const tenantId = paramTenantId || activeTenantId;

  const tenantProducts = useMemo(() => {
    if (!tenantId) return [];
    return allProducts.filter((p: Product) => p.tenant_id === tenantId);
  }, [allProducts, tenantId]);

  const filteredProducts = useMemo(() => {
    return tenantProducts.filter(
      (p: Product) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tenantProducts, search]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const vm = useMemo(
    () => ({
      products: paginatedProducts,
      search,
      isEmpty: filteredProducts.length === 0,
      tenantId,
      currentPage,
      totalPages,
      totalItems: filteredProducts.length,
    }),
    [
      paginatedProducts,
      search,
      tenantId,
      currentPage,
      totalPages,
      filteredProducts.length,
    ],
  );

  const actions = useMemo(
    () => ({
      setSearch: (value: string) => {
        setSearch(value);
        setCurrentPage(1); // Reset to first page on search
      },
      setCurrentPage,
    }),
    [],
  );

  const status: ProductsStatus = !tenantId
    ? "error"
    : tenantProducts.length === 0
      ? "empty"
      : "success";

  return { status, vm, actions };
}

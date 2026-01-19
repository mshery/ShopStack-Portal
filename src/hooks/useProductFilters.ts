import { useState, useMemo, useCallback } from "react";
import type { Product } from "@/types";

/**
 * Product Filter Configuration
 */
export interface ProductFilters {
  search: string;
  category: string | null;
  brand: string | null;
  priceRange: [number, number] | null;
  stockStatus: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy: "name" | "price_asc" | "price_desc" | "stock" | "newest";
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface UseProductFiltersOptions {
  products: Product[];
  initialFilters?: Partial<ProductFilters>;
  initialItemsPerPage?: number;
  /** Map of category ID to category name */
  categoryMap?: Map<string, string>;
  /** Map of brand ID to brand name */
  brandMap?: Map<string, string>;
}

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  category: null,
  brand: null,
  priceRange: null,
  stockStatus: "all",
  sortBy: "name",
};

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

/**
 * useProductFilters - Handles product filtering, sorting, and pagination
 *
 * Optimized for large datasets (1000+ products)
 * - Uses memoization to prevent unnecessary recalculations
 * - Provides stable references for callbacks
 * - Supports multiple filter types with AND logic
 */
export function useProductFilters({
  products,
  initialFilters = {},
  initialItemsPerPage = 24,
  categoryMap = new Map(),
  brandMap = new Map(),
}: UseProductFiltersOptions) {
  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Extract unique brands from products (mapped to names)
  const brands = useMemo(() => {
    const uniqueBrandIds = new Set(
      products.map((p) => p.brandId).filter(Boolean),
    );
    const brandNames = Array.from(uniqueBrandIds)
      .map((id) => brandMap.get(id))
      .filter((name): name is string => !!name);
    return brandNames.sort();
  }, [products, brandMap]);

  // Extract unique categories from products (mapped to names)
  const categories = useMemo(() => {
    const uniqueCategoryIds = new Set(
      products.map((p) => p.categoryId).filter(Boolean),
    );
    const categoryNames = Array.from(uniqueCategoryIds)
      .map((id) => categoryMap.get(id))
      .filter((name): name is string => !!name);
    return categoryNames.sort();
  }, [products, categoryMap]);

  // Get price range bounds from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map((p) => p.unitPrice);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter (name, SKU, description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          brandMap.get(p.brandId)?.toLowerCase().includes(searchLower),
      );
    }

    // Category filter (by name, lookup from map)
    if (filters.category) {
      // Create reverse lookup from name to IDs
      const matchingCategoryIds: string[] = [];
      categoryMap.forEach((name, id) => {
        if (name === filters.category) matchingCategoryIds.push(id);
      });
      result = result.filter((p) => matchingCategoryIds.includes(p.categoryId));
    }

    // Brand filter (by name, lookup from map)
    if (filters.brand) {
      const matchingBrandIds: string[] = [];
      brandMap.forEach((name, id) => {
        if (name === filters.brand) matchingBrandIds.push(id);
      });
      result = result.filter((p) => matchingBrandIds.includes(p.brandId));
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter((p) => p.unitPrice >= min && p.unitPrice <= max);
    }

    // Stock status filter
    if (filters.stockStatus !== "all") {
      result = result.filter((p) => p.status === filters.stockStatus);
    }

    // Sorting
    switch (filters.sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price_asc":
        result.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case "price_desc":
        result.sort((a, b) => b.unitPrice - a.unitPrice);
        break;
      case "stock":
        result.sort((a, b) => b.currentStock - a.currentStock);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return result;
  }, [products, filters, brandMap, categoryMap]);

  // Calculate pagination
  const pagination: PaginationState = useMemo(() => {
    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    return {
      currentPage: Math.min(currentPage, totalPages),
      itemsPerPage,
      totalItems,
      totalPages,
    };
  }, [filteredProducts.length, itemsPerPage, currentPage]);

  // Get current page items
  const paginatedProducts = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, pagination.currentPage, itemsPerPage]);

  // Filter setters
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setFilters((prev) => ({ ...prev, category }));
    setCurrentPage(1);
  }, []);

  const setBrand = useCallback((brand: string | null) => {
    setFilters((prev) => ({ ...prev, brand }));
    setCurrentPage(1);
  }, []);

  const setPriceRange = useCallback((priceRange: [number, number] | null) => {
    setFilters((prev) => ({ ...prev, priceRange }));
    setCurrentPage(1);
  }, []);

  const setStockStatus = useCallback(
    (stockStatus: ProductFilters["stockStatus"]) => {
      setFilters((prev) => ({ ...prev, stockStatus }));
      setCurrentPage(1);
    },
    [],
  );

  const setSortBy = useCallback((sortBy: ProductFilters["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      const clampedPage = Math.max(1, Math.min(page, pagination.totalPages));
      setCurrentPage(clampedPage);
    },
    [pagination.totalPages],
  );

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.priceRange) count++;
    if (filters.stockStatus !== "all") count++;
    return count;
  }, [filters]);

  return {
    // Products
    filteredProducts,
    paginatedProducts,
    totalFilteredCount: filteredProducts.length,

    // Filter state
    filters,
    setSearch,
    setCategory,
    setBrand,
    setPriceRange,
    setStockStatus,
    setSortBy,
    resetFilters,
    activeFiltersCount,

    // Pagination state
    pagination,
    goToPage,
    setItemsPerPage: handleItemsPerPageChange,
    itemsPerPageOptions: ITEMS_PER_PAGE_OPTIONS,

    // Metadata
    brands,
    categories,
    priceBounds,
  };
}

import { useState, useCallback, useMemo } from "react";
import { useProductsFetch } from "@/modules/products/api/queries";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { ProductFilters } from "@/modules/products/api/productsApi";

export function usePOSProducts(initialLimit = 24) {
  // Local State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  // Filter State
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [stockStatus, setStockStatus] = useState<
    "all" | "in_stock" | "low_stock" | "out_of_stock"
  >("all");
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<
    "name" | "price_asc" | "price_desc" | "stock" | "newest"
  >("name");

  // Debounce search
  const debouncedSearch = useDebounce(search, 400);

  // Construct API params
  const apiParams: ProductFilters = useMemo(() => {
    const params: ProductFilters = {
      page,
      limit,
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      sortBy,
    };

    if (stockStatus !== "all") {
      params.status = stockStatus;
    }

    if (priceRange) {
      params.minPrice = priceRange[0];
      params.maxPrice = priceRange[1];
    }

    return params;
  }, [
    page,
    limit,
    debouncedSearch,
    categoryId,
    brandId,
    stockStatus,
    priceRange,
    sortBy,
  ]);

  // Fetch Data
  const { data, isLoading, isError, refetch } = useProductsFetch(apiParams);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string | null) => {
    setCategoryId(value);
    setPage(1);
  }, []);

  const handleBrandChange = useCallback((value: string | null) => {
    setBrandId(value);
    setPage(1);
  }, []);

  const handlePriceRangeChange = useCallback(
    (range: [number, number] | null) => {
      setPriceRange(range);
      setPage(1);
    },
    [],
  );

  const handleStockStatusChange = useCallback(
    (status: "all" | "in_stock" | "low_stock" | "out_of_stock") => {
      setStockStatus(status);
      setPage(1);
    },
    [],
  );

  const handleSortChange = useCallback((sort: typeof sortBy) => {
    setSortBy(sort);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategoryId(null);
    setBrandId(null);
    setStockStatus("all");
    setPriceRange(null);
    setSortBy("name");
    setPage(1);
  }, []);

  // Extract data and normalize (following useProductsScreen pattern)
  const { products, pagination } = useMemo(() => {
    const rawItems = data?.items ?? [];

    // Robustly handle pagination metadata (support both flat and nested structures)
    // "Proper approach" means centralizing this logic and handling missing fields gracefully
    const totalItems = data?.pagination?.total ?? 0;
    const itemsPerPage = data?.pagination?.limit ?? limit;
    // Calculate fallback totalPages if missing from API
    const totalPages =
      data?.pagination?.totalPages ??
      (itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 0);
    const currentPage = data?.pagination?.page ?? page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedItems = rawItems.map((p: any) => ({
      ...p,
      // Ensure shared model compliance
      tenant_id: p.tenantId || p.tenant_id,
      categoryId: p.categoryId ?? "",
      brandId: p.brandId ?? "",
      vendorId: p.vendorId ?? null,
      imageUrl: p.imageUrl ?? null,
      description: p.description ?? "",
      // API transformer already handles numbers, but we keep this for safety
      unitPrice:
        typeof p.unitPrice === "string" ? parseFloat(p.unitPrice) : p.unitPrice,
      costPrice:
        typeof p.costPrice === "string" ? parseFloat(p.costPrice) : p.costPrice,
      minSaleWeight: p.minSaleWeight ? Number(p.minSaleWeight) : undefined,
      weightIncrement: p.weightIncrement
        ? Number(p.weightIncrement)
        : undefined,
    }));

    return {
      products: normalizedItems,
      pagination: {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
      },
    };
  }, [data, limit, page]);

  return {
    products,
    pagination,
    itemsPerPageOptions: [12, 24, 48, 96],
    isLoading,
    isError,

    // State
    filters: {
      search,
      category: categoryId,
      brand: brandId,
      stockStatus,
      priceRange,
      sortBy,
    },

    // Actions
    actions: {
      setSearch: handleSearchChange,
      setCategory: handleCategoryChange,
      setBrand: handleBrandChange,
      setStockStatus: handleStockStatusChange,
      setPriceRange: handlePriceRangeChange,
      setSortBy: handleSortChange,
      setPage: handlePageChange,
      setLimit,
      resetFilters,
      refetch,
    },
  };
}

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePOSCartLogic } from "@/modules/pos";
import { useAuthStore } from "@/modules/auth";
import { CartHeader } from "@/modules/pos/components/CartHeader";
import { CategoryFilter } from "@/modules/pos/components/CategoryFilter";
import {
  ProductFiltersModal,
  type ModalFilters,
} from "@/modules/pos/components/ProductFiltersModal";
import { ProductGrid } from "@/modules/pos/components/ProductGrid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { POSPagination } from "@/modules/pos/components/POSPagination";
import { FloatingCartButton } from "@/modules/pos/components/FloatingCartButton";
import { CartModal } from "@/modules/pos/components/CartModal";
import { HoldOrdersPanel } from "@/modules/pos/components/HoldOrdersPanel";
import { ReceiptModal } from "@/modules/pos/components/ReceiptModal";
import { useTenantsStore } from "@/modules/tenant";
import { AnimatePresence } from "motion/react";
import { usePOSProducts } from "@/modules/pos/hooks/usePOSProducts";
import {
  useCategoriesFetch,
  useBrandsFetch,
} from "@/modules/catalog/api/queries";
// ModalFilters is imported from ProductFiltersModal, no need to redefine or duplicate import if it's already there.
// Checking imports at top:
// import { ProductFiltersModal, type ModalFilters } from ...
// So remove duplicate import at line 27.

/**
 * CartPage - Professional Full-page POS with modal cart
 *
 * Features:
 * - Advanced filtering (category, brand, price, stock status)
 * - Pagination for large product catalogs (1000+ products)
 * - Grid and list view modes
 * - Keyboard shortcuts
 */
export default function CartPage() {
  const { vm, actions } = usePOSCartLogic();
  const { activeTenantId } = useAuthStore();
  const { tenants } = useTenantsStore();

  // 1. Fetch Products for Grid (Server-side Pagination)
  const productQuery = usePOSProducts(12);
  const {
    products,
    pagination,
    filters,
    actions: productActions,
  } = productQuery;

  // 2. Fetch Categories & Brands for Filters
  const { data: categoriesData } = useCategoriesFetch();
  const { data: brandsData } = useBrandsFetch();

  const categories = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData
      .map(
        (c: {
          id: string;
          name: string;
          tenantId?: string;
          tenant_id?: string;
        }) => ({
          id: c.id,
          name: c.name,
          tenant_id: c.tenantId || c.tenant_id,
        }),
      )
      .filter((c) => c.tenant_id === activeTenantId);
  }, [categoriesData, activeTenantId]);

  const brands = useMemo(() => {
    if (!brandsData) return [];
    return brandsData
      .map(
        (b: {
          id: string;
          name: string;
          tenantId?: string;
          tenant_id?: string;
        }) => ({
          id: b.id,
          name: b.name,
          tenant_id: b.tenantId || b.tenant_id,
        }),
      )
      .filter((b) => b.tenant_id === activeTenantId);
  }, [brandsData, activeTenantId]);

  // Create category and brand lookup maps using VM data
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  // Category name lookup function for ProductGrid
  const getCategoryName = useMemo(() => {
    return (id: string) => categoryMap.get(id) || "Unknown";
  }, [categoryMap]);

  const [showCart, setShowCart] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Removed useProductFilters, using productQuery state instead

  // Handler for modal filter apply
  const handleFiltersApply = useCallback(
    (newFilters: ModalFilters) => {
      // Always update state, defaulting to null/"all" if undefined
      productActions.setBrand(newFilters.brand || null);
      productActions.setCategory(newFilters.category || null);
      productActions.setStockStatus(newFilters.stockStatus || "all");

      // Handle Price Range
      if (
        newFilters.minPrice !== undefined ||
        newFilters.maxPrice !== undefined
      ) {
        const min = newFilters.minPrice ?? 0;
        const max = newFilters.maxPrice ?? 999999;
        productActions.setPriceRange([min, max]);
      } else {
        // Explicitly clear price range if both are undefined
        productActions.setPriceRange(null);
      }

      setShowFiltersModal(false);
    },
    [productActions],
  );

  // Convert current filters to ModalFilters format for modal
  const modalFilters = useMemo(
    (): ModalFilters => ({
      category: filters.category || undefined,
      brand: filters.brand || undefined,
      stockStatus:
        filters.stockStatus === "all" ? undefined : filters.stockStatus,
      minPrice: filters.priceRange?.[0],
      maxPrice: filters.priceRange?.[1],
    }),
    [filters],
  );

  const tenant = tenants.find((t: { id: string }) => t.id === activeTenantId);
  const currencySymbol = vm.tenantSettings?.currencySymbol || "$";
  const taxRate = vm.tenantSettings?.taxRate || 0.1;

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press "/" to focus search
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        const isInput =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA";
        if (!isInput) {
          e.preventDefault();
          const searchInput = document.querySelector(
            'input[placeholder*="Search"]',
          ) as HTMLInputElement;
          searchInput?.focus();
        }
      }

      // Press Escape to close modals/dropdowns
      if (e.key === "Escape") {
        if (showCart) setShowCart(false);
        if (showHeldOrders) setShowHeldOrders(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCart, showHeldOrders]);

  const handleHoldOrder = () => {
    actions.holdOrder();
    setShowHeldOrders(true);
    setShowCart(false);
  };

  const handleRecallOrder = (orderId: string) => {
    actions.recallOrder(orderId);
    setShowHeldOrders(false);
  };

  const handleCheckout = () => {
    actions.checkout();
    setShowCart(false);
  };

  // Memoize the grid props to prevent unnecessary re-renders
  const gridProps = useMemo(
    () => ({
      products: products, // Using API paginated products
      cart: vm.cart,
      onAddToCart: actions.addToCart,
      viewMode,
      totalFilteredCount: pagination.totalItems,
      selectedCategory: filters.category || null,
      search: filters.search,
      getCategoryName,
    }),
    [
      products,
      vm.cart,
      actions.addToCart,
      viewMode,
      pagination.totalItems,
      filters.category,
      filters.search,
      getCategoryName,
    ],
  );

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (
      filters.priceRange &&
      (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999)
    )
      count++; // Assuming default range
    if (filters.stockStatus !== "all") count++;
    return count;
  }, [filters]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-100 dark:bg-gray-900">
      {/* Full-Screen Product View */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with Search */}
        <CartHeader
          search={filters.search}
          onSearchChange={productActions.setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        {/* Filter and View Controls */}
        <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex-1 min-w-0 -mx-4 md:mx-0">
            <CategoryFilter
              categories={categories}
              selectedCategory={filters.category || null}
              onCategoryChange={productActions.setCategory}
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Sort Dropdown */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                productActions.setSortBy(
                  value as
                    | "name"
                    | "price_asc"
                    | "price_desc"
                    | "stock"
                    | "newest",
                )
              }
            >
              <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price_asc">Price (Low-High)</SelectItem>
                <SelectItem value="price_desc">Price (High-Low)</SelectItem>
                <SelectItem value="stock">Stock Level</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFiltersModal(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFiltersCount > 0
                  ? "bg-brand-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Modal */}
        <ProductFiltersModal
          open={showFiltersModal}
          onOpenChange={setShowFiltersModal}
          filters={modalFilters}
          onApply={handleFiltersApply}
          categories={categories}
          brands={brands}
          priceBounds={{ min: 0, max: 10000 }} // Mock bounds or fetch from stats
        />
        {/* Product Grid/List with pagination */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ProductGrid {...gridProps} />

          {/* Pagination Controls */}
          {/* Pagination Controls */}
          <POSPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            itemsPerPageOptions={[12, 24, 48, 96]} // Hardcoded or from hook
            onPageChange={productActions.setPage}
            onItemsPerPageChange={productActions.setLimit}
          />
        </div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton
        cartCount={vm.cart.length}
        onClick={() => setShowCart(true)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={vm.cart}
        customers={vm.customers}
        selectedCustomerId={vm.selectedCustomerId}
        onCustomerChange={actions.setSelectedCustomerId}
        totals={vm.totals}
        discount={vm.discount}
        onDiscountChange={actions.setDiscount}
        onUpdateQuantity={actions.updateQuantity}
        onRemoveItem={actions.removeFromCart}
        onCheckout={handleCheckout}
        onClearCart={actions.clearCart}
        onHoldOrder={handleHoldOrder}
        currencySymbol={currencySymbol}
        taxRate={taxRate}
      />

      {/* Held Orders Panel */}
      <AnimatePresence>
        {showHeldOrders && (
          <HoldOrdersPanel
            heldOrders={vm.heldOrders}
            onRecallOrder={handleRecallOrder}
            onDeleteHeldOrder={actions.deleteHeldOrder}
            onClose={() => setShowHeldOrders(false)}
          />
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!vm.lastCheckout}
        onClose={actions.clearLastCheckout}
        sale={vm.lastCheckout?.sale || null}
        receipt={vm.lastCheckout?.receipt || null}
        tenantName={tenant?.companyName || "ShopStack POS"}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cashier={vm.currentUser as any}
      />
    </div>
  );
}

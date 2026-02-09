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

/**
 * CartPage - Professional Full-page POS
 */
export default function CartPage() {
  const { vm, actions } = usePOSCartLogic();
  const { activeTenantId } = useAuthStore();
  const { tenants } = useTenantsStore();

  // Fetch Products
  const productQuery = usePOSProducts(12);
  const {
    products,
    pagination,
    filters,
    actions: productActions,
  } = productQuery;

  // Fetch Categories & Brands
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

  // Category lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  const getCategoryName = useMemo(() => {
    return (id: string) => categoryMap.get(id) || "Unknown";
  }, [categoryMap]);

  const [showCart, setShowCart] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Handler for modal filter apply
  const handleFiltersApply = useCallback(
    (newFilters: ModalFilters) => {
      productActions.setBrand(newFilters.brand || null);
      productActions.setCategory(newFilters.category || null);
      productActions.setStockStatus(newFilters.stockStatus || "all");

      if (
        newFilters.minPrice !== undefined ||
        newFilters.maxPrice !== undefined
      ) {
        const min = newFilters.minPrice ?? 0;
        const max = newFilters.maxPrice ?? 999999;
        productActions.setPriceRange([min, max]);
      } else {
        productActions.setPriceRange(null);
      }

      setShowFiltersModal(false);
    },
    [productActions],
  );

  // Get selected category name for display
  const selectedCategoryName = filters.category
    ? getCategoryName(filters.category)
    : null;

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
  const currencySymbol = vm.tenantSettings?.currencySymbol || "Rs";
  const taxRate = vm.tenantSettings?.taxRate || 0.1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  };

  // Memoize grid props
  const gridProps = useMemo(
    () => ({
      products: products,
      cart: vm.cart,
      onAddToCart: actions.addToCart,
      viewMode,
      totalFilteredCount: pagination.totalItems,
      selectedCategory: selectedCategoryName,
      search: filters.search,
      getCategoryName,
      isLoading: productQuery.isLoading,
    }),
    [
      products,
      vm.cart,
      actions.addToCart,
      viewMode,
      pagination.totalItems,
      selectedCategoryName,
      filters.search,
      getCategoryName,
      productQuery.isLoading,
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
      count++;
    if (filters.stockStatus !== "all") count++;
    return count;
  }, [filters]);

  return (
    <div className="flex h-[100dvh] md:h-[calc(100vh-4rem)] flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <CartHeader
        search={filters.search}
        onSearchChange={productActions.setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Control Bar - Floating card matching header */}
      <div className="px-4 md:px-6 pt-3">
        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          {/* Categories */}
          <div className="flex-1 min-w-0">
            <CategoryFilter
              categories={categories}
              selectedCategory={filters.category || null}
              onCategoryChange={productActions.setCategory}
            />
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
              <SelectTrigger className="w-[90px] md:w-[110px] h-9 text-sm bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-2">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price_asc">Price ↑</SelectItem>
                <SelectItem value="price_desc">Price ↓</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFiltersModal(true)}
              className={`flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium transition-all ${
                activeFiltersCount > 0
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      <ProductFiltersModal
        open={showFiltersModal}
        onOpenChange={setShowFiltersModal}
        filters={modalFilters}
        onApply={handleFiltersApply}
        categories={categories}
        brands={brands}
        priceBounds={{ min: 0, max: 10000 }}
      />

      {/* Product Grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ProductGrid {...gridProps} />
        <POSPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          itemsPerPageOptions={[12, 24, 48, 96]}
          onPageChange={productActions.setPage}
          onItemsPerPageChange={productActions.setLimit}
        />
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
        processingStatus={vm.processingStatus}
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

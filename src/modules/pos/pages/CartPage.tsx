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
import { CartSidebar } from "@/modules/pos/components/CartSidebar";
import { HoldOrdersPanel } from "@/modules/pos/components/HoldOrdersPanel";
import { ReceiptModal } from "@/modules/pos/components/ReceiptModal";
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
  const { activeTenantId, currentTenant } = useAuthStore();

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

  const currencySymbol =
    ((currentTenant?.settings as Record<string, unknown>)
      ?.currencySymbol as string) || "Rs";
  const taxRate =
    ((currentTenant?.settings as Record<string, unknown>)?.taxRate as number) ||
    0.1;

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
    <div className="flex h-[100dvh] md:h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* LEFT — product browse pane */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Top search bar */}
        <CartHeader
          search={filters.search}
          onSearchChange={productActions.setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Categories + sort + filter row — single thin strip, no card. */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900 md:px-6">
          <div className="flex-1 min-w-0">
            <CategoryFilter
              categories={categories}
              selectedCategory={filters.category || null}
              onCategoryChange={productActions.setCategory}
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
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
              <SelectTrigger className="w-[110px] h-9 text-sm bg-gray-50 border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
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

            <button
              type="button"
              onClick={() => setShowFiltersModal(true)}
              className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeFiltersCount > 0
                  ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1 text-[11px] font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <ProductFiltersModal
          open={showFiltersModal}
          onOpenChange={setShowFiltersModal}
          filters={modalFilters}
          onApply={handleFiltersApply}
          categories={categories}
          brands={brands}
          priceBounds={{ min: 0, max: 10000 }}
        />

        {/* Product grid */}
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
      </div>

      {/* RIGHT — persistent cart sidebar on xl+. Mobile/tablet keeps
          the floating button + modal pattern below. */}
      <div className="hidden xl:flex">
        <CartSidebar
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
      </div>

      {/* Mobile / tablet floating cart button — hidden on xl+ where the
          sidebar is already visible. */}
      <div className="xl:hidden">
        <FloatingCartButton
          cartCount={vm.cart.length}
          onClick={() => setShowCart(true)}
        />
      </div>

      {/* Cart modal — only used on mobile/tablet. */}
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
        tenantName={currentTenant?.companyName || "ShopStack POS"}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cashier={vm.currentUser as any}
      />
    </div>
  );
}

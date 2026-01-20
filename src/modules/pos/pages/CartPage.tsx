import { useState, useEffect, useMemo } from "react";
import { usePOSCartLogic } from "@/modules/pos";
import { useProductFilters } from "@/modules/products";
import { CartHeader } from "@/modules/pos/components/CartHeader";
import { CategoryFilter } from "@/modules/pos/components/CategoryFilter";
import { ProductFiltersBar } from "@/modules/pos/components/ProductFiltersBar";
import { ProductGrid } from "@/modules/pos/components/ProductGrid";
import { POSPagination } from "@/modules/pos/components/POSPagination";
import { FloatingCartButton } from "@/modules/pos/components/FloatingCartButton";
import { CartModal } from "@/modules/pos/components/CartModal";
import { HoldOrdersPanel } from "@/modules/pos/components/HoldOrdersPanel";
import { ReceiptModal } from "@/modules/pos/components/ReceiptModal";
import { useAuthStore } from "@/modules/auth";
import { useTenantsStore } from "@/modules/tenant";
import { useCategoriesStore, useBrandsStore } from "@/modules/catalog";
import { AnimatePresence } from "motion/react";

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
    const { categories: allCategories } = useCategoriesStore();
    const { brands: allBrands } = useBrandsStore();

    // Create category and brand lookup maps
    const categoryMap = useMemo(() => {
        const tenantCats = allCategories.filter((c) => c.tenant_id === activeTenantId);
        return new Map(tenantCats.map((c) => [c.id, c.name]));
    }, [allCategories, activeTenantId]);

    const brandMap = useMemo(() => {
        const tenantBrands = allBrands.filter((b) => b.tenant_id === activeTenantId);
        return new Map(tenantBrands.map((b) => [b.id, b.name]));
    }, [allBrands, activeTenantId]);

    // Category name lookup function for ProductGrid
    const getCategoryName = useMemo(() => {
        return (id: string) => categoryMap.get(id) || "Unknown";
    }, [categoryMap]);

    const [showCart, setShowCart] = useState(false);
    const [showHeldOrders, setShowHeldOrders] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Initialize product filters with products from the store
    const {
        paginatedProducts,
        totalFilteredCount,
        filters,
        setSearch,
        setCategory,
        setBrand,
        setPriceRange,
        setStockStatus,
        setSortBy,
        resetFilters,
        activeFiltersCount,
        pagination,
        goToPage,
        setItemsPerPage,
        itemsPerPageOptions,
        brands,
        categories,
        priceBounds,
    } = useProductFilters({
        products: vm.products,
        initialItemsPerPage: 24,
        categoryMap,
        brandMap,
    });

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
                        'input[placeholder*="Search"]'
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
            products: paginatedProducts,
            cart: vm.cart,
            onAddToCart: actions.addToCart,
            viewMode,
            totalFilteredCount,
            selectedCategory: filters.category,
            search: filters.search,
            getCategoryName,
        }),
        [
            paginatedProducts,
            vm.cart,
            actions.addToCart,
            viewMode,
            totalFilteredCount,
            filters.category,
            filters.search,
            getCategoryName,
        ]
    );

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-100 dark:bg-gray-900">
            {/* Full-Screen Product View */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header with Search */}
                <CartHeader
                    search={filters.search}
                    onSearchChange={setSearch}
                    registerId={vm.registerId || ""}
                    shiftId={vm.shiftId || ""}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {/* Category Filter */}
                <div className="mt-3">
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={filters.category}
                        onCategoryChange={setCategory}
                    />
                </div>

                {/* Advanced Filters Bar */}
                <ProductFiltersBar
                    filters={filters}
                    brands={brands}
                    priceBounds={priceBounds}
                    activeFiltersCount={activeFiltersCount}
                    onBrandChange={setBrand}
                    onPriceRangeChange={setPriceRange}
                    onStockStatusChange={setStockStatus}
                    onSortByChange={setSortBy}
                    onResetFilters={resetFilters}
                />

                {/* Product Grid/List with pagination */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <ProductGrid {...gridProps} />

                    {/* Pagination Controls */}
                    <POSPagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.itemsPerPage}
                        itemsPerPageOptions={itemsPerPageOptions}
                        onPageChange={goToPage}
                        onItemsPerPageChange={setItemsPerPage}
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

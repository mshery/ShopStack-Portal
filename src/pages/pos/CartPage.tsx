import { useState, useEffect } from "react";
import { usePOSCartLogic } from "@/logic/pos/usePOSCartLogic";
import { CartHeader } from "@/components/pos/CartHeader";
import { CategoryFilter } from "@/components/pos/CategoryFilter";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { FloatingCartButton } from "@/components/pos/FloatingCartButton";
import { CartModal } from "@/components/pos/CartModal";
import { HoldOrdersPanel } from "@/components/pos/HoldOrdersPanel";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantsStore } from "@/stores/tenants.store";
import { AnimatePresence } from "motion/react";

/**
 * CartPage - Professional Full-page POS with modal cart
 *
 * Products take full screen with grid/list views, cart appears as modal
 */
export default function CartPage() {
    const { vm, actions } = usePOSCartLogic();
    const { activeTenantId } = useAuthStore();
    const { tenants } = useTenantsStore();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [showHeldOrders, setShowHeldOrders] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const tenant = tenants.find((t) => t.id === activeTenantId);
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
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleHoldOrder = () => {
        actions.holdOrder();
        setShowHeldOrders(true);
        setShowCart(false);
    };

    const handleRecallOrder = (orderId: string) => {
        actions.recallOrder(orderId);
        setShowHeldOrders(false);
    };

    const handleCheckout = (paymentMethod: "cash" | "card") => {
        actions.checkout(paymentMethod);
        setShowCart(false);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
            {/* Full-Screen Product View */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header with Search */}
                <CartHeader
                    search={vm.search}
                    onSearchChange={actions.setSearch}
                    registerId={vm.registerId || ""}
                    shiftId={vm.shiftId || ""}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {/* Category Filter */}
                <div className="mt-3">
                    <CategoryFilter
                        categories={vm.categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                </div>

                {/* Product Grid/List */}
                <ProductGrid
                    products={vm.products}
                    cart={vm.cart}
                    onAddToCart={actions.addToCart}
                    selectedCategory={selectedCategory}
                    viewMode={viewMode}
                    search={vm.search}
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

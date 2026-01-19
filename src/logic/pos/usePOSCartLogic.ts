import { useMemo, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useProductsStore } from "@/stores/products.store";
import { usePOSStore } from "@/stores/pos.store";
import { useCustomersStore } from "@/stores/customers.store";
import { useTenantsStore } from "@/stores/tenants.store";
import type { AsyncStatus, Product, Sale, Receipt } from "@/types";

/**
 * usePOSCartLogic - POS Cart screen hook
 *
 * Handles cart operations, checkout, and inventory management
 */
export function usePOSCartLogic() {
  const location = useLocation();
  const registerId = location.state?.registerId || "default-register";
  const shiftId = location.state?.shiftId || "default-shift";

  const { activeTenantId, currentUser } = useAuthStore();
  const { products } = useProductsStore();
  const { customers } = useCustomersStore();
  const { tenants } = useTenantsStore();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    completeSale,
    currentDiscount,
    setDiscount,
    heldOrders,
    holdCurrentOrder,
    recallOrder,
    deleteHeldOrder,
  } = usePOSStore();

  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  // State for last checkout (to show receipt)
  const [lastCheckout, setLastCheckout] = useState<{
    sale: Sale;
    receipt: Receipt;
  } | null>(null);

  // Return all tenant products (including out of stock) for filtering
  // The new filter system handles stock status filtering
  const tenantProducts = useMemo(() => {
    if (!activeTenantId) return [];
    return products.filter((p) => p.tenant_id === activeTenantId);
  }, [activeTenantId, products]);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set(tenantProducts.map((p) => p.category));
    return Array.from(uniqueCategories).sort();
  }, [tenantProducts]);

  const tenantCustomers = useMemo(() => {
    if (!activeTenantId) return [];
    return customers.filter((c) => c.tenant_id === activeTenantId);
  }, [activeTenantId, customers]);

  // Get tenant settings for tax rate
  const tenantSettings = useMemo(() => {
    if (!activeTenantId) return null;
    const tenant = tenants.find((t) => t.id === activeTenantId);
    return tenant?.settings || null;
  }, [activeTenantId, tenants]);

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.unitPrice * item.quantity,
      0,
    );
    const taxRate = tenantSettings?.taxRate || 0.1; // Default to 10% if no settings
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart, tenantSettings]);

  // Check for stock warnings
  const stockWarnings = useMemo(() => {
    return cart
      .filter((item) => item.quantity >= item.product.currentStock)
      .map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        requested: item.quantity,
        available: item.product.currentStock,
      }));
  }, [cart]);

  const vm = useMemo(
    () => ({
      products: tenantProducts, // Return all tenant products, filtering handled by useProductFilters
      categories,
      customers: tenantCustomers,
      cart,
      totals: cartTotals,
      search,
      selectedCustomerId,
      registerId,
      shiftId,
      stockWarnings,
      hasStockWarnings: stockWarnings.length > 0,
      lastCheckout,
      currentUser,
      discount: currentDiscount,
      heldOrders,
      tenantSettings,
    }),
    [
      tenantProducts,
      categories,
      tenantCustomers,
      cart,
      cartTotals,
      search,
      selectedCustomerId,
      registerId,
      shiftId,
      stockWarnings,
      lastCheckout,
      currentUser,
      currentDiscount,
      heldOrders,
      tenantSettings,
    ],
  );

  /**
   * Handle adding product to cart with stock validation
   */
  const handleAddToCart = useCallback(
    (product: Product) => {
      const existingItem = cart.find((item) => item.productId === product.id);
      const currentQty = existingItem?.quantity || 0;

      if (currentQty >= product.currentStock) {
        // Could show a toast notification here
        return;
      }

      addToCart(product);
    },
    [cart, addToCart],
  );

  /**
   * Handle quantity update with stock validation
   */
  const handleUpdateQuantity = useCallback(
    (productId: string, delta: number) => {
      const item = cart.find((i) => i.productId === productId);
      if (!item) return;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        removeFromCart(productId);
        return;
      }

      if (newQty > item.product.currentStock) {
        // Could show a toast notification here
        return;
      }

      updateCartItemQuantity(productId, newQty);
    },
    [cart, removeFromCart, updateCartItemQuantity],
  );

  /**
   * Handle checkout process
   */
  const handleCheckout = useCallback(async () => {
    if (!activeTenantId || !currentUser || cart.length === 0) return;

    // Check stock availability
    if (stockWarnings.length > 0) {
      // Could show a confirmation dialog here
      console.warn("Stock warnings detected:", stockWarnings);
    }

    const lineItems = cart.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.unitPrice,
      subtotal: item.subtotal,
      nameSnapshot: item.product.name,
      unitPriceSnapshot: item.product.unitPrice,
      costPriceSnapshot: item.product.costPrice || 0,
    }));

    const saleData = {
      tenant_id: activeTenantId,
      registerId,
      shiftId,
      cashierUserId: currentUser.id,
      customerId: selectedCustomerId || "", // Convert null to empty string
      lineItems,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      grandTotal: cartTotals.total,
      paymentMethod: "CASH" as const,
      discount: null, // Will be set by completeSale
    };

    const { saleId, receiptId } = completeSale(saleData);

    // Set last checkout for receipt display
    const sale: Sale = {
      ...saleData,
      id: saleId,
      number: `SALE-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomerId || "", // Ensure it's a string
      discount: currentDiscount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const receipt: Receipt = {
      id: receiptId,
      saleId,
      receiptNumber: `RCP-${Date.now().toString().slice(-8)}`,
      tenant_id: activeTenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLastCheckout({ sale, receipt });
  }, [
    activeTenantId,
    currentUser,
    cart,
    selectedCustomerId,
    cartTotals,
    registerId,
    shiftId,
    stockWarnings,
    completeSale,
    currentDiscount,
  ]);

  const actions = useMemo(
    () => ({
      setSearch,
      setSelectedCustomerId,
      addToCart: handleAddToCart,
      removeFromCart,
      updateQuantity: handleUpdateQuantity,
      clearCart,
      checkout: handleCheckout,
      clearLastCheckout: () => setLastCheckout(null),
      setDiscount,
      holdOrder: () => {
        if (cart.length > 0 && currentUser) {
          holdCurrentOrder(
            cart,
            selectedCustomerId,
            currentDiscount,
            currentUser.id,
          );
        }
      },
      recallOrder,
      deleteHeldOrder,
    }),
    [
      handleAddToCart,
      removeFromCart,
      handleUpdateQuantity,
      clearCart,
      handleCheckout,
      setDiscount,
      cart,
      selectedCustomerId,
      currentDiscount,
      currentUser,
      holdCurrentOrder,
      recallOrder,
      deleteHeldOrder,
    ],
  );

  return { status: "success" as AsyncStatus, vm, actions };
}

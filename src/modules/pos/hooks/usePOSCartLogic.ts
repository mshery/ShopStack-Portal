import { useMemo, useCallback, useState } from "react";
import { useAuthStore } from "@/modules/auth";
import { useProductsStore } from "@/modules/products";
import { usePOSStore } from "@/modules/pos";
import { useCustomersStore } from "@/modules/customers";
import { useTenantsStore } from "@/modules/platform";
import { useCategoriesStore } from "@/modules/catalog";
import type { AsyncStatus, Product, Sale, Receipt } from "@/shared/types/models";
import {
  createSale,
  reduceInventory,
  logSaleCompletion,
  logDiscountApplication,
} from "../logic/checkout.logic";
import {
  createHeldOrder,
  logOrderHold,
  logOrderRecall,
} from "../logic/order.logic";

/**
 * usePOSCartLogic - POS Cart screen hook
 *
 * Handles cart operations, checkout, and inventory management
 */
export function usePOSCartLogic() {
  const { activeTenantId, currentUser } = useAuthStore();
  const { products } = useProductsStore();
  const { customers } = useCustomersStore();
  const { tenants } = useTenantsStore();
  const { categories: allCategories } = useCategoriesStore();
  const {
    sales,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    currentDiscount,
    setDiscount,
    heldOrders,
    addHeldOrder,
    removeHeldOrder,
    addSale,
    addReceipt,
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

  // Extract unique categories from products, using category names from store
  const categories = useMemo(() => {
    const tenantCats = allCategories.filter(
      (c) => c.tenant_id === activeTenantId,
    );
    const catMap = new Map(tenantCats.map((c) => [c.id, c.name]));

    // Get unique category IDs from products, then map to names
    const uniqueCategoryIds = new Set(tenantProducts.map((p) => p.categoryId));
    const categoryNames = Array.from(uniqueCategoryIds)
      .map((id) => catMap.get(id))
      .filter((name): name is string => !!name)
      .sort();
    return categoryNames;
  }, [tenantProducts, allCategories, activeTenantId]);

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

  // Check order limits
  const orderStats = useMemo(() => {
    if (!activeTenantId || !tenantSettings) {
      return { canAddMore: true, maxOrders: Infinity, currentCount: 0 };
    }

    const tenant = tenants.find((t) => t.id === activeTenantId);
    const maxOrders = tenant?.maxOrders ?? 100;
    const currentCount = sales.filter(
      (s) => s.tenant_id === activeTenantId,
    ).length;

    return {
      canAddMore: currentCount < maxOrders,
      maxOrders,
      currentCount,
    };
  }, [activeTenantId, tenantSettings, tenants, sales]);

  const vm = useMemo(
    () => ({
      products: tenantProducts, // Return all tenant products, filtering handled by useProductFilters
      categories,
      customers: tenantCustomers,
      cart,
      totals: cartTotals,
      search,
      selectedCustomerId,
      stockWarnings,
      hasStockWarnings: stockWarnings.length > 0,
      lastCheckout,
      currentUser,
      discount: currentDiscount,
      heldOrders,
      tenantSettings,
      orderStats,
    }),
    [
      tenantProducts,
      categories,
      tenantCustomers,
      cart,
      cartTotals,
      search,
      selectedCustomerId,
      stockWarnings,
      lastCheckout,
      currentUser,
      currentDiscount,
      heldOrders,
      tenantSettings,
      orderStats,
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

    // Check order limits
    const tenant = tenants.find((t) => t.id === activeTenantId);
    const maxOrders = tenant?.maxOrders ?? 100;

    if (sales.filter((s) => s.tenant_id === activeTenantId).length >= maxOrders) {
      alert(
        `Order limit reached. Please upgrade your plan to process more orders.`,
      );
      return;
    }

    // Check stock availability
    if (stockWarnings.length > 0) {
      // Could show a confirmation dialog here
      console.warn("Stock warnings detected:", stockWarnings);
    }

    const lineItems = cart.map((item) => ({
      productId: item.productId,
      nameSnapshot: item.product.name,
      unitPriceSnapshot: item.product.unitPrice,
      costPriceSnapshot: item.product.costPrice || 0,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const saleData: Omit<Sale, "id" | "number" | "createdAt" | "updatedAt"> = {
      tenant_id: activeTenantId,
      cashierUserId: currentUser.id,
      customerId: selectedCustomerId || "",
      lineItems,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      grandTotal: cartTotals.total,
      paymentMethod: "CASH" as const,
      discount: null,
    };

    // Create sale and receipt using logic module
    const { sale, receipt } = createSale(saleData, currentDiscount);

    // Update store
    addSale(sale);
    addReceipt(receipt);
    clearCart();

    // Reduce inventory
    reduceInventory(sale.lineItems);

    // Log audit events
    logSaleCompletion(sale, currentUser.id);
    if (currentDiscount) {
      logDiscountApplication(sale, currentDiscount, currentUser.id);
    }

    setLastCheckout({ sale, receipt });
  }, [
    activeTenantId,
    currentUser,
    cart,
    selectedCustomerId,
    cartTotals,
    stockWarnings,
    sales,
    tenants,
    currentDiscount,
    addSale,
    addReceipt,
    clearCart,
  ]);

  const handleHoldOrder = useCallback(() => {
    if (cart.length === 0 || !currentUser || !activeTenantId) return;

    const order = createHeldOrder(
      cart,
      selectedCustomerId,
      currentDiscount,
      currentUser.id,
    );

    addHeldOrder(order);
    clearCart();

    // Log audit event
    const tenantId = cart[0]?.product.tenant_id || activeTenantId;
    logOrderHold(order, currentUser.id, tenantId);
  }, [
    cart,
    currentUser,
    activeTenantId,
    selectedCustomerId,
    currentDiscount,
    addHeldOrder,
    clearCart,
  ]);

  const handleRecallOrder = useCallback(
    (orderId: string) => {
      const order = heldOrders.find((o) => o.id === orderId);
      if (!order || !activeTenantId) return;

      // Restore cart from held order
      order.cart.forEach((item) => {
        addToCart(item.product, item.quantity);
      });
      setSelectedCustomerId(order.customerId);
      if (order.discount) {
        setDiscount(order.discount);
      }

      // Remove from held orders
      removeHeldOrder(orderId);

      // Log audit event
      const tenantId = order.cart[0]?.product.tenant_id || activeTenantId;
      logOrderRecall(order, tenantId);
    },
    [
      heldOrders,
      activeTenantId,
      addToCart,
      setSelectedCustomerId,
      setDiscount,
      removeHeldOrder,
    ],
  );

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
      holdOrder: handleHoldOrder,
      recallOrder: handleRecallOrder,
      deleteHeldOrder: removeHeldOrder,
    }),
    [
      handleAddToCart,
      removeFromCart,
      handleUpdateQuantity,
      clearCart,
      handleCheckout,
      setDiscount,
      handleHoldOrder,
      handleRecallOrder,
      removeHeldOrder,
    ],
  );

  return { status: "success" as AsyncStatus, vm, actions };
}

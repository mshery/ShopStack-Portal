import { useMemo, useCallback, useState } from "react";
import { useAuthStore } from "@/modules/auth";
import { usePOSStore } from "@/modules/pos";
import { useCustomersStore } from "@/modules/customers";
import { useTenantsStore } from "@/modules/platform";
import type {
  AsyncStatus,
  Product,
  Sale,
  Receipt,
} from "@/shared/types/models";
import {
  useCreateSale,
  useHeldOrdersFetch,
  useCreateHeldOrder,
  useDeleteHeldOrder,
} from "../api/queries";
import {
  posApi,
  type CreateSaleInput,
  type CreateHeldOrderInput,
} from "../api/posApi";
// Removed API queries import as we don't fetch catalog here anymore

/**
 * usePOSCartLogic - POS Cart screen hook
 *
 * Handles cart operations, checkout, and inventory management
 */
export function usePOSCartLogic() {
  const { activeTenantId, currentUser } = useAuthStore();

  const { customers } = useCustomersStore();
  const { tenants } = useTenantsStore();

  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    currentDiscount,
    setDiscount,
    // heldOrders, addHeldOrder, removeHeldOrder - Removed
  } = usePOSStore();

  const createSaleMutation = useCreateSale();
  const createHeldOrderMutation = useCreateHeldOrder();
  const deleteHeldOrderMutation = useDeleteHeldOrder();

  const { data: heldOrdersData } = useHeldOrdersFetch();

  // Adapt API held orders to Shared Model
  const heldOrders = useMemo(() => {
    if (!heldOrdersData) return [];
    return heldOrdersData.map((order) => ({
      ...order,
      // Map API CartItem to Shared CartItem
      cart: order.cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.unitPrice * item.quantity,
        // Construct a partial product just for display
        product: {
          id: item.productId,
          name: item.productName,
          unitPrice: item.unitPrice,
          tenant_id: activeTenantId || "",
          // Mock other required props
          sku: "UNKNOWN",
          categoryId: "",
          brandId: "",
          costPrice: 0,
          vendorId: null,
          currentStock: 0,
          status: "in_stock",
          imageUrl: null,
          description: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Product,
      })),
      customerId: order.customerId || null,
      discount: order.discount
        ? {
            ...order.discount,
            reason: order.discount.reason || "",
          }
        : null,
    }));
  }, [heldOrdersData, activeTenantId]);

  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  // State for last checkout (to show receipt)
  const [lastCheckout, setLastCheckout] = useState<{
    sale: Sale;
    receipt: Receipt;
  } | null>(null);

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
    // Order limits check moved to server (or handled by query count)
    // For now we assume limit check is done by server or we can fetch count
    // But since usePOSStore.sales is removed, we can't check locally.
    // We'll skip local check or fetch count if needed.
    // Simplifying for now as server rejects if limit reached.

    return {
      canAddMore: true,
      maxOrders: 100, // Placeholder
      currentCount: 0,
    };
  }, []);

  const vm = useMemo(
    () => ({
      // products: tenantProducts, // Removed
      // categories, // Removed
      // brands, // Removed
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

    try {
      const saleInput: CreateSaleInput = {
        customerId: selectedCustomerId || undefined,
        paymentMethod: "cash", // TODO: Support other methods
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        discount: currentDiscount || undefined,
        // cardDetails, amountTendered etc.
      };

      // 1. Create Sale
      const saleData = await createSaleMutation.mutateAsync(saleInput);

      // 2. Fetch Receipt
      const receiptData = await posApi.getReceiptBySale(saleData.id);

      // Map API Receipt to Shared Model Receipt
      const receipt: Receipt = {
        id: `temp-${Date.now()}`, // Placeholder as API DTO doesn't return ID
        saleId: saleData.id,
        tenant_id: activeTenantId,
        receiptNumber: receiptData.receiptNumber,
        createdAt: receiptData.createdAt,
        updatedAt: receiptData.createdAt,
      };

      // Map API Sale to Shared Model Sale
      const sale: Sale = {
        ...saleData,
        tenant_id: activeTenantId || "",
        customerId: saleData.customerId || "",
        subtotal: Number(saleData.subtotal),
        tax: Number(saleData.tax),
        grandTotal: Number(saleData.grandTotal),
        lineItems: saleData.items.map((item) => ({
          ...item,
          unitPriceSnapshot: Number(item.unitPriceSnapshot),
          costPriceSnapshot: Number(item.costPriceSnapshot),
          subtotal: Number(item.subtotal),
        })),
        paymentMethod:
          saleData.paymentMethod.toUpperCase() as unknown as Sale["paymentMethod"],
        discount: saleData.discount as unknown as Sale["discount"],
      };

      // 3. Clear Cart & Update Local State
      clearCart();
      setLastCheckout({ sale, receipt });

      // 4. Log audit events (optional, if frontend logging is still needed)
      // logSaleCompletion(sale, currentUser.id);
    } catch (error) {
      console.error("Checkout failed:", error);
      // Handle error (show toast)
      alert("Checkout failed. Please try again.");
    }
  }, [
    activeTenantId,
    currentUser,
    cart,
    selectedCustomerId,
    stockWarnings,
    currentDiscount,
    clearCart,
    createSaleMutation,
  ]);

  const handleHoldOrder = useCallback(async () => {
    if (cart.length === 0 || !currentUser || !activeTenantId) return;

    try {
      const heldOrderInput: CreateHeldOrderInput = {
        cart: cart.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.unitPrice,
        })),
        customerId: selectedCustomerId || undefined,
        discount: currentDiscount || undefined,
      };

      await createHeldOrderMutation.mutateAsync(heldOrderInput);

      clearCart();

      // Log audit event
      // const tenantId = cart[0]?.product.tenant_id || activeTenantId;
      // logOrderHold(order, currentUser.id, tenantId); // Need to adapt logger if needed
    } catch (error) {
      console.error("Failed to hold order", error);
      alert("Failed to hold order");
    }
  }, [
    cart,
    currentUser,
    activeTenantId,
    selectedCustomerId,
    currentDiscount,
    createHeldOrderMutation,
    clearCart,
  ]);

  const handleRecallOrder = useCallback(
    async (orderId: string) => {
      const order = heldOrders.find((o) => o.id === orderId);
      if (!order || !activeTenantId) return;

      // Restore cart from held order
      // We reconstruct products from the held order data since we don't fetch the full catalog here.
      order.cart.forEach((item) => {
        // Construct product from held item snapshot
        // We assume the held item has enough info or we accept potential staleness until checkout validation
        const product: Product = {
          id: item.productId,
          name: item.product?.name || "Unknown Product",
          unitPrice: item.product?.unitPrice || 0,
          tenant_id: activeTenantId || "",
          // Mock required fields if missing in snapshot
          sku: item.product?.sku || "UNKNOWN",
          categoryId: item.product?.categoryId || "",
          brandId: item.product?.brandId || "",
          costPrice: item.product?.costPrice || 0,
          currentStock: 999, // We don't know stock, assume available until checkout
          minimumStock: 0,
          status: "in_stock",
          imageUrl: item.product?.imageUrl || null,
          description: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          vendorId: null,
        };

        addToCart(product); // Adds 1
        if (item.quantity > 1) {
          updateCartItemQuantity(item.productId, item.quantity);
        }
      });

      setSelectedCustomerId(order.customerId);
      if (order.discount) {
        setDiscount(order.discount);
      }

      // Remove from held orders (API delete)
      try {
        await deleteHeldOrderMutation.mutateAsync(orderId);
        // Log audit event
        // logOrderRecall(order, activeTenantId);
      } catch (e) {
        console.error("Failed to delete held order", e);
      }
    },
    [
      heldOrders,
      activeTenantId,
      addToCart,
      updateCartItemQuantity,
      setSelectedCustomerId,
      setDiscount,
      deleteHeldOrderMutation,
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
      deleteHeldOrder: (id: string) => deleteHeldOrderMutation.mutate(id),
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
      deleteHeldOrderMutation,
    ],
  );

  return { status: "success" as AsyncStatus, vm, actions };
}

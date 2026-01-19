import { create } from "zustand";
import type {
  Register,
  Shift,
  Sale,
  Payment,
  CartItem,
  Product,
  SaleLineItem,
  Receipt,
  Refund,
  RefundLineItem,
  HeldOrder,
  Discount,
} from "@/types";
import { generateId } from "@/utils/normalize";
import { useProductsStore } from "./products.store";
import { useAuditStore } from "./audit.store";

/**
 * POS Store - Registers, Shifts, Sales, Payments, Cart, Receipts, Refunds
 */

interface POSStoreState {
  // Registers
  registers: Register[];
  activeRegisterId: string | null;

  // Shifts
  shifts: Shift[];
  activeShiftId: string | null;

  // Sales & Payments
  sales: Sale[];
  payments: Payment[];

  // Receipts
  receipts: Receipt[];

  // Refunds
  refunds: Refund[];

  // Cart (in-memory during checkout)
  cart: CartItem[];
  selectedCustomerId: string | null;
  currentDiscount: Discount | null;

  // Held Orders
  heldOrders: HeldOrder[];

  // Register setters
  setRegisters: (registers: Register[]) => void;
  setActiveRegisterId: (id: string | null) => void;

  // Shift setters
  setShifts: (shifts: Shift[]) => void;
  setActiveShiftId: (id: string | null) => void;
  openShift: (
    registerId: string,
    cashierUserId: string,
    tenantId: string,
    openingCash: number,
  ) => string;
  closeShift: (shiftId: string, closingCash: number) => void;

  // Sales & Payments setters
  setSales: (sales: Sale[]) => void;
  addSale: (sale: Sale) => void;
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;

  // Receipt setters
  setReceipts: (receipts: Receipt[]) => void;
  addReceipt: (receipt: Receipt) => void;
  markReceiptPrinted: (receiptId: string) => void;

  // Refund setters
  setRefunds: (refunds: Refund[]) => void;
  addRefund: (refund: Refund) => void;

  // Cart setters
  setSelectedCustomerId: (id: string | null) => void;
  setDiscount: (discount: Discount | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  completeSale: (
    saleData: Omit<Sale, "id" | "number" | "createdAt" | "updatedAt">,
  ) => { saleId: string; receiptId: string };

  // Held Orders setters
  holdCurrentOrder: (
    cart: CartItem[],
    customerId: string | null,
    discount: Discount | null,
    userId: string,
  ) => string;
  recallOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;

  // Refund helper
  processRefund: (
    originalSaleId: string,
    items: RefundLineItem[],
    reason: string,
    processedBy: string,
    tenantId: string,
  ) => string;
}

export const usePOSStore = create<POSStoreState>((set, get) => ({
  // Initial state
  registers: [],
  activeRegisterId: null,
  shifts: [],
  activeShiftId: null,
  sales: [],
  payments: [],
  receipts: [],
  refunds: [],
  cart: [],
  selectedCustomerId: null,
  currentDiscount: null,
  heldOrders: [],

  // Register methods
  setRegisters: (registers) => set({ registers: registers ?? [] }),
  setActiveRegisterId: (id) => set({ activeRegisterId: id }),

  // Shift methods
  setShifts: (shifts) => set({ shifts: shifts ?? [] }),
  setActiveShiftId: (id) => set({ activeShiftId: id }),

  openShift: (registerId, cashierUserId, tenantId, openingCash) => {
    const shiftId = generateId("shift");
    const newShift: Shift = {
      id: shiftId,
      tenant_id: tenantId,
      registerId,
      cashierUserId,
      openingCash,
      closingCash: null,
      expectedCash: null,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      shifts: [...state.shifts, newShift],
      activeShiftId: shiftId,
    }));
    return shiftId;
  },

  closeShift: (shiftId, closingCash) => {
    const { sales, payments, shifts } = get();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    // Calculate expected cash
    const shiftSales = sales.filter((s) => s.shiftId === shiftId);
    const shiftPayments = payments.filter((p) =>
      shiftSales.some((s) => s.id === p.saleId),
    );
    const totalCashIn = shiftPayments.reduce(
      (sum, p) => sum + p.amountTendered - p.changeGiven,
      0,
    );
    const expectedCash = shift.openingCash + totalCashIn;

    set((state) => ({
      shifts: state.shifts.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              closingCash,
              expectedCash,
              status: "closed" as const,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
      activeShiftId: null,
    }));
  },

  // Sales methods
  setSales: (sales) => set({ sales: sales ?? [] }),
  addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),

  // Payments methods
  setPayments: (payments) => set({ payments: payments ?? [] }),
  addPayment: (payment) =>
    set((state) => ({
      payments: [
        ...state.payments,
        { ...payment, updatedAt: payment.updatedAt || payment.createdAt },
      ],
    })),

  // Receipt methods
  setReceipts: (receipts) => set({ receipts: receipts ?? [] }),
  addReceipt: (receipt) =>
    set((state) => ({ receipts: [...state.receipts, receipt] })),
  markReceiptPrinted: (receiptId) =>
    set((state) => ({
      receipts: state.receipts.map((r) =>
        r.id === receiptId ? { ...r, updatedAt: new Date().toISOString() } : r,
      ),
    })),

  // Refund methods
  setRefunds: (refunds) => set({ refunds: refunds ?? [] }),
  addRefund: (refund) =>
    set((state) => ({ refunds: [...state.refunds, refund] })),

  processRefund: (originalSaleId, items, reason, processedBy, tenantId) => {
    const refundId = generateId("refund");
    const refundNumber = `REF-${Date.now().toString().slice(-6)}`;
    const refundTotal = items.reduce((sum, item) => sum + item.refundAmount, 0);

    const newRefund: Refund = {
      id: refundId,
      tenant_id: tenantId,
      originalSaleId,
      refundNumber,
      refundedItems: items,
      refundTotal,
      reason,
      processedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      refunds: [...state.refunds, newRefund],
    }));

    // Restore inventory for refunded items
    const { updateStock } = useProductsStore.getState();
    items.forEach((item) => {
      updateStock(item.productId, item.quantity); // Add back to stock
    });

    return refundId;
  },

  // Cart methods
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  addToCart: (product, quantity = 1) =>
    set((state) => {
      const existing = state.cart.find((item) => item.productId === product.id);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        return {
          cart: state.cart.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: newQuantity,
                  subtotal: newQuantity * product.unitPrice,
                }
              : item,
          ),
        };
      }
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        subtotal: quantity * product.unitPrice,
      };
      return { cart: [...state.cart, newItem] };
    }),

  updateCartItemQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          cart: state.cart.filter((item) => item.productId !== productId),
        };
      }
      return {
        cart: state.cart.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity,
                subtotal: quantity * item.product.unitPrice,
              }
            : item,
        ),
      };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),

  clearCart: () =>
    set({ cart: [], selectedCustomerId: null, currentDiscount: null }),

  setDiscount: (discount) => set({ currentDiscount: discount }),

  // Held Orders methods
  holdCurrentOrder: (cart, customerId, discount, userId) => {
    const orderId = generateId("held-order");
    const newHeldOrder: HeldOrder = {
      id: orderId,
      cart: [...cart], // Clone the cart
      customerId,
      discount,
      heldAt: new Date().toISOString(),
      heldBy: userId,
    };

    set((state) => ({
      heldOrders: [...state.heldOrders, newHeldOrder],
      cart: [],
      selectedCustomerId: null,
      currentDiscount: null,
    }));

    // Log order hold
    useAuditStore.getState().addLog({
      tenant_id: cart[0]?.product.tenant_id || "",
      action: "order_held",
      entityType: "held_order",
      entityId: orderId,
      userId,
      userName: "User",
      before: null,
      after: { order: newHeldOrder },
      metadata: {
        itemCount: cart.length,
        customerId: customerId || "walk-in",
        hasDiscount: !!discount,
      },
    });

    return orderId;
  },

  recallOrder: (orderId) => {
    const { heldOrders } = get();
    const order = heldOrders.find((o) => o.id === orderId);
    if (!order) return;

    set((state) => ({
      cart: [...order.cart], // Restore the cart
      selectedCustomerId: order.customerId,
      currentDiscount: order.discount,
      heldOrders: state.heldOrders.filter((o) => o.id !== orderId),
    }));

    // Log order recall
    useAuditStore.getState().addLog({
      tenant_id: order.cart[0]?.product.tenant_id || "",
      action: "order_recalled",
      entityType: "held_order",
      entityId: orderId,
      userId: "system",
      userName: "System",
      before: { order },
      after: null,
      metadata: {
        itemCount: order.cart.length,
        heldBy: order.heldBy,
      },
    });
  },

  deleteHeldOrder: (orderId) => {
    set((state) => ({
      heldOrders: state.heldOrders.filter((o) => o.id !== orderId),
    }));
  },

  completeSale: (saleData) => {
    const saleId = generateId("sale");
    const saleNumber = `SALE-${Date.now().toString().slice(-6)}`;
    const receiptId = generateId("receipt");
    const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
    const currentDiscount = get().currentDiscount;

    const newSale: Sale = {
      ...saleData,
      id: saleId,
      number: saleNumber,
      discount: currentDiscount, // Include current discount
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newReceipt: Receipt = {
      id: receiptId,
      saleId,
      receiptNumber,
      tenant_id: saleData.tenant_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      sales: [...state.sales, newSale],
      receipts: [...state.receipts, newReceipt],
      cart: [],
      selectedCustomerId: null,
      currentDiscount: null,
    }));

    // Reduce inventory for each item sold
    const { updateStock } = useProductsStore.getState();
    saleData.lineItems.forEach((item) => {
      updateStock(item.productId, -item.quantity); // Subtract from stock
    });

    // Log sale completion
    useAuditStore.getState().addLog({
      tenant_id: saleData.tenant_id,
      action: "sale_completed",
      entityType: "sale",
      entityId: saleId,
      userId: saleData.cashierUserId,
      userName: "Cashier",
      before: null,
      after: { sale: newSale },
      metadata: {
        saleNumber,
        itemCount: saleData.lineItems.length,
        grandTotal: saleData.grandTotal,
        paymentMethod: saleData.paymentMethod,
        customerId: saleData.customerId,
      },
    });

    // Log discount if applied
    if (currentDiscount) {
      useAuditStore.getState().addLog({
        tenant_id: saleData.tenant_id,
        action: "discount_applied",
        entityType: "sale",
        entityId: saleId,
        userId: saleData.cashierUserId,
        userName: "Cashier",
        before: null,
        after: { discount: currentDiscount },
        metadata: {
          discountType: currentDiscount.type,
          discountValue: currentDiscount.value,
          reason: currentDiscount.reason,
        },
      });
    }

    return { saleId, receiptId };
  },
}));

/**
 * Helper to create line items from cart for sale record
 */
export function cartToLineItems(cart: CartItem[]): SaleLineItem[] {
  return cart.map((item) => ({
    productId: item.productId,
    nameSnapshot: item.product.name,
    unitPriceSnapshot: item.product.unitPrice,
    costPriceSnapshot: item.product.costPrice || 0,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));
}

/**
 * Helper to get receipt by sale ID
 */
export function getReceiptBySaleId(
  receipts: Receipt[],
  saleId: string,
): Receipt | undefined {
  return receipts.find((r) => r.saleId === saleId);
}

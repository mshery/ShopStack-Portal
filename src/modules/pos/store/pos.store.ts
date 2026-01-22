import { create } from "zustand";
import type {
  Sale,
  Payment,
  CartItem,
  Product,
  SaleLineItem,
  Receipt,
  Refund,
  HeldOrder,
  Discount,
} from "@/shared/types/models";

/**
 * POS Store - Sales, Payments, Cart, Receipts, Refunds
 */

interface POSStoreState {
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

  // Held Orders setters
  addHeldOrder: (order: HeldOrder) => void;
  removeHeldOrder: (orderId: string) => void;
  setHeldOrders: (orders: HeldOrder[]) => void;
}

export const usePOSStore = create<POSStoreState>((set) => ({
  // Initial state
  sales: [],
  payments: [],
  receipts: [],
  refunds: [],
  cart: [],
  selectedCustomerId: null,
  currentDiscount: null,
  heldOrders: [],

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
  addHeldOrder: (order) =>
    set((state) => ({ heldOrders: [...state.heldOrders, order] })),
  removeHeldOrder: (orderId) =>
    set((state) => ({
      heldOrders: state.heldOrders.filter((o) => o.id !== orderId),
    })),
  setHeldOrders: (orders) => set({ heldOrders: orders ?? [] }),
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

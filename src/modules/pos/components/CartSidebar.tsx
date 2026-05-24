import { AnimatePresence, motion } from "motion/react";
import { ShoppingCart, Trash2, User } from "lucide-react";
import { CartItems } from "./CartItems";
import { CheckoutPanel } from "./CheckoutPanel";
import type { CartItem, Customer, Discount } from "@/shared/types/models";

interface CartSidebarProps {
  cart: CartItem[];
  customers: Customer[];
  selectedCustomerId: string | null;
  onCustomerChange: (id: string | null) => void;
  totals: { subtotal: number; tax: number; total: number };
  discount: Discount | null;
  onDiscountChange: (discount: Discount | null) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  onHoldOrder: () => void;
  currencySymbol: string;
  taxRate: number;
  processingStatus: "idle" | "creating_sale" | "generating_receipt";
}

/**
 * Persistent right-side cart for the POS page. Used on `xl` breakpoint
 * and up; mobile / tablet falls back to the FloatingCartButton + CartModal
 * pair.
 *
 * Mirrors the modal's content so the cashier sees the same totals and
 * customer selector in both modes. Dark-theme aware throughout.
 */
export function CartSidebar({
  cart,
  customers,
  selectedCustomerId,
  onCustomerChange,
  totals,
  discount,
  onDiscountChange,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
  onHoldOrder,
  currencySymbol,
  taxRate,
  processingStatus,
}: CartSidebarProps) {
  return (
    <aside className="flex w-[420px] flex-col border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Current order
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {cart.length === 0
              ? "No items yet"
              : `${cart.length} ${cart.length === 1 ? "item" : "items"} in cart`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClearCart}
          disabled={cart.length === 0}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Customer selector */}
      <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
        <label
          htmlFor="cart-sidebar-customer"
          className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          <User className="h-3.5 w-3.5" />
          Customer
        </label>
        <select
          id="cart-sidebar-customer"
          value={selectedCustomerId ?? ""}
          onChange={(e) =>
            onCustomerChange(e.target.value === "" ? null : e.target.value)
          }
          disabled={processingStatus !== "idle"}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
        >
          <option value="">Walk-in customer</option>
          {customers
            .filter((c) => !c.isDefault)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.email ? ` — ${c.email}` : ""}
              </option>
            ))}
        </select>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto bg-gray-50/60 px-3 py-3 dark:bg-gray-950/40">
        <AnimatePresence initial={false}>
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center px-6 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <ShoppingCart className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Your cart is empty
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-[220px]">
                Tap a product on the left to add it to the order.
              </p>
            </motion.div>
          ) : (
            <CartItems
              items={cart}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              currencySymbol={currencySymbol}
              disabled={processingStatus !== "idle"}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Checkout footer */}
      <CheckoutPanel
        totals={totals}
        discount={discount}
        onDiscountChange={onDiscountChange}
        onCheckout={onCheckout}
        onClearCart={onClearCart}
        onHoldOrder={onHoldOrder}
        cartItemCount={cart.length}
        currencySymbol={currencySymbol}
        taxRate={taxRate}
        processingStatus={processingStatus}
      />
    </aside>
  );
}

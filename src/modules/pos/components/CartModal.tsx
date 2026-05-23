import { motion, AnimatePresence } from "motion/react";
import { User, X } from "lucide-react";
import { CartItems } from "./CartItems";
import { CheckoutPanel } from "./CheckoutPanel";
import type { CartItem, Customer, Discount } from "@/shared/types/models";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
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
 * CartModal - Full-screen modal showing cart details
 */
export function CartModal({
  isOpen,
  onClose,
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
}: CartModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Detail Transaction
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Customer selector — let the cashier attach the sale to a
                known customer instead of defaulting to walk-in. The
                CartModal already received customers + onCustomerChange
                via props; this just renders the missing UI. */}
            <div className="px-4 pt-4 pb-2 bg-gray-50 border-b border-gray-100">
              <label
                htmlFor="cart-customer"
                className="flex items-center gap-2 mb-1 text-xs font-semibold text-gray-600"
              >
                <User className="h-3.5 w-3.5" />
                Customer
              </label>
              <select
                id="cart-customer"
                value={selectedCustomerId ?? ""}
                onChange={(e) =>
                  onCustomerChange(e.target.value === "" ? null : e.target.value)
                }
                disabled={processingStatus !== "idle"}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-gray-50 disabled:text-gray-400"
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

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <CartItems
                  items={cart}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                  currencySymbol={currencySymbol}
                  disabled={processingStatus !== "idle"}
                />
              )}
            </div>

            {/* Checkout Panel */}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

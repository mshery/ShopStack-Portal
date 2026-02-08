import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
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
  isCheckingOut: boolean;
}

/**
 * CartSidebar - Matching uploaded design
 *
 * "Detail Transaction" header with "Reset Order" button
 */
export function CartSidebar({
  cart,
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
  isCheckingOut,
}: CartSidebarProps) {
  return (
    <div className="flex w-[440px] flex-col border-l border-gray-200 bg-white">
      {/* Cart Header - Detail Transaction */}
      <div className="border-b border-gray-200 px-6 py-5 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Detail Transaction
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCart}
            disabled={cart.length === 0}
            className="h-9 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Reset Order
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <AnimatePresence initial={false}>
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center text-center px-6"
            >
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-100">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                Your cart is empty
              </p>
              <p className="mt-2 text-sm text-gray-500 max-w-[200px]">
                Click on products to add them to your order
              </p>
            </motion.div>
          ) : (
            <CartItems
              items={cart}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              currencySymbol={currencySymbol}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Checkout Section */}
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
        isCheckingOut={isCheckingOut}
      />
    </div>
  );
}

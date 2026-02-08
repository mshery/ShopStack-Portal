import { motion } from "motion/react";
import { formatCurrency } from "@/shared/utils/format";
import type { Discount } from "@/shared/types/models";
import { Banknote } from "lucide-react";

interface CheckoutPanelProps {
  totals: { subtotal: number; tax: number; total: number };
  discount: Discount | null;
  onDiscountChange: (discount: Discount | null) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  onHoldOrder: () => void;
  cartItemCount: number;
  currencySymbol: string;
  taxRate: number;
  isCheckingOut: boolean;
}

/**
 * CheckoutPanel - Using design system brand colors
 * Only supports cash payment method
 */
export function CheckoutPanel({
  totals,
  discount,
  onCheckout,
  onClearCart,
  onHoldOrder,
  cartItemCount,
  taxRate,
  isCheckingOut,
}: CheckoutPanelProps) {
  const discountAmount = discount
    ? discount.type === "percentage"
      ? (totals.total * discount.value) / 100
      : discount.value
    : 0;

  const finalTotal = Math.max(0, totals.total - discountAmount);

  return (
    <div className="border-t border-gray-200 bg-white p-6 space-y-4">
      {/* Promo Section - Using brand colors */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-xs">%</span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            Promo New User (10%)
          </span>
        </div>
        <button className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors">
          Change Promo
        </button>
      </div>

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sub-Total</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Tax ({(taxRate * 100).toFixed(0)}%)
          </span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(totals.tax)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-semibold text-red-600">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}
        <div className="h-px bg-gray-200 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">
            Total Payment
          </span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* Payment Method - Cash Only */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-emerald-500 rounded flex items-center justify-center">
            <Banknote className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Cash</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onClearCart()}
          disabled={cartItemCount === 0}
          className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 disabled:text-gray-400 font-semibold rounded-xl transition-colors"
        >
          Clear Cart
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onHoldOrder()}
          disabled={cartItemCount === 0}
          className="flex-1 h-12 bg-amber-100 hover:bg-amber-200 disabled:bg-amber-50 disabled:cursor-not-allowed text-amber-700 disabled:text-amber-400 font-semibold rounded-xl transition-colors"
        >
          Hold Order
        </motion.button>
      </div>

      {/* Continue Button - Using brand colors */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onCheckout()}
        disabled={cartItemCount === 0 || isCheckingOut}
        className="w-full h-14 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
      >
        {isCheckingOut ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Complete Sale (Cash)</span>
        )}
      </motion.button>
    </div>
  );
}

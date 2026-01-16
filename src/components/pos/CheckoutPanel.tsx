import { motion } from "motion/react";
import { formatCurrency } from "@/utils/format";
import type { Discount } from "@/types";

interface CheckoutPanelProps {
  totals: { subtotal: number; tax: number; total: number };
  discount: Discount | null;
  onDiscountChange: (discount: Discount | null) => void;
  onCheckout: (paymentMethod: "cash" | "card") => void;
  onClearCart: () => void;
  onHoldOrder: () => void;
  cartItemCount: number;
  currencySymbol: string;
  taxRate: number;
}

/**
 * CheckoutPanel - Using design system brand colors
 */
export function CheckoutPanel({
  totals,
  discount,
  onCheckout,
  cartItemCount,
  taxRate,
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

      {/* Payment Method */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Credit Card</span>
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Change Method →
        </button>
      </div>

      {/* Continue Button - Using brand colors */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onCheckout("card")}
        disabled={cartItemCount === 0}
        className="w-full h-14 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg"
      >
        Continue
      </motion.button>
    </div>
  );
}

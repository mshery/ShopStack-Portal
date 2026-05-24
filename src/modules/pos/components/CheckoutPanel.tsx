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

  processingStatus: "idle" | "creating_sale" | "generating_receipt";
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

  processingStatus,
}: CheckoutPanelProps) {
  const isProcessing = processingStatus !== "idle";
  const discountAmount = discount
    ? discount.type === "percentage"
      ? (totals.total * discount.value) / 100
      : discount.value
    : 0;

  const finalTotal = Math.max(0, totals.total - discountAmount);

  return (
    <div className="border-t border-gray-200 bg-white p-5 space-y-4 dark:border-gray-800 dark:bg-gray-900">
      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Sub-Total</span>
          <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Tax ({(taxRate * 100).toFixed(0)}%)
          </span>
          <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
            {formatCurrency(totals.tax)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Discount</span>
            <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}
        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            Total
          </span>
          <span className="text-2xl font-bold tabular-nums text-brand-600 dark:text-brand-400">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* Payment Method - Cash Only */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-9 items-center justify-center rounded-md bg-emerald-500">
            <Banknote className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Cash
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Payment method
        </span>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onClearCart()}
          disabled={cartItemCount === 0 || isProcessing}
          className="flex-1 h-11 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:bg-gray-900 dark:disabled:text-gray-600"
        >
          Clear cart
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onHoldOrder()}
          disabled={cartItemCount === 0 || isProcessing}
          className="flex-1 h-11 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-amber-50/40 disabled:text-amber-400 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30 dark:disabled:bg-amber-900/10 dark:disabled:text-amber-500/50"
        >
          Hold order
        </motion.button>
      </div>

      {/* Primary action — Complete Sale */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onCheckout()}
        disabled={cartItemCount === 0 || isProcessing}
        className="flex w-full h-14 items-center justify-center gap-2 rounded-xl bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
      >
        {isProcessing ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>
              {processingStatus === "creating_sale"
                ? "Processing sale…"
                : "Generating receipt…"}
            </span>
          </>
        ) : (
          <span>Complete sale · {formatCurrency(finalTotal)}</span>
        )}
      </motion.button>
    </div>
  );
}

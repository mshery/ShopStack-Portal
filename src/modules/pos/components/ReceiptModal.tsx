import { motion, AnimatePresence } from "motion/react";
import { X, Printer, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency, formatDateTime } from "@/shared/utils/format";
import type { Sale, Receipt, TenantUser } from "@/shared/types/models";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  receipt: Receipt | null;
  tenantName: string;
  cashier: TenantUser | null;
}

export function ReceiptModal({
  isOpen,
  onClose,
  sale,
  receipt,
  tenantName,
  cashier,
}: ReceiptModalProps) {
  if (!sale || !receipt) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col"
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-8 text-center text-white">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Transaction Complete!</h2>
              <p className="text-brand-100">Sale #{sale.number}</p>
            </div>

            {/* Receipt Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {tenantName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Official Digital Receipt
                </p>
                <div className="mt-4 flex flex-col gap-1 border-t border-b border-dashed border-gray-200 dark:border-gray-800 py-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Receipt:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {receipt.receiptNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDateTime(receipt.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span className="text-gray-900 dark:text-white">
                      {cashier?.name || "System"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {sale.lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.nameSnapshot}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x{" "}
                        {formatCurrency(item.unitPriceSnapshot)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-8 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(sale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Tax (10%)</span>
                  <span>{formatCurrency(sale.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                  <span>Total</span>
                  <span className="text-brand-600 dark:text-brand-400">
                    {formatCurrency(sale.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  <span>Payment Method</span>
                  <span>{sale.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl gap-2 hover:bg-white dark:hover:bg-gray-800"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-xl gap-2 hover:bg-white dark:hover:bg-gray-800"
                >
                  <Download className="h-4 w-4" />
                  Save PDF
                </Button>
              </div>
              <Button
                className="mt-3 w-full h-12 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-brand-600 dark:hover:bg-brand-700"
                onClick={onClose}
              >
                Done
              </Button>
            </div>

            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-50"
            >
              <X className="h-6 w-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

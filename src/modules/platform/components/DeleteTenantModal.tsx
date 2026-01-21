import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import type { Tenant } from "@/shared/types/models";

interface DeleteTenantModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteTenantModal({
  tenant,
  isOpen,
  onClose,
  onConfirm,
}: DeleteTenantModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === tenant.companyName;

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
      setConfirmText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg rounded-2xl border border-error-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-error-200 bg-error-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-600">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delete Tenant
                </h2>
                <p className="text-sm text-error-700">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Warning */}
            <div className="rounded-xl border-2 border-error-200 bg-error-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-error-600" />
                <div className="text-sm text-error-900">
                  <p className="font-semibold">Warning: Permanent Deletion</p>
                  <p className="mt-1">
                    Deleting this tenant will permanently remove:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>All tenant users and their data</li>
                    <li>All products and inventory</li>
                    <li>All orders and sales history</li>
                    <li>All activity logs and records</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tenant Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">You are about to delete:</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {tenant.companyName}
              </p>
              <p className="text-sm text-gray-600">
                Slug: <span className="font-mono">{tenant.slug}</span>
              </p>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm-delete"
                className="text-sm font-semibold text-gray-700"
              >
                Type the tenant name to confirm{" "}
                <span className="text-error-600">*</span>
              </Label>
              <Input
                id="confirm-delete"
                placeholder={tenant.companyName}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="h-11 border-error-300 focus:border-error-500 focus:ring-2 focus:ring-error-500/20"
              />
              <p className="text-xs text-gray-500">
                Please type <strong>{tenant.companyName}</strong> to confirm
                deletion
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canDelete}
              className="bg-error-600 hover:bg-error-700 disabled:opacity-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Tenant
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from "motion/react";
import { useEditTenantLogic } from "@/logic/platform/useEditTenantLogic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Building2, AlertTriangle, Save } from "lucide-react";
import type { Tenant, TenantStatus } from "@/types";

interface EditTenantModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTenantModal({
  tenant,
  isOpen,
  onClose,
}: EditTenantModalProps) {
  const { vm, actions } = useEditTenantLogic(tenant, onClose);

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
          className="relative z-10 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Tenant</h2>
                <p className="text-sm text-gray-600">
                  Update tenant details and status
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-companyName"
                className="text-sm font-semibold text-gray-700"
              >
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-companyName"
                placeholder="Acme Corporation"
                value={vm.formData.companyName}
                onChange={(e) =>
                  actions.updateFormData({ companyName: e.target.value })
                }
                className="h-11 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              {vm.errors.companyName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-sm text-red-600"
                >
                  <span className="text-lg">⚠️</span> {vm.errors.companyName}
                </motion.p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-slug"
                className="text-sm font-semibold text-gray-700"
              >
                Tenant Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-slug"
                placeholder="acme-corp"
                value={vm.formData.slug}
                onChange={(e) =>
                  actions.updateFormData({
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                className="h-11 border-gray-300 font-mono focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              {vm.errors.slug && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-sm text-red-600"
                >
                  <span className="text-lg">⚠️</span> {vm.errors.slug}
                </motion.p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Tenant Status
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {(["active", "inactive", "suspended"] as TenantStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => actions.updateFormData({ status })}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        vm.formData.status === status
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Badge
                        className={
                          status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : status === "inactive"
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                        }
                      >
                        {status}
                      </Badge>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Status Warning */}
            <AnimatePresence>
              {vm.showStatusWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-xl border-2 border-orange-200 bg-orange-50 p-4"
                >
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-orange-900">
                        Warning: Access Restriction
                      </h4>
                      <p className="mt-1 text-sm text-orange-800">
                        Setting this tenant to{" "}
                        <strong>{vm.formData.status}</strong> will immediately
                        block all users from accessing the system. They will not
                        be able to perform any actions until the status is
                        changed back to active.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
            <Button
              variant="outline"
              onClick={actions.cancel}
              className="hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={actions.submit}
              disabled={!vm.hasChanges}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

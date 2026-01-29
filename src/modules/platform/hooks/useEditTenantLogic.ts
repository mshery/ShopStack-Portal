import { useState, useCallback, useMemo } from "react";
import { useUpdateTenant } from "../api/queries";
import { useActivityLogsStore } from "../store/activityLogs.store";
import { useAuthStore } from "@/modules/auth";
import { generateId } from "@/shared/utils/normalize";
import type { Tenant, TenantStatus, PlatformActivityLog } from "@/shared/types/models";
import toast from "react-hot-toast";

export interface EditTenantData {
  companyName: string;
  slug: string;
  status: TenantStatus;
}

/**
 * useEditTenantLogic - Edit tenant logic hook with TanStack Query
 */
export function useEditTenantLogic(tenant: Tenant, onClose: () => void) {
  const updateTenantMutation = useUpdateTenant();
  const { addPlatformLog } = useActivityLogsStore();
  const { currentUser } = useAuthStore();

  const [formData, setFormData] = useState<EditTenantData>({
    companyName: tenant.companyName,
    slug: tenant.slug,
    status: tenant.status,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditTenantData, string>>
  >({});
  const [showStatusWarning, setShowStatusWarning] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof EditTenantData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug must be lowercase letters, numbers, and hyphens only";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<EditTenantData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates) as (keyof EditTenantData)[];
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedKeys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });

    // Show warning if changing to inactive/suspended
    if (
      updates.status &&
      (updates.status === "inactive" || updates.status === "suspended")
    ) {
      setShowStatusWarning(true);
    } else if (updates.status === "active") {
      setShowStatusWarning(false);
    }
  }, []);

  const submit = useCallback(async () => {
    if (!validateForm()) return;

    const statusChanged = formData.status !== tenant.status;

    try {
      // Update tenant via TanStack Query mutation
      await updateTenantMutation.mutateAsync({
        id: tenant.id,
        data: {
          companyName: formData.companyName,
          slug: formData.slug,
          status: formData.status,
        },
      });

      // Log activity if status changed
      if (statusChanged) {
        const log: PlatformActivityLog = {
          id: generateId("plog"),
          action: "tenant_status_updated",
          actorId: currentUser?.id ?? "unknown",
          targetType: "tenant",
          targetId: tenant.id,
          details: {
            oldStatus: tenant.status,
            newStatus: formData.status,
            companyName: formData.companyName,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addPlatformLog(log);
      }

      toast.success("Tenant updated successfully");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update tenant";
      toast.error(message);
      console.error("Failed to update tenant:", error);
    }
  }, [
    formData,
    tenant,
    validateForm,
    updateTenantMutation,
    addPlatformLog,
    currentUser,
    onClose,
  ]);

  const vm = useMemo(
    () => ({
      formData,
      errors,
      showStatusWarning,
      hasChanges:
        formData.companyName !== tenant.companyName ||
        formData.slug !== tenant.slug ||
        formData.status !== tenant.status,
      isSubmitting: updateTenantMutation.isPending,
    }),
    [formData, errors, showStatusWarning, tenant, updateTenantMutation.isPending],
  );

  const actions = useMemo(
    () => ({
      updateFormData,
      submit,
      cancel: onClose,
    }),
    [updateFormData, submit, onClose],
  );

  return { vm, actions };
}

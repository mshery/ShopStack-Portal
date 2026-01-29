import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useImpersonateTenant } from "../api/queries";
import { useAuthStore } from "@/modules/auth";
import { useActivityLogsStore } from "@/modules/platform/store/activityLogs.store";
import { generateId } from "@/shared/utils/normalize";
import { tokenStorage } from "@/core/security/storage";
import type { PlatformUser } from "@/shared/types/models";
import toast from "react-hot-toast";

/**
 * useImpersonation - Hook for admin impersonation functionality with real API
 *
 * Allows super admin to "login as" a tenant owner to view their dashboard.
 */
export function useImpersonation() {
  const navigate = useNavigate();
  const {
    currentUser,
    isImpersonating,
    originalPlatformUser,
    startImpersonation,
    endImpersonation,
  } = useAuthStore();
  const { addPlatformLog } = useActivityLogsStore();
  const impersonateMutation = useImpersonateTenant();

  const impersonateTenant = useCallback(
    async (tenantId: string) => {
      try {
        // Call real API to impersonate tenant
        const data = await impersonateMutation.mutateAsync(tenantId);

        // Store impersonation token
        tokenStorage.setTokens({
          accessToken: data.token,
          refreshToken: data.token, // Use same token for refresh
        });

        // Log the impersonation
        addPlatformLog({
          id: generateId("plog"),
          action: "admin_impersonation_started",
          actorId: currentUser?.id ?? "unknown",
          targetType: "tenant",
          targetId: tenantId,
          details: {
            tenantId: data.tenant.id,
            tenantSlug: data.tenant.slug,
            impersonatedUserName: data.user.name,
            impersonatedUserEmail: data.user.email,
          },
        });

        // Create tenant user object for auth store
        const tenantUser = {
          id: data.user.id,
          tenant_id: data.tenant.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as "owner",
          status: "active" as const,
          phone: null,
          avatarUrl: null,
          password: "",
          createdBy: "platform" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Start impersonation
        startImpersonation(tenantUser, currentUser as PlatformUser);

        // Navigate to tenant dashboard
        toast.success(`Now viewing as ${data.tenant.companyName}`);
        navigate("/tenant");
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to impersonate tenant";
        toast.error(message);
        console.error("Impersonation failed:", error);
        return false;
      }
    },
    [currentUser, addPlatformLog, startImpersonation, navigate, impersonateMutation],
  );

  const returnToPlatform = useCallback(() => {
    if (!isImpersonating || !originalPlatformUser) return;

    // Log end of impersonation
    addPlatformLog({
      id: generateId("plog"),
      action: "admin_impersonation_ended",
      actorId: originalPlatformUser.id,
      targetType: "platform",
      targetId: originalPlatformUser.id,
      details: {
        returnedFrom: (currentUser as { tenant_id?: string })?.tenant_id,
      },
    });

    // Restore original platform user tokens
    // Note: In real impl, you'd need to restore original tokens
    // For now, we'll just clear and redirect to re-login

    // End impersonation
    endImpersonation();

    // Navigate back to platform
    toast.success("Returned to platform admin view");
    navigate("/platform");
  }, [
    isImpersonating,
    originalPlatformUser,
    currentUser,
    addPlatformLog,
    endImpersonation,
    navigate,
  ]);

  const vm = useMemo(
    () => ({
      isImpersonating,
      originalPlatformUser,
      isLoading: impersonateMutation.isPending,
    }),
    [isImpersonating, originalPlatformUser, impersonateMutation.isPending],
  );

  const actions = useMemo(
    () => ({
      impersonateTenant,
      returnToPlatform,
    }),
    [impersonateTenant, returnToPlatform],
  );

  return { vm, actions };
}

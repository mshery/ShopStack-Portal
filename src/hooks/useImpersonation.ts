import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useUsersStore } from "@/stores/users.store";
import { useActivityLogsStore } from "@/stores/activityLogs.store";
import { generateId } from "@/utils/normalize";
import type { PlatformUser } from "@/types";

/**
 * useImpersonation - Hook for admin impersonation functionality
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
  const { tenantUsers } = useUsersStore();
  const { addPlatformLog } = useActivityLogsStore();

  const impersonateTenant = useCallback(
    (tenantId: string) => {
      // Find an owner for this tenant
      const tenantOwner = tenantUsers.find(
        (u) => u.tenant_id === tenantId && u.role === "owner",
      );

      if (!tenantOwner) {
        console.error("No owner found for tenant:", tenantId);
        return false;
      }

      // Log the impersonation
      addPlatformLog({
        id: generateId("plog"),
        action: "admin_impersonation_started",
        actorId: currentUser?.id ?? "unknown",
        targetType: "tenant_user",
        targetId: tenantOwner.id,
        details: {
          tenantId,
          impersonatedUserName: tenantOwner.name,
          impersonatedUserEmail: tenantOwner.email,
        },
      });

      // Start impersonation
      startImpersonation(tenantOwner, currentUser as PlatformUser);

      // Navigate to tenant dashboard
      navigate("/tenant");
      return true;
    },
    [currentUser, tenantUsers, addPlatformLog, startImpersonation, navigate],
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

    // End impersonation
    endImpersonation();

    // Navigate back to platform
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
    }),
    [isImpersonating, originalPlatformUser],
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

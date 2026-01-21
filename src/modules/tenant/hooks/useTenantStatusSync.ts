import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth";
import { useTenantsStore } from "@/modules/platform";
import type { TenantUser, TenantStatus } from "@/shared/types/models";

/**
 * Cross-Tab Tenant Status Synchronization Hook
 *
 * This hook uses the BroadcastChannel API to sync tenant status changes
 * across all browser tabs. When a super admin changes a tenant's status,
 * this change is broadcast to all tabs, and tenant users are logged out
 * if their tenant becomes inactive or suspended.
 *
 * RULES:
 * - Only one channel per app instance
 * - Cleanup on unmount
 * - Handle edge cases (channel not supported)
 */

interface TenantStatusMessage {
  type: "TENANT_STATUS_CHANGED";
  tenantId: string;
  status: TenantStatus;
  timestamp: number;
}

// Channel name for tenant status sync
const CHANNEL_NAME = "tenant-status-sync";

// Singleton channel reference to prevent multiple channels
let broadcastChannel: BroadcastChannel | null = null;

/**
 * Get or create the BroadcastChannel singleton
 */
function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") {
    console.warn("BroadcastChannel not supported in this browser");
    return null;
  }

  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }

  return broadcastChannel;
}

/**
 * Broadcast tenant status change to all tabs
 */
export function broadcastTenantStatusChange(
  tenantId: string,
  status: TenantStatus,
): void {
  const channel = getChannel();
  if (!channel) return;

  const message: TenantStatusMessage = {
    type: "TENANT_STATUS_CHANGED",
    tenantId,
    status,
    timestamp: Date.now(),
  };

  channel.postMessage(message);
}

/**
 * Hook to sync tenant status across tabs
 *
 * This hook:
 * 1. Listens for tenant status changes from other tabs
 * 2. Updates local store when change is received
 * 3. Logs out tenant users if their tenant is now inactive/suspended
 */
export function useTenantStatusSync(): void {
  const navigate = useNavigate();
  const { currentUser, userType, logout } = useAuthStore();
  const { updateTenant } = useTenantsStore();

  const handleMessage = useCallback(
    (event: MessageEvent<TenantStatusMessage>) => {
      const message = event.data;

      if (message.type !== "TENANT_STATUS_CHANGED") return;

      const { tenantId, status } = message;

      // Update local store
      updateTenant(tenantId, { status });

      // Check if current user is affected
      if (userType !== "tenant" || !currentUser) return;

      const tenantUser = currentUser as TenantUser;
      if (tenantUser.tenant_id !== tenantId) return;

      // If tenant is now inactive or suspended, log out the user
      if (status !== "active") {
        console.warn(
          `Tenant ${tenantId} status changed to ${status}. Logging out user.`,
        );
        logout();
        navigate("/login");
      }
    },
    [currentUser, userType, updateTenant, logout, navigate],
  );

  useEffect(() => {
    const channel = getChannel();
    if (!channel) return;

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);
}

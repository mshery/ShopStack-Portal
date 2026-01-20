import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/modules/auth";
import type { Permission } from "@/core/security/rbac.config";
import { ROLE_PERMISSIONS, ROUTE_PERMISSIONS } from "@/core/security/rbac.config";
import type { TenantUser } from "@/shared/types/models";

/**
 * Hook for checking user permissions
 * Returns permission checking functions based on current user's role
 */
export function usePermissions() {
  const { currentUser, userType } = useAuthStore();

  // Get current tenant user
  const tenantUser = useMemo(() => {
    if (userType !== "tenant") return null;
    return currentUser as TenantUser | null;
  }, [currentUser, userType]);

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!tenantUser) return false;

      const userPermissions = ROLE_PERMISSIONS[tenantUser.role];
      return userPermissions.includes(permission);
    },
    [tenantUser],
  );

  /**
   * Check if current user can access a specific route
   */
  const canAccessRoute = useCallback(
    (route: string): boolean => {
      if (!tenantUser) return false;

      // Get the permission required for this route
      const requiredPermission = ROUTE_PERMISSIONS[route];

      // If no permission is defined for this route, allow access
      if (!requiredPermission) return true;

      // Check if user has the required permission
      return hasPermission(requiredPermission);
    },
    [tenantUser, hasPermission],
  );

  /**
   * Check if current user can perform an action
   * Useful for showing/hiding buttons
   */
  const can = useCallback(
    (action: Permission): boolean => {
      return hasPermission(action);
    },
    [hasPermission],
  );

  /**
   * Get user's role
   */
  const role = useMemo(() => tenantUser?.role || null, [tenantUser]);

  /**
   * Check if user is a specific role
   */
  const isRole = useCallback(
    (checkRole: string): boolean => {
      return role === checkRole;
    },
    [role],
  );

  return {
    hasPermission,
    canAccessRoute,
    can,
    role,
    isRole,
    isCashier: role === "cashier",
    isOwner: role === "owner",
    isSuperAdmin:
      userType === "platform" || useAuthStore.getState().isImpersonating,
  };
}

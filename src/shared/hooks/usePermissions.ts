/**
 * usePermissions Hook
 *
 * Provides permission checking utilities based on the current user's role.
 * Uses the auth store to determine user context and RBAC config for permissions.
 */

import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/modules/auth";
import {
  type Permission,
  type TenantRole,
  rolePermissions,
  platformPermissions,
  routePermissions,
} from "@/core/security/rbac.config";

interface UsePermissionsResult {
  /**
   * Check if the current user has a specific permission
   */
  hasPermission: (permission: Permission) => boolean;

  /**
   * Check if the current user has any of the specified permissions
   */
  hasAnyPermission: (permissions: Permission[]) => boolean;

  /**
   * Check if the current user has all of the specified permissions
   */
  hasAllPermissions: (permissions: Permission[]) => boolean;

  /**
   * Alias for hasPermission (more readable in some contexts)
   */
  can: (permission: Permission) => boolean;

  /**
   * Check if the current user can access a specific route
   */
  canAccessRoute: (path: string) => boolean;

  /**
   * Check if the current user is a super admin
   */
  isSuperAdmin: boolean;

  /**
   * Check if the current user is a tenant owner
   */
  isOwner: boolean;

  /**
   * Check if the current user is a tenant owner (admin role removed)
   */
  isAdmin: boolean;

  /**
   * Get all permissions for the current user
   */
  permissions: Permission[];
}

export function usePermissions(): UsePermissionsResult {
  const { currentUser, userType } = useAuthStore();

  // Get the user's role
  const role = useMemo<TenantRole | "super_admin" | null>(() => {
    if (!currentUser) return null;
    return currentUser.role as TenantRole | "super_admin";
  }, [currentUser]);

  // Get permissions for the current role
  const permissions = useMemo<Permission[]>(() => {
    if (!role) return [];

    if (role === "super_admin" || userType === "platform") {
      return platformPermissions;
    }

    return rolePermissions[role as TenantRole] ?? [];
  }, [role, userType]);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      // Platform users have all permissions
      if (userType === "platform" || role === "super_admin") {
        return true;
      }

      return permissions.includes(permission);
    },
    [permissions, userType, role],
  );

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback(
    (perms: Permission[]): boolean => {
      return perms.some((p) => hasPermission(p));
    },
    [hasPermission],
  );

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback(
    (perms: Permission[]): boolean => {
      return perms.every((p) => hasPermission(p));
    },
    [hasPermission],
  );

  // Check if user can access a specific route
  const canAccessRoute = useCallback(
    (path: string): boolean => {
      // Platform users can access platform routes
      if (userType === "platform" && path.startsWith("/platform")) {
        return true;
      }

      // Find matching route permission
      // Check for exact match first
      const exactPermission = routePermissions[path];
      if (exactPermission) {
        return hasPermission(exactPermission);
      }

      // Check for prefix match (e.g., /tenant/products/123 matches /tenant/products)
      const matchingRoute = Object.keys(routePermissions)
        .sort((a, b) => b.length - a.length) // Sort by length descending
        .find((route) => path.startsWith(route));

      if (matchingRoute) {
        return hasPermission(routePermissions[matchingRoute]);
      }

      // Default to allowing access if no permission is defined
      return true;
    },
    [hasPermission, userType],
  );

  // Role checks
  const isSuperAdmin = useMemo(
    () => role === "super_admin" || userType === "platform",
    [role, userType],
  );

  const isOwner = useMemo(() => role === "owner", [role]);

  // isAdmin now equals isOwner since admin role was removed
  const isAdmin = useMemo(() => role === "owner", [role]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can: hasPermission,
    canAccessRoute,
    isSuperAdmin,
    isOwner,
    isAdmin,
    permissions,
  };
}

export default usePermissions;

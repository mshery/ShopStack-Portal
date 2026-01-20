/**
 * Permission Utilities
 *
 * Functions for checking user permissions based on RBAC configuration.
 */

import {
    type Permission,
    type TenantRole,
    rolePermissions,
} from "./rbac.config";

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
    role: TenantRole,
    permission: Permission
): boolean {
    const permissions = rolePermissions[role];
    return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
    role: TenantRole,
    permissions: Permission[]
): boolean {
    return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
    role: TenantRole,
    permissions: Permission[]
): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: TenantRole): Permission[] {
    return rolePermissions[role] ?? [];
}

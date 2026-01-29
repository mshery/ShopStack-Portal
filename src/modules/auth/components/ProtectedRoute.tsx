import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, useAuthHydrated } from "@/modules/auth";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { Permission } from "@/core/security/rbac.config";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission: Permission;
  fallbackPath?: string;
}

/**
 * Protected Route Component
 *
 * 1. Waits for Zustand to rehydrate from localStorage
 * 2. Checks if user is authenticated
 * 3. Checks if user has required permission before rendering children
 * 4. Redirects to login if not authenticated, or to fallback if no permission
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  fallbackPath,
}: ProtectedRouteProps) {
  const { currentUser, userType } = useAuthStore();
  const hasHydrated = useAuthHydrated();
  const { hasPermission } = usePermissions();

  // Wait for Zustand to rehydrate before making decisions
  if (!hasHydrated) {
    return null; // Show nothing while hydrating
  }

  // First check: Is user authenticated?
  if (!currentUser || !userType) {
    return <Navigate to="/login" replace />;
  }

  // Second check: Does user have required permission?
  if (!hasPermission(requiredPermission)) {
    // Redirect to appropriate dashboard based on user type
    const defaultFallback = userType === "platform" ? "/platform" : "/tenant";
    return <Navigate to={fallbackPath || defaultFallback} replace />;
  }

  return <>{children}</>;
}

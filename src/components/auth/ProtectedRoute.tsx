import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/config/rbac.config";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission: Permission;
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * 1. Checks if user is authenticated
 * 2. Checks if user has required permission before rendering children
 * 3. Redirects to login if not authenticated, or to fallback if no permission
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  fallbackPath,
}: ProtectedRouteProps) {
  const { currentUser, userType } = useAuthStore();
  const { hasPermission } = usePermissions();

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

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, useAuthHydrated } from "@/modules/auth";
import { tokenStorage } from "@/core/security/storage";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Auth Guard Component
 *
 * Used on public auth pages (login, signup, etc.)
 * Redirects authenticated users to their appropriate dashboard.
 *
 * Logic:
 * - Wait for Zustand persist to rehydrate from localStorage
 * - If user has token AND is in auth store → redirect to dashboard
 * - Otherwise → show the auth page
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, userType } = useAuthStore();
  const hasHydrated = useAuthHydrated();
  const hasToken = tokenStorage.hasToken();

  // Wait for Zustand to rehydrate from localStorage before making decisions
  if (!hasHydrated) {
    // Show nothing while hydrating (prevents flash of login page)
    return null;
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (hasToken && currentUser && userType) {
    const dashboardPath = userType === "platform" ? "/platform" : "/tenant";
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}

/**
 * PublicOnlyRoute - Alias for AuthGuard
 * Wrapper for pages that should only be accessible to non-authenticated users
 */
export function PublicOnlyRoute({ children }: AuthGuardProps) {
  return <AuthGuard>{children}</AuthGuard>;
}

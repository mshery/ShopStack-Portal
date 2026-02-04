import { Navigate } from "react-router-dom";
import { useAuthStore, useAuthHydrated } from "@/modules/auth";
import { tokenStorage } from "@/core/security/storage";

/**
 * Root Redirect Component
 *
 * Redirects users to appropriate dashboard if authenticated,
 * otherwise to login page.
 *
 * Waits for Zustand to hydrate from localStorage before deciding.
 */
export function RootRedirect() {
  const { currentUser, userType } = useAuthStore();
  const hasHydrated = useAuthHydrated();
  const hasToken = tokenStorage.hasToken();

  // Wait for Zustand to rehydrate before making decisions
  if (!hasHydrated) {
    return null; // Show nothing while hydrating
  }

  // If authenticated, redirect to appropriate dashboard
  if (hasToken && currentUser && userType) {
    return (
      <Navigate
        to={userType === "platform" ? "/platform" : "/tenant"}
        replace
      />
    );
  }

  // Otherwise, redirect to login
  return <Navigate to="/login" replace />;
}

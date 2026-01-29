import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginResponse } from "../api/authApi";
import { useAuthStore } from "../store/auth.store";
import { tokenStorage } from "@/core/security/storage";
import type { AsyncStatus } from "@/shared/types/common";

/**
 * useAuthLogic - Unified authentication logic hook
 *
 * Handles login for both platform and tenant users.
 * Auto-detects user type based on backend response (tenantId presence).
 *
 * After successful login, navigates via window.location.
 * The auth store handles localStorage persistence internally.
 */
export function useAuthLogic() {
  const { currentUser, userType } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login mutation - unified for both platform and tenant
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data: LoginResponse) => {
      console.log("Login API successful", data);

      // Store tokens first
      tokenStorage.setTokens({
        accessToken: data.token,
        refreshToken: data.refreshToken,
      });

      // Auto-detect user type based on tenantId
      const isPlatformUser = !data.user.tenantId;

      // Call the store's login action directly on the store instance
      // The store now handles localStorage persistence internally
      const storeState = useAuthStore.getState();

      if (isPlatformUser) {
        // Platform user
        const platformUser = {
          id: data.user.id,
          email: data.user.email,
          password: "",
          name: data.user.name,
          role: "super_admin" as const,
          status:
            data.user.status === "suspended"
              ? ("inactive" as const)
              : data.user.status,
          phone: data.user.phone,
          avatarUrl: data.user.avatarUrl,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
        };

        // Atomic login - sets all state and persists to localStorage
        storeState.login({
          user: platformUser,
          userType: "platform",
          tenantId: null,
          tenant: null,
        });

        console.log("Auth store updated for platform user, navigating...");
        window.location.href = "/platform";
      } else {
        // Tenant user
        const tenantUser = {
          id: data.user.id,
          tenant_id: data.user.tenantId!,
          email: data.user.email,
          password: "",
          name: data.user.name,
          role: data.user.role as "owner" | "cashier",
          status:
            data.user.status === "suspended"
              ? ("inactive" as const)
              : data.user.status,
          phone: data.user.phone,
          avatarUrl: data.user.avatarUrl,
          createdBy: data.user.createdBy as "platform" | "tenant",
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
        };

        // Atomic login - sets all state and persists to localStorage
        storeState.login({
          user: tenantUser,
          userType: "tenant",
          tenantId: data.user.tenantId,
          tenant: data.tenant, // Pass tenant from login response
        });

        console.log("Auth store updated for tenant user, navigating...");
        window.location.href = "/tenant";
      }
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Invalid email or password");
    },
  });

  const loginWithCredentials = useCallback(
    (email: string, password: string) => {
      setErrorMessage(null);
      loginMutation.mutate({ email, password });
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    useAuthStore.getState().logout();
    window.location.href = "/login";
  }, []);

  const status: AsyncStatus = loginMutation.isPending ? "loading" : "success";

  const vm = useMemo(
    () => ({
      errorMessage,
      isLoading: loginMutation.isPending,
      isAuthenticated: !!currentUser && !!userType,
    }),
    [errorMessage, loginMutation.isPending, currentUser, userType],
  );

  const actions = useMemo(
    () => ({
      loginWithCredentials,
      logout,
      clearError: () => setErrorMessage(null),
    }),
    [loginWithCredentials, logout],
  );

  return { status, vm, actions };
}

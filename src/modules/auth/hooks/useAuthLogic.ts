import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginResponse } from "../api/authApi";
import { useAuthStore } from "../store/auth.store";
import { tokenStorage } from "@/core/security/storage";
import type { AsyncStatus } from "@/shared/types/common";

/**
 * useAuthLogic - Unified authentication logic hook
 *
 * Handles login for both platform and tenant users. The backend now sets
 * the refresh token as an httpOnly cookie, so we only persist the access
 * token in memory (security.md rule 3 / ITS-26).
 */
export function useAuthLogic() {
  const { currentUser, userType } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data: LoginResponse) => {
      tokenStorage.setAccessToken(data.token);

      const isPlatformUser = !data.user.tenantId;
      const storeState = useAuthStore.getState();

      if (isPlatformUser) {
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

        storeState.login({
          user: platformUser,
          userType: "platform",
          tenantId: null,
          tenant: null,
        });

        window.location.href = "/platform";
      } else {
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

        storeState.login({
          user: tenantUser,
          userType: "tenant",
          tenantId: data.user.tenantId,
          tenant: data.tenant,
        });

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

  const logout = useCallback(async () => {
    // Best-effort: tell the backend to revoke the refresh family and clear
    // the httpOnly cookie. Then drop the in-memory access token regardless.
    await authApi.logout();
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

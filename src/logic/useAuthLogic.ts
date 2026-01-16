import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useUsersStore } from "@/stores/users.store";
import type { AsyncStatus } from "@/types";

/**
 * useAuthLogic - Authentication logic hook
 *
 * Follows the screen hook pattern:
 * - Returns { status, vm, actions }
 * - vm is memoized
 * - actions are stable
 */
export function useAuthLogic() {
  const navigate = useNavigate();
  const { setCurrentUser, setUserType, setActiveTenantId } = useAuthStore();
  const { platformUsers, tenantUsers } = useUsersStore();

  const [status, setStatus] = useState<AsyncStatus>("success");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<
    "platform" | "tenant"
  >("platform");

  const loginWithCredentials = useCallback(
    (email: string, password: string) => {
      // Clear any previous errors
      setErrorMessage(null);

      // Check platform users first
      const platformUser = platformUsers.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );

      if (platformUser) {
        setCurrentUser(platformUser);
        setUserType("platform");
        setActiveTenantId(null);
        navigate("/platform");
        return;
      }

      // Check tenant users
      const tenantUser = tenantUsers.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );

      if (tenantUser) {
        setCurrentUser(tenantUser);
        setUserType("tenant");
        setActiveTenantId(tenantUser.tenant_id);
        navigate("/tenant");
        return;
      }

      // No user found
      setErrorMessage("Invalid email or password. Please try again.");
      setStatus("error");
    },
    [
      platformUsers,
      tenantUsers,
      setCurrentUser,
      setUserType,
      setActiveTenantId,
      navigate,
    ],
  );

  const loginAsPlatformUser = useCallback(
    (userId: string) => {
      const user = platformUsers.find((u) => u.id === userId);
      if (!user) {
        setErrorMessage("User not found");
        setStatus("error");
        return;
      }

      setCurrentUser(user);
      setUserType("platform");
      setActiveTenantId(null);
      navigate("/platform");
    },
    [platformUsers, setCurrentUser, setUserType, setActiveTenantId, navigate],
  );

  const loginAsTenantUser = useCallback(
    (userId: string) => {
      const user = tenantUsers.find((u) => u.id === userId);
      if (!user) {
        setErrorMessage("User not found");
        setStatus("error");
        return;
      }

      setCurrentUser(user);
      setUserType("tenant");
      setActiveTenantId(user.tenant_id);
      navigate("/tenant");
    },
    [tenantUsers, setCurrentUser, setUserType, setActiveTenantId, navigate],
  );

  const vm = useMemo(
    () => ({
      platformUsers,
      tenantUsers,
      selectedUserType,
      errorMessage,
    }),
    [platformUsers, tenantUsers, selectedUserType, errorMessage],
  );

  const actions = useMemo(
    () => ({
      loginWithCredentials,
      loginAsPlatformUser,
      loginAsTenantUser,
      setSelectedUserType,
      clearError: () => setErrorMessage(null),
    }),
    [loginWithCredentials, loginAsPlatformUser, loginAsTenantUser],
  );

  return { status, vm, actions };
}

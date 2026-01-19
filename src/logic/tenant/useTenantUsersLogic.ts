import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useUsersStore } from "@/stores/users.store";
import { useTenantsStore } from "@/stores/tenants.store";
import { generateId } from "@/utils/normalize";
import type { TenantUser, UserRole, UserStatus } from "@/types";

/**
 * useTenantUsersLogic - Tenant users list logic hook
 */
export function useTenantUsersLogic() {
  const { activeTenantId } = useAuthStore();
  const { tenantUsers, addTenantUser, updateTenantUser, removeTenantUser } =
    useUsersStore();
  const { tenants } = useTenantsStore();

  const [search, setSearch] = useState("");

  const tenant = useMemo(
    () => tenants.find((t) => t.id === activeTenantId),
    [tenants, activeTenantId],
  );

  const filteredUsers = useMemo(() => {
    if (!activeTenantId) return [];
    return tenantUsers
      .filter((u) => u.tenant_id === activeTenantId)
      .filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      );
  }, [activeTenantId, tenantUsers, search]);

  const vm = useMemo(
    () => ({
      users: filteredUsers,
      search,
      canAddMore: tenant ? filteredUsers.length < tenant.maxUsers : false,
      maxUsers: tenant?.maxUsers ?? 0,
      currentCount: filteredUsers.length,
    }),
    [filteredUsers, search, tenant],
  );

  const createUser = useCallback(
    (data: { name: string; email: string; role: UserRole }) => {
      if (!activeTenantId) return;

      const newUser: TenantUser = {
        id: generateId("user"),
        tenant_id: activeTenantId,
        email: data.email,
        password: "", // Password should be set separately in a real app
        name: data.name,
        role: data.role,
        status: "active",
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addTenantUser(newUser);
    },
    [activeTenantId, addTenantUser],
  );

  const toggleStatus = useCallback(
    (userId: string, currentStatus: UserStatus) => {
      updateTenantUser(userId, {
        status: currentStatus === "active" ? "inactive" : "active",
      });
    },
    [updateTenantUser],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      createUser,
      toggleStatus,
      deleteUser: removeTenantUser,
    }),
    [createUser, toggleStatus, removeTenantUser],
  );

  return { status, vm, actions };
}

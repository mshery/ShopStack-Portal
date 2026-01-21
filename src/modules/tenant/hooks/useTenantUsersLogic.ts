import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/modules/auth";
import { useUsersStore } from "@/modules/tenant";
import { useTenantsStore } from "@/modules/platform";
import { generateId } from "@/shared/utils/normalize";
import type { TenantUser, UserRole, UserStatus } from "@/shared/types/models";

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
      if (!activeTenantId || !vm.canAddMore) return;

      const newUser: TenantUser = {
        id: generateId("user"),
        tenant_id: activeTenantId,
        email: data.email,
        password: "", // Password should be set separately in a real app
        name: data.name,
        role: data.role,
        status: "active",
        phone: null,
        avatarUrl: null,
        createdBy: "tenant",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addTenantUser(newUser);
    },
    [activeTenantId, addTenantUser, vm.canAddMore],
  );

  const toggleStatus = useCallback(
    (userId: string, currentStatus: UserStatus) => {
      updateTenantUser(userId, {
        status: currentStatus === "active" ? "inactive" : "active",
      });
    },
    [updateTenantUser],
  );

  const { userType, isImpersonating } = useAuthStore();
  const isSuperAdmin = userType === "platform" || isImpersonating;

  const deleteUser = useCallback(
    (userId: string) => {
      const userToDelete = tenantUsers.find((u) => u.id === userId);
      if (!userToDelete) return;

      const canDelete = isSuperAdmin || userToDelete.createdBy === "tenant";

      if (!canDelete) {
        alert("Only Super Admins can delete platform-created users.");
        return;
      }
      removeTenantUser(userId);
    },
    [isSuperAdmin, removeTenantUser, tenantUsers],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      createUser,
      toggleStatus,
      deleteUser,
    }),
    [createUser, toggleStatus, deleteUser],
  );

  return { status: "success", vm, actions };
}

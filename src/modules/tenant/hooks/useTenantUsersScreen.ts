import { useMemo, useState, useCallback } from "react";
import { useUsersStore } from "@/modules/tenant";
import { useTenantsStore } from "@/modules/platform";
import { useAuthStore } from "@/modules/auth";
import { useParams } from "react-router-dom";
import type { TenantUser } from "@/shared/types/models";

export type UsersStatus = "loading" | "error" | "empty" | "success";

export function useTenantUsersScreen() {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId } = useAuthStore();
  const { tenants } = useTenantsStore();
  const { tenantUsers: allUsers } = useUsersStore();
  const [search, setSearch] = useState("");

  const tenantId = paramTenantId || activeTenantId;

  const tenant = useMemo(
    () => tenants.find((t) => t.id === tenantId),
    [tenants, tenantId],
  );

  const tenantUsers = useMemo(() => {
    if (!tenantId) return [];
    return allUsers.filter((u: TenantUser) => u.tenant_id === tenantId);
  }, [allUsers, tenantId]);

  const filteredUsers = useMemo(() => {
    return tenantUsers.filter(
      (u: TenantUser) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tenantUsers, search]);

  const { userType, isImpersonating } = useAuthStore();
  const isSuperAdmin = userType === "platform" || isImpersonating;

  const vm = useMemo(
    () => ({
      users: filteredUsers,
      search,
      isEmpty: filteredUsers.length === 0,
      tenantId,
      canAddMore: tenant ? tenantUsers.length < tenant.maxUsers : false,
      maxUsers: tenant?.maxUsers ?? 0,
      currentCount: tenantUsers.length,
      isSuperAdmin,
    }),
    [filteredUsers, search, tenantId, tenant, tenantUsers.length, isSuperAdmin],
  );

  const { removeTenantUser } = useUsersStore();

  const deleteUser = useCallback(
    (userId: string) => {
      if (!isSuperAdmin) {
        alert("Only Super Admins can delete users.");
        return;
      }
      removeTenantUser(userId);
    },
    [isSuperAdmin, removeTenantUser],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      deleteUser,
    }),
    [deleteUser],
  );

  const status: UsersStatus = !tenantId
    ? "error"
    : tenantUsers.length === 0
      ? "empty"
      : "success";

  return { status, vm, actions };
}

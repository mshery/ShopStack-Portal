import { useMemo, useState } from "react";
import { useUsersStore } from "../stores/users.store";
import { useAuthStore } from "../stores/auth.store";
import { useParams } from "react-router-dom";
import type { TenantUser } from "../types";

export type UsersStatus = "loading" | "error" | "empty" | "success";

export function useTenantUsersScreen() {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId } = useAuthStore();
  const { tenantUsers: allUsers } = useUsersStore();
  const [search, setSearch] = useState("");

  const tenantId = paramTenantId || activeTenantId;

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

  const vm = useMemo(
    () => ({
      users: filteredUsers,
      search,
      isEmpty: filteredUsers.length === 0,
      tenantId,
    }),
    [filteredUsers, search, tenantId],
  );

  const actions = useMemo(
    () => ({
      setSearch,
    }),
    [],
  );

  const status: UsersStatus = !tenantId
    ? "error"
    : tenantUsers.length === 0
      ? "empty"
      : "success";

  return { status, vm, actions };
}

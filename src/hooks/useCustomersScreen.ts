import { useMemo, useState } from "react";
import { useCustomersStore } from "../stores/customers.store";
import { useAuthStore } from "../stores/auth.store";
import { useParams } from "react-router-dom";
import type { Customer } from "../types";

export type CustomersStatus = "loading" | "error" | "empty" | "success";

export function useCustomersScreen() {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId } = useAuthStore();
  const { customers: allCustomers } = useCustomersStore();
  const [search, setSearch] = useState("");

  const tenantId = paramTenantId || activeTenantId;

  const tenantCustomers = useMemo(() => {
    if (!tenantId) return [];
    return allCustomers.filter((c: Customer) => c.tenant_id === tenantId);
  }, [allCustomers, tenantId]);

  const filteredCustomers = useMemo(() => {
    return tenantCustomers.filter(
      (c: Customer) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search)),
    );
  }, [tenantCustomers, search]);

  const vm = useMemo(
    () => ({
      customers: filteredCustomers,
      search,
      isEmpty: filteredCustomers.length === 0,
      tenantId,
    }),
    [filteredCustomers, search, tenantId],
  );

  const actions = useMemo(
    () => ({
      setSearch,
    }),
    [],
  );

  const status: CustomersStatus = !tenantId
    ? "error"
    : tenantCustomers.length === 0
      ? "empty"
      : "success";

  return { status, vm, actions };
}

import { useMemo, useState, useCallback } from "react";
import { useCustomersStore } from "@/modules/customers";
import { useAuthStore } from "@/modules/auth";
import { useParams } from "react-router-dom";
import type { Customer } from "@/shared/types/models";

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

  const { userType, isImpersonating } = useAuthStore();
  const isSuperAdmin = userType === "platform" || isImpersonating;

  const vm = useMemo(
    () => ({
      customers: filteredCustomers,
      search,
      isEmpty: filteredCustomers.length === 0,
      tenantId,
      isSuperAdmin,
    }),
    [filteredCustomers, search, tenantId, isSuperAdmin],
  );

  const { removeCustomer } = useCustomersStore();

  const deleteCustomer = useCallback(
    (customerId: string) => {
      removeCustomer(customerId);
    },
    [removeCustomer],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      deleteCustomer,
    }),
    [deleteCustomer],
  );

  const status: CustomersStatus = !tenantId
    ? "error"
    : tenantCustomers.length === 0
      ? "empty"
      : "success";

  return { status, vm, actions };
}

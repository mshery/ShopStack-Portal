import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useCustomersStore } from "@/stores/customers.store";
import { generateId } from "@/utils/normalize";
import type { AsyncStatus, Customer } from "@/types";

/**
 * useCustomersLogic - Customer management logic hook
 */
export function useCustomersLogic() {
  const { activeTenantId } = useAuthStore();
  const { customers, addCustomer, updateCustomer, removeCustomer } =
    useCustomersStore();

  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!activeTenantId) return [];
    return customers
      .filter((c) => c.tenant_id === activeTenantId)
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
          (c.phone && c.phone.includes(search)),
      );
  }, [activeTenantId, customers, search]);

  const vm = useMemo(
    () => ({
      customers: filteredCustomers,
      search,
    }),
    [filteredCustomers, search],
  );

  const createCustomer = useCallback(
    (data: { name: string; email: string | null; phone: string | null }) => {
      if (!activeTenantId) return;

      const newCustomer: Customer = {
        id: generateId("cust"),
        tenant_id: activeTenantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addCustomer(newCustomer);
    },
    [activeTenantId, addCustomer],
  );

  const actions = useMemo(
    () => ({
      setSearch,
      createCustomer,
      updateCustomer,
      removeCustomer,
    }),
    [createCustomer, updateCustomer, removeCustomer],
  );

  return { status: "success" as AsyncStatus, vm, actions };
}

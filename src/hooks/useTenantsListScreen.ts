import { useMemo, useState } from "react";
import { useTenantsStore } from "../stores/tenants.store";

export type TenantsStatus = "loading" | "error" | "empty" | "success";

export function useTenantsListScreen() {
  const { tenants } = useTenantsStore();
  const [search, setSearch] = useState("");

  const filteredTenants = useMemo(() => {
    return tenants.filter(
      (t) =>
        t.companyName.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tenants, search]);

  const vm = useMemo(
    () => ({
      tenants: filteredTenants,
      search,
      isEmpty: filteredTenants.length === 0,
    }),
    [filteredTenants, search],
  );

  const actions = useMemo(
    () => ({
      setSearch,
    }),
    [],
  );

  const status: TenantsStatus = tenants.length === 0 ? "empty" : "success";

  return { status, vm, actions };
}

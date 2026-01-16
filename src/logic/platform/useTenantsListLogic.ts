import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTenantsStore } from "@/stores/tenants.store";
import type { AsyncStatus, TenantPlan, TenantStatus } from "@/types";

interface Filters {
  search: string;
  status: TenantStatus | "all";
  plan: TenantPlan | "all";
}

/**
 * useTenantsListLogic - Tenants list screen hook
 */
export function useTenantsListLogic() {
  const navigate = useNavigate();
  const { tenants, updateTenant } = useTenantsStore();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    plan: "all",
  });

  const status: AsyncStatus = tenants.length === 0 ? "empty" : "success";

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches =
          tenant.companyName.toLowerCase().includes(searchLower) ||
          tenant.slug.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Status filter
      if (filters.status !== "all" && tenant.status !== filters.status) {
        return false;
      }

      // Plan filter
      if (filters.plan !== "all" && tenant.plan !== filters.plan) {
        return false;
      }

      return true;
    });
  }, [tenants, filters]);

  const vm = useMemo(
    () => ({
      tenants: filteredTenants,
      totalCount: tenants.length,
      filters,
    }),
    [filteredTenants, tenants.length, filters],
  );

  const goToCreate = useCallback(() => {
    navigate("/platform/tenants/new");
  }, [navigate]);

  const goToDetail = useCallback(
    (tenantId: string) => {
      navigate(`/platform/tenants/${tenantId}`);
    },
    [navigate],
  );

  const toggleTenantStatus = useCallback(
    (tenantId: string, currentStatus: TenantStatus) => {
      const newStatus: TenantStatus =
        currentStatus === "active" ? "inactive" : "active";
      updateTenant(tenantId, { status: newStatus });
    },
    [updateTenant],
  );

  const actions = useMemo(
    () => ({
      setFilters,
      updateFilter: (key: keyof Filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
      },
      goToCreate,
      goToDetail,
      toggleTenantStatus,
    }),
    [goToCreate, goToDetail, toggleTenantStatus],
  );

  return { status, vm, actions };
}

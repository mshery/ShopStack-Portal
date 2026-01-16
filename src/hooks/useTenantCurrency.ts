import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantsStore } from "@/stores/tenants.store";

/**
 * useTenantCurrency - Centralized currency formatting hook
 *
 * Provides the current tenant's currency symbol and a formatPrice function
 * that uses it. This ensures consistent currency formatting across the app.
 */
export function useTenantCurrency() {
  const { activeTenantId } = useAuthStore();
  const { tenants } = useTenantsStore();

  const tenant = useMemo(
    () => tenants.find((t) => t.id === activeTenantId),
    [tenants, activeTenantId]
  );

  const currencySymbol = tenant?.settings?.currencySymbol || "$";

  const formatPrice = useMemo(
    () => (amount: number) => {
      return `${currencySymbol}${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currencySymbol]
  );

  return {
    currencySymbol,
    formatPrice,
  };
}

import { useMemo } from "react";
import { useAuthStore } from "@/modules/auth";
import { useTenantsStore } from "@/modules/platform";

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
    [tenants, activeTenantId],
  );

  const currencySymbol = tenant?.settings?.currencySymbol || "Rs";

  const formatPrice = useMemo(
    () => (amount: number | undefined | null) => {
      const value = typeof amount === "number" ? amount : 0;
      return `${currencySymbol} ${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currencySymbol],
  );

  return {
    currencySymbol,
    formatPrice,
  };
}

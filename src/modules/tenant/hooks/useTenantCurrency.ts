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
    () => (amount: number | string | undefined | null) => {
      // The backend serialises Prisma `Decimal` as strings (e.g. `"1.8"`),
      // so accept string|number and coerce. `Number("")` is `0`, which is
      // intentional — empty money falls back to the zero formatting rather
      // than rendering `NaN`.
      const raw =
        typeof amount === "number"
          ? amount
          : typeof amount === "string"
            ? Number(amount)
            : 0;
      const value = Number.isFinite(raw) ? raw : 0;
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

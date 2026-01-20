import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useBillingsStore } from "@/stores/billings.store";
import { useTenantsStore } from "@/stores/tenants.store";
import type { TenantPlan, SubscriptionPlan, BillingInvoice } from "@/types";

/**
 * Billing Upgrade Hook
 *
 * Handles subscription upgrades with invoice generation and tenant updates.
 */
export function useBillingUpgrade() {
  const { activeTenantId } = useAuthStore();
  const { subscriptionPlans, billings, upgradePlan } = useBillingsStore();
  const { tenants, updateTenant } = useTenantsStore();

  const tenant = useMemo(
    () => tenants.find((t) => t.id === activeTenantId),
    [tenants, activeTenantId],
  );

  const billing = useMemo(
    () => billings.find((b) => b.tenant_id === activeTenantId),
    [billings, activeTenantId],
  );

  const currentPlan = useMemo(
    () => subscriptionPlans.find((p) => p.slug === billing?.plan),
    [subscriptionPlans, billing?.plan],
  );

  // Get available upgrade plans (plans with higher price)
  const availableUpgrades = useMemo((): SubscriptionPlan[] => {
    if (!currentPlan) return subscriptionPlans;
    return subscriptionPlans.filter(
      (p) => p.monthlyPrice > currentPlan.monthlyPrice,
    );
  }, [subscriptionPlans, currentPlan]);

  // Upgrade to a new plan
  const upgrade = useCallback(
    (
      targetPlan: TenantPlan,
    ): {
      success: boolean;
      invoice: BillingInvoice | null;
      error: string | null;
    } => {
      if (!activeTenantId || !tenant) {
        return { success: false, invoice: null, error: "No active tenant" };
      }

      const planDetails = subscriptionPlans.find((p) => p.slug === targetPlan);
      if (!planDetails) {
        return { success: false, invoice: null, error: "Invalid plan" };
      }

      // Check if this is actually an upgrade
      if (currentPlan && planDetails.monthlyPrice <= currentPlan.monthlyPrice) {
        return {
          success: false,
          invoice: null,
          error: "Cannot downgrade using upgrade action",
        };
      }

      // Perform the upgrade in billings store
      const invoice = upgradePlan(
        activeTenantId,
        targetPlan,
        planDetails.monthlyPrice,
      );

      if (!invoice) {
        return {
          success: false,
          invoice: null,
          error: "Failed to create invoice",
        };
      }

      // Update tenant with new plan limits
      updateTenant(activeTenantId, {
        plan: targetPlan,
        maxUsers: planDetails.limits.maxUsers,
        maxProducts: planDetails.limits.maxProducts,
        maxOrders: planDetails.limits.maxOrders,
      });

      return { success: true, invoice, error: null };
    },
    [
      activeTenantId,
      tenant,
      subscriptionPlans,
      currentPlan,
      upgradePlan,
      updateTenant,
    ],
  );

  // Cancel subscription (placeholder)
  const cancelSubscription = useCallback((): {
    success: boolean;
    error: string | null;
  } => {
    // In a real app, this would initiate cancellation flow
    return {
      success: false,
      error: "Cancellation requires contacting support",
    };
  }, []);

  const vm = useMemo(
    () => ({
      currentPlan,
      availableUpgrades,
      canUpgrade: availableUpgrades.length > 0,
      tenantId: activeTenantId,
    }),
    [currentPlan, availableUpgrades, activeTenantId],
  );

  const actions = useMemo(
    () => ({
      upgrade,
      cancelSubscription,
    }),
    [upgrade, cancelSubscription],
  );

  return { vm, actions };
}

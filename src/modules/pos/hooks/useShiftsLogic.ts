import { useMemo, useCallback } from "react";
import { useAuthStore } from "@/modules/auth";
import { usePOSStore } from "@/modules/pos";
import type { AsyncStatus } from "@/shared/types/models";

/**
 * useShiftsLogic - Shift management screen hook
 */
export function useShiftsLogic() {
  const { activeTenantId } = useAuthStore();
  const { shifts, closeShift, registers } = usePOSStore();

  const status: AsyncStatus = "success";

  const tenantShifts = useMemo(() => {
    if (!activeTenantId) return [];
    return shifts
      .filter((s) => s.tenant_id === activeTenantId)
      .map((shift) => ({
        ...shift,
        registerName:
          registers.find((r) => r.id === shift.registerId)?.name ?? "Unknown",
      }))
      .reverse();
  }, [activeTenantId, shifts, registers]);

  const vm = useMemo(
    () => ({
      shifts: tenantShifts,
    }),
    [tenantShifts],
  );

  const handleCloseShift = useCallback(
    (shiftId: string) => {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) return;

      // In a real app, we'd prompt for actual cash
      closeShift(shiftId, shift.expectedCash || 0);
    },
    [shifts, closeShift],
  );

  const actions = useMemo(
    () => ({
      closeShift: handleCloseShift,
    }),
    [handleCloseShift],
  );

  return { status, vm, actions };
}

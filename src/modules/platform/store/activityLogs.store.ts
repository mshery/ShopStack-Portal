import { create } from "zustand";
import type { PlatformActivityLog, TenantActivityLog } from "@/shared/types/models";

/**
 * Activity Logs Store - Platform and Tenant activity tracking
 */

interface ActivityLogsStoreState {
  // Platform logs (Super Admin)
  platformLogs: PlatformActivityLog[];

  // Tenant logs
  tenantLogs: TenantActivityLog[];

  // Setters
  setPlatformLogs: (logs: PlatformActivityLog[]) => void;
  addPlatformLog: (
    log: Omit<PlatformActivityLog, "createdAt" | "updatedAt">,
  ) => void;

  setTenantLogs: (logs: TenantActivityLog[]) => void;
  addTenantLog: (
    log: Omit<TenantActivityLog, "createdAt" | "updatedAt">,
  ) => void;
}

export const useActivityLogsStore = create<ActivityLogsStoreState>((set) => ({
  // Initial state
  platformLogs: [],
  tenantLogs: [],

  // Platform log setters
  setPlatformLogs: (logs) => set({ platformLogs: logs ?? [] }),
  addPlatformLog: (log) =>
    set((state) => ({
      platformLogs: [
        {
          ...log,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as PlatformActivityLog,
        ...state.platformLogs,
      ],
    })),

  // Tenant log setters
  setTenantLogs: (logs) => set({ tenantLogs: logs ?? [] }),
  addTenantLog: (log) =>
    set((state) => ({
      tenantLogs: [
        {
          ...log,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as TenantActivityLog,
        ...state.tenantLogs,
      ],
    })),
}));

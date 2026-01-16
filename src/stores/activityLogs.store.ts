import { create } from "zustand";
import type { PlatformActivityLog, TenantActivityLog } from "@/types";

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
  addPlatformLog: (log: PlatformActivityLog) => void;

  setTenantLogs: (logs: TenantActivityLog[]) => void;
  addTenantLog: (log: TenantActivityLog) => void;
}

export const useActivityLogsStore = create<ActivityLogsStoreState>((set) => ({
  // Initial state
  platformLogs: [],
  tenantLogs: [],

  // Platform log setters
  setPlatformLogs: (logs) => set({ platformLogs: logs ?? [] }),
  addPlatformLog: (log) =>
    set((state) => ({
      platformLogs: [log, ...state.platformLogs],
    })),

  // Tenant log setters
  setTenantLogs: (logs) => set({ tenantLogs: logs ?? [] }),
  addTenantLog: (log) =>
    set((state) => ({
      tenantLogs: [log, ...state.tenantLogs],
    })),
}));

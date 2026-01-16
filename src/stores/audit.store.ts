import { create } from "zustand";
import type { AuditLog } from "@/types";
import { generateId } from "@/utils/normalize";

/**
 * Audit Store - Tracks all system changes for compliance and debugging
 */

interface AuditStoreState {
  logs: AuditLog[];

  // Setters
  setLogs: (logs: AuditLog[]) => void;
  addLog: (log: Omit<AuditLog, "id" | "createdAt">) => void;

  // Query helpers
  getLogsByEntity: (entityType: string, entityId: string) => AuditLog[];
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByAction: (action: string) => AuditLog[];
}

export const useAuditStore = create<AuditStoreState>((set, get) => ({
  logs: [],

  setLogs: (logs) => set({ logs: logs ?? [] }),

  addLog: (logData) => {
    const newLog: AuditLog = {
      ...logData,
      id: generateId("audit"),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      logs: [...state.logs, newLog],
    }));
  },

  getLogsByEntity: (entityType, entityId) => {
    return get().logs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId,
    );
  },

  getLogsByUser: (userId) => {
    return get().logs.filter((log) => log.userId === userId);
  },

  getLogsByAction: (action) => {
    return get().logs.filter((log) => log.action === action);
  },
}));

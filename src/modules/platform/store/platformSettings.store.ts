import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlatformSettings } from "@/shared/types/models";

/**
 * Platform Settings Store
 *
 * RULES:
 * - Stores are boring on purpose
 * - Safe defaults for all values
 */

interface PlatformSettingsStoreState {
  // State
  settings: PlatformSettings;

  // Setters
  setSettings: (settings: PlatformSettings) => void;
  updateSettings: (updates: Partial<PlatformSettings>) => void;
}

const defaultSettings: PlatformSettings = {
  platformName: "SaaS Admin Console",
  supportEmail: "support@saasplatform.com",
  maintenanceMode: false,
  allowNewRegistrations: true,
  primaryColor: "#465fff",
  accentColor: "#12b76a",
};

export const usePlatformSettingsStore = create<PlatformSettingsStoreState>()(
  persist(
    (set) => ({
      // Initial state with defaults
      settings: defaultSettings,

      // Setters
      setSettings: (settings) => set({ settings }),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    {
      name: "saas-platform-settings", // localStorage key
    },
  ),
);

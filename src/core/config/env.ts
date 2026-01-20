/**
 * Environment Configuration
 *
 * Centralized environment variables and configuration.
 */

export const env = {
    // App Configuration
    APP_NAME: "ShopStack Portal",
    APP_VERSION: "1.0.0",

    // Feature Flags
    ENABLE_BILLING: true,
    ENABLE_REPORTS: true,
    ENABLE_AUDIT_LOGS: true,

    // Development
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,

    // API Configuration (for future use)
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
    API_TIMEOUT: 30000,
} as const;

export type Env = typeof env;

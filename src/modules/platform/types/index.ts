/**
 * Platform Module Types
 */

export type TenantStatus = "active" | "inactive" | "suspended";
export type TenantPlan = "free" | "starter" | "professional" | "enterprise";

export interface TenantFeatures {
    posEnabled: boolean;
    reportsEnabled: boolean;
    billingEnabled: boolean;
}

export interface Tenant {
    id: string;
    companyName: string;
    email: string;
    phone: string;
    status: TenantStatus;
    plan: TenantPlan;
    features: TenantFeatures;
    usersCount: number;
    totalProducts: number;
    totalRevenue: number;
    createdAt: string;
    billingInfo?: TenantBillingInfo;
}

export interface TenantBillingInfo {
    currentPlan: TenantPlan;
    billingCycle: "monthly" | "yearly";
    nextBillingDate: string;
    paymentMethod: {
        type: "card" | "bank";
        last4: string;
        expiryDate?: string;
    };
}

export interface CreateTenantInput {
    companyName: string;
    email: string;
    phone?: string;
    plan: TenantPlan;
    features?: Partial<TenantFeatures>;
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
}

export interface UpdateTenantInput {
    companyName?: string;
    email?: string;
    phone?: string;
    status?: TenantStatus;
    plan?: TenantPlan;
    features?: Partial<TenantFeatures>;
}

export interface PlatformSettings {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
}

export interface ActivityLog {
    id: string;
    type: string;
    action: string;
    user: string;
    userType: "platform" | "tenant";
    details: string;
    timestamp: string;
    tenantId?: string;
}

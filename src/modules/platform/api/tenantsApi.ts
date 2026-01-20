/**
 * Tenants API
 *
 * Placeholder API for tenant CRUD operations.
 * Currently uses local data, will connect to real backend in the future.
 */

import { simulateDelay } from "@/core/api/httpClient";
import type { Tenant, CreateTenantInput, UpdateTenantInput } from "../types";

// Mock tenant API functions (for future backend integration)
export async function fetchTenants(): Promise<Tenant[]> {
    await simulateDelay(300);
    console.log("Tenants API: fetchTenants");
    return [];
}

export async function fetchTenantById(id: string): Promise<Tenant | null> {
    await simulateDelay(300);
    console.log("Tenants API: fetchTenantById", { id });
    return null;
}

export async function createTenant(
    data: CreateTenantInput
): Promise<{ success: boolean; tenant?: Tenant; error?: string }> {
    await simulateDelay(500);
    console.log("Tenants API: createTenant", data);
    return { success: true };
}

export async function updateTenant(
    id: string,
    data: UpdateTenantInput
): Promise<{ success: boolean; error?: string }> {
    await simulateDelay(300);
    console.log("Tenants API: updateTenant", { id, data });
    return { success: true };
}

export async function deleteTenant(
    id: string
): Promise<{ success: boolean; error?: string }> {
    await simulateDelay(300);
    console.log("Tenants API: deleteTenant", { id });
    return { success: true };
}

export async function updateTenantStatus(
    id: string,
    status: "active" | "inactive" | "suspended"
): Promise<{ success: boolean; error?: string }> {
    await simulateDelay(300);
    console.log("Tenants API: updateTenantStatus", { id, status });
    return { success: true };
}

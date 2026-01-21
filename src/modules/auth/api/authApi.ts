/**
 * Auth Module API
 *
 * Placeholder API for auth operations.
 * Currently uses local data, will connect to real backend in the future.
 */

import { simulateDelay } from "@/core/api/httpClient";

// Mock auth API functions (for future backend integration)
export async function loginApi(
    email: string,
    password: string
): Promise<{ success: boolean; error?: string }> {
    await simulateDelay(300);
    // This will be replaced with real API call
    console.log("Auth API: login", { email, password });
    return { success: true };
}

export async function signUpApi(
    data: {
        companyName: string;
        email: string;
        password: string;
        ownerName: string;
    }
): Promise<{ success: boolean; error?: string }> {
    await simulateDelay(300);
    console.log("Auth API: signup", data);
    return { success: true };
}

export async function forgotPasswordApi(
    email: string
): Promise<{ success: boolean; error?: string }> {
    await simulateDelay(300);
    console.log("Auth API: forgot password", { email });
    return { success: true };
}

export async function resetPasswordApi(
    token: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    await simulateDelay(300);
    console.log("Auth API: reset password", { token, newPassword });
    return { success: true };
}

export async function logoutApi(): Promise<void> {
    await simulateDelay(100);
    console.log("Auth API: logout");
}

/**
 * Auth Module Types
 */

export type AuthUserType = "platform" | "tenant" | null;

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

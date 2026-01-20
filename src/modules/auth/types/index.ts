/**
 * Auth Module Types
 */

export type AuthUserType = "platform" | "tenant" | null;

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpData {
    companyName: string;
    email: string;
    password: string;
    ownerName: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

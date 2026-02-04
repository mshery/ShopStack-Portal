/**
 * Auth Module Public API
 *
 * This is the ONLY entry point for importing from the auth module.
 * All external imports should use: import { ... } from "@/modules/auth"
 */

// Store
export { useAuthStore, useAuthHydrated } from "./store/auth.store";

// Hooks
export { useAuthLogic } from "./hooks/useAuthLogic";

// Components
export { ProtectedRoute } from "./components/ProtectedRoute";

// Types
export type {
  AuthUserType,
  LoginCredentials,
  SignUpData,
  ResetPasswordData,
} from "./types";

// API (unified auth API)
export { authApi } from "./api/authApi";
export type {
  AuthUser,
  AuthTenant,
  LoginResponse,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./api/authApi";

// Pages - Only exported for router configuration
export { default as LoginPage } from "./pages/LoginPage";
export { default as SignUpPage } from "./pages/SignUpPage";
export { default as ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { default as ResetPasswordPage } from "./pages/ResetPasswordPage";

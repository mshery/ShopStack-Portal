import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/core/config/env";
import { endpoints } from "@/core/config/endpoints";
import { tokenStorage } from "@/core/security/storage";
import type { ApiError } from "@/shared/types/api";
import seedData from "@/data/seed.json";

// Re-export seed data for backward compatibility during migration
export { seedData };

/**
 * Simulates an API delay for realistic UX (backward compatibility)
 */
export async function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Shared Axios instance for app-wide API calls. `withCredentials: true` is
// required so the httpOnly refresh cookie travels with /auth/refresh-token
// and /auth/logout calls (security.md rule 3 / ITS-26).
export const httpClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach the in-memory access token when available.
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Handle 401 → silent refresh → retry. The refresh token now lives in an
// httpOnly cookie, so we just POST /auth/refresh-token with credentials and
// pick up the new access token from the response body.
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      // Login failures are surfaced to the caller verbatim.
      if (originalRequest.url?.includes(endpoints.auth.login)) {
        return Promise.reject(error);
      }
      // Refresh failures must not loop.
      if (originalRequest.url?.includes(endpoints.auth.refreshToken)) {
        tokenStorage.clearTokens();
        return Promise.reject(error);
      }

      if (!originalRequest.headers["X-Retry"]) {
        try {
          const response = await axios.post(
            `${env.API_BASE_URL}${endpoints.auth.refreshToken}`,
            {},
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            },
          );

          const accessToken =
            (response.data as { data?: { token?: string } }).data?.token ?? "";
          if (!accessToken) {
            throw new Error("Refresh returned no access token");
          }
          tokenStorage.setAccessToken(accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers["X-Retry"] = "true";
          return httpClient(originalRequest);
        } catch {
          tokenStorage.clearTokens();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } else {
        tokenStorage.clearTokens();
        window.location.href = "/login";
      }
    }

    const errorMessage =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      "An error occurred";
    return Promise.reject(new Error(errorMessage));
  },
);

// export default httpClient;
export type { AxiosInstance };

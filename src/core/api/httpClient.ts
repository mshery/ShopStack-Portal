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

// Shared Axios instance for app-wide API calls
export const httpClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach auth token when available
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

// Handle auth errors and retries
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      // Skip login failures
      if (originalRequest.url?.includes(endpoints.auth.login)) {
        return Promise.reject(error);
      }

      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken && !originalRequest.headers["X-Retry"]) {
        try {
          const response = await axios.post(
            `${env.API_BASE_URL}${endpoints.auth.refreshToken}`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            },
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          tokenStorage.setTokens({
            accessToken,
            refreshToken: newRefreshToken,
          });

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

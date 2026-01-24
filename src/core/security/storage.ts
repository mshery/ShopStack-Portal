/**
 * Token Storage Service
 *
 * Manages access and refresh tokens in localStorage.
 */

const ACCESS_TOKEN_KEY = "shopstack_access_token";
const REFRESH_TOKEN_KEY = "shopstack_refresh_token";

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export const tokenStorage = {
  /**
   * Get the current access token
   */
  getAccessToken: (): string | null => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Get the current refresh token
   */
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Save both tokens to storage
   */
  setTokens: (data: TokenData): void => {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    } catch {
      console.error("Failed to save tokens to localStorage");
    }
  },

  /**
   * Remove all tokens from storage
   */
  clearTokens: (): void => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      console.error("Failed to clear tokens from localStorage");
    }
  },

  /**
   * Check if an access token exists
   */
  hasToken: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

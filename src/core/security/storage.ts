/**
 * Token Storage Service — IN-MEMORY ONLY.
 *
 * Per security.md rule 3, bearer tokens never live in localStorage (XSS-
 * readable). The access token now lives in a module-scope variable here;
 * the refresh token lives in an httpOnly cookie set by the backend on
 * login (`POST /api/auth/login`) and silently refreshed on app boot.
 *
 * The shape (`getAccessToken`, `setTokens`, `clearTokens`, `hasToken`) is
 * preserved so existing call sites keep working through this migration;
 * `refreshToken` is now ignored — the cookie is authoritative.
 */

let accessTokenInMemory: string | null = null;

interface TokenInput {
  accessToken: string;
  /** Ignored — the refresh token lives in an httpOnly cookie. Kept in the
   * shape for backwards compatibility during the migration. */
  refreshToken?: string;
}

export const tokenStorage = {
  getAccessToken: (): string | null => accessTokenInMemory,

  /** Always returns null — refresh token is httpOnly cookie, not visible to JS. */
  getRefreshToken: (): string | null => null,

  setTokens: (data: TokenInput): void => {
    accessTokenInMemory = data.accessToken;
  },

  setAccessToken: (token: string | null): void => {
    accessTokenInMemory = token;
  },

  clearTokens: (): void => {
    accessTokenInMemory = null;
  },

  hasToken: (): boolean => accessTokenInMemory !== null,
};

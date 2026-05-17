import { afterEach, describe, expect, test } from "vitest";
import { tokenStorage } from "./storage";

describe("tokenStorage", () => {
  afterEach(() => {
    tokenStorage.clearTokens();
    localStorage.clear();
  });

  test("setTokens writes the access token in memory, not localStorage", () => {
    tokenStorage.setTokens({
      accessToken: "access-abc",
      refreshToken: "refresh-xyz",
    });

    expect(tokenStorage.getAccessToken()).toBe("access-abc");
    // Critical: refresh token is the httpOnly cookie's job; the JS layer
    // must never expose it.
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(tokenStorage.hasToken()).toBe(true);

    // Per security.md rule 3, no token-shaped value ever lands in localStorage.
    expect(localStorage.length).toBe(0);
  });

  test("setAccessToken accepts a bare string", () => {
    tokenStorage.setAccessToken("only-access");
    expect(tokenStorage.getAccessToken()).toBe("only-access");
  });

  test("clearTokens wipes the in-memory access token", () => {
    tokenStorage.setAccessToken("temp");
    tokenStorage.clearTokens();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.hasToken()).toBe(false);
  });
});

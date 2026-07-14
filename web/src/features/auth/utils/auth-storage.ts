import type { AuthTokens } from "@/features/auth/types/auth.types";

export const AUTH_STORAGE_KEYS = { accessToken: "atlas.access-token", refreshToken: "atlas.refresh-token" } as const;
const getStorage = (): Storage | null => typeof window === "undefined" ? null : window.localStorage;

export const authStorage = {
  getAccessToken: () => getStorage()?.getItem(AUTH_STORAGE_KEYS.accessToken) ?? null,
  getRefreshToken: () => getStorage()?.getItem(AUTH_STORAGE_KEYS.refreshToken) ?? null,
  saveTokens(tokens: AuthTokens): void {
    getStorage()?.setItem(AUTH_STORAGE_KEYS.accessToken, tokens.accessToken);
    getStorage()?.setItem(AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },
  clear(): void {
    getStorage()?.removeItem(AUTH_STORAGE_KEYS.accessToken);
    getStorage()?.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  },
};

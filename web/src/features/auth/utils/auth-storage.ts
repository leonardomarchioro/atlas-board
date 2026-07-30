import type { AuthTokens } from "@/features/auth/types/auth.types";

export const AUTH_STORAGE_KEYS = {
  accessToken: "atlas.access-token",
  refreshToken: "atlas.refresh-token",
} as const;
const AUTH_TOKENS_CHANGED_EVENT = "atlas:auth-tokens-changed";
const getStorage = (): Storage | null =>
  typeof window === "undefined" ? null : window.localStorage;

export const authStorage = {
  getAccessToken: () => getStorage()?.getItem(AUTH_STORAGE_KEYS.accessToken) ?? null,
  getRefreshToken: () => getStorage()?.getItem(AUTH_STORAGE_KEYS.refreshToken) ?? null,
  saveTokens(tokens: AuthTokens): void {
    getStorage()?.setItem(AUTH_STORAGE_KEYS.accessToken, tokens.accessToken);
    getStorage()?.setItem(AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_TOKENS_CHANGED_EVENT));
  },
  clear(): void {
    getStorage()?.removeItem(AUTH_STORAGE_KEYS.accessToken);
    getStorage()?.removeItem(AUTH_STORAGE_KEYS.refreshToken);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_TOKENS_CHANGED_EVENT));
  },
  subscribe(listener: () => void): () => void {
    if (typeof window === "undefined") return () => undefined;
    window.addEventListener(AUTH_TOKENS_CHANGED_EVENT, listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener(AUTH_TOKENS_CHANGED_EVENT, listener);
      window.removeEventListener("storage", listener);
    };
  },
};

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getCurrentUser, logout as logoutRequest } from "@/features/auth/api/auth-api";
import { authKeys } from "@/features/auth/auth-keys";
import type { AuthResponse, AuthUser } from "@/features/auth/types/auth.types";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { getSafeRedirect } from "@/features/auth/utils/safe-redirect";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const accessToken = useSyncExternalStore(
    authStorage.subscribe,
    authStorage.getAccessToken,
    () => null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();

  const clearSession = useCallback(() => {
    authStorage.clear();
    setUser(null);
    queryClient.removeQueries();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    queryClient.setQueryData(authKeys.me(), currentUser);
  }, [queryClient]);

  useEffect(() => {
    async function restoreSession() {
      if (!authStorage.getAccessToken() || !authStorage.getRefreshToken()) {
        setIsLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }
    void restoreSession();
  }, [clearSession, refreshUser]);

  const setSession = useCallback(
    (session: AuthResponse) => {
      authStorage.saveTokens(session);
      setUser(session.user);
      queryClient.setQueryData(authKeys.me(), session.user);
    },
    [queryClient],
  );

  const logout = useCallback(
    async (redirectTo?: string) => {
      const refreshToken = authStorage.getRefreshToken();
      try {
        if (refreshToken) await logoutRequest(refreshToken);
      } finally {
        clearSession();
        router.replace(getSafeRedirect(redirectTo ?? null, "/login"));
      }
    },
    [clearSession, router],
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      isLoading,
      setSession,
      clearSession,
      refreshUser,
      logout,
    }),
    [user, accessToken, isLoading, setSession, clearSession, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser utilizado dentro de AuthProvider.");
  return context;
}

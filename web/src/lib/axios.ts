import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import type { AuthResponse } from "@/features/auth/types/auth.types";
import { authStorage } from "@/features/auth/utils/auth-storage";

export const authApi = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const refreshExcludedPaths = ["/auth/login", "/auth/register", "/auth/refresh"];
let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const accessToken = authStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined;
    const requestUrl = request?.url ?? "";
    const mayRefresh =
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !refreshExcludedPaths.some((path) => requestUrl.includes(path));

    if (!mayRefresh) {
      return Promise.reject(error);
    }

    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      authStorage.clear();
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      refreshPromise ??= authApi
        .post<AuthResponse>("/auth/refresh", { refreshToken })
        .then(({ data }) => {
          authStorage.saveTokens(data);
          return data.accessToken;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const accessToken = await refreshPromise;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      authStorage.clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        const redirect = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
      return Promise.reject(refreshError);
    }
  },
);

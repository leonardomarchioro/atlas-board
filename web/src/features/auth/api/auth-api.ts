import { api, authApi } from "@/lib/axios";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "@/features/auth/types/auth.types";

export async function login(input: LoginInput): Promise<AuthResponse> {
  return (await authApi.post<AuthResponse>("/auth/login", input)).data;
}
export async function register(input: RegisterInput): Promise<AuthResponse> {
  return (await authApi.post<AuthResponse>("/auth/register", input)).data;
}
export async function refreshToken(refreshTokenValue: string): Promise<AuthResponse> {
  return (await authApi.post<AuthResponse>("/auth/refresh", { refreshToken: refreshTokenValue })).data;
}
export async function logout(refreshTokenValue: string): Promise<void> {
  await authApi.post("/auth/logout", { refreshToken: refreshTokenValue });
}
export async function getCurrentUser(): Promise<AuthUser> {
  return (await api.get<AuthUser>("/users/me")).data;
}

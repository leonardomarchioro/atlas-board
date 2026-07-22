"use client";
import { useMutation } from "@tanstack/react-query";
import { login, register } from "@/features/auth/api/auth-api";
import type { LoginInput, RegisterInput } from "@/features/auth/types/auth.types";
import { useAuth } from "@/providers/auth-provider";

export function useLogin() {
  const { setSession } = useAuth();
  return useMutation({ mutationFn: (input: LoginInput) => login(input), onSuccess: setSession });
}
export function useRegister() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: setSession,
  });
}
export function useLogout() {
  const { logout } = useAuth();
  return useMutation({ mutationFn: (redirectTo?: string) => logout(redirectTo) });
}

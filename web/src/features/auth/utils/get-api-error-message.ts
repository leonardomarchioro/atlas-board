import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";

const safeMessages = new Set(["E-mail ou senha inválidos.", "Este e-mail já está sendo utilizado.", "Refresh token inválido.", "Refresh token expirado."]);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.filter(Boolean).join(" ") || fallback;
  return typeof message === "string" && safeMessages.has(message) ? message : fallback;
}

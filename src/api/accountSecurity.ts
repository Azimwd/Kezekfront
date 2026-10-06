import axios from "axios";
import { api } from "./api";

export const accountSecurity = {
  requestReset: (email: string) =>
    api.post("/api/users/password-reset/request/", { email }),
  reset: (token: string, password: string, confirm_password: string) =>
    api.post("/api/users/password-reset/confirm/", {
      token,
      password,
      confirm_password,
    }),
  requestVerification: (email: string) =>
    api.post("/api/users/email-verification/request/", { email }),
  verify: (token: string) =>
    api.post("/api/users/email-verification/confirm/", { token }),
};
export function securityError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429)
      return "Слишком много попыток. Подождите несколько минут и попробуйте снова.";
    const data = error.response?.data;
    for (const key of [
      "message",
      "detail",
      "password",
      "confirm_password",
      "email",
      "non_field_errors",
      "token",
    ]) {
      const value = data?.[key];
      if (typeof value === "string") return value;
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    }
  }
  return "Не удалось выполнить запрос. Проверьте соединение и попробуйте снова.";
}
export function verificationRequired(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    error.response?.data?.code === "email_verification_required"
  );
}
export function safeAuthReturnPath(value: unknown): string | undefined {
  return typeof value === "string" &&
    !/[\\\r\n]/.test(value) &&
    /^\/(staff|crm|booking|my-bookings)(?:[/?#]|$)/.test(value)
    ? value
    : undefined;
}

// Only a safe internal destination is kept in this tab. Passwords and email-action tokens are never stored.
export function rememberAuthReturnPath(value: unknown): string | undefined {
  const path = safeAuthReturnPath(value);
  try {
    if (path)
      sessionStorage.setItem(
        "kezek:auth-return",
        JSON.stringify({ path, expires: Date.now() + 30 * 60 * 1000 }),
      );
  } catch {
    /* Storage may be blocked by browser privacy settings. */
  }
  return path;
}
export function getAuthReturnPath(value?: unknown): string | undefined {
  const explicit = rememberAuthReturnPath(value);
  if (explicit) return explicit;
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("kezek:auth-return") ?? "null",
    );
    if (saved?.expires > Date.now()) return safeAuthReturnPath(saved.path);
    sessionStorage.removeItem("kezek:auth-return");
  } catch {
    /* Use the normal account landing page. */
  }
  return undefined;
}
export function clearAuthReturnPath() {
  try {
    sessionStorage.removeItem("kezek:auth-return");
  } catch {
    /* Optional navigation state. */
  }
}

import { api } from "./api";
import type { AuthUser } from "./auth";

export type GoogleRole = "client" | "business_owner";
export const googleChallenge = async () =>
  (await api.post<{ nonce: string }>("/api/users/google/challenge/", {})).data;
export const googleLogin = async (
  credential: string,
  role: GoogleRole,
  accepted_terms: boolean,
  password?: string,
) =>
  (
    await api.post<{ message: string; data: AuthUser }>(
      "/api/users/google/login/",
      {
        credential,
        role,
        accepted_terms,
        ...(password ? { password } : {}),
      },
    )
  ).data;

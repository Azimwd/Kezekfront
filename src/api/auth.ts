import { api } from "./api";
export interface AuthUser {
  id: number;
  email: string;
  phone: string | null;
  role: string;
  first_name?: string;
  last_name?: string;
  is_email_verified?: boolean;
  email_verification_required?: boolean;
}
interface AuthResponse {
  message: string;
  data: AuthUser;
  verification_email_queued?: boolean;
}
export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  password: string;
  confirm_password: string;
}
export const registerUser = async (data: RegisterPayload) =>
  (await api.post<AuthResponse>("/api/users/register/", data)).data;
export const loginUser = async (email: string, password: string) =>
  (
    await api.post<AuthResponse>("/api/users/login/", {
      email: email.trim(),
      password,
    })
  ).data;
export const getCurrentUser = async () =>
  (await api.get("/api/users/me/")).data;
export const logout = async () =>
  (await api.post("/api/users/logout/", null)).data;

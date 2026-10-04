import { api } from "./api";
export interface StaffAccount {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_phone_verified: boolean;
}
export interface StaffMembership {
  id: number;
  first_name: string;
  last_name: string;
  business_id: number;
  business_name: string;
  position: string | null;
  is_active: boolean;
  can_complete: boolean;
}
export interface StaffClaim {
  id: number;
  status: string;
  created_at: string;
  user: StaffAccount;
}
export interface OwnerStaff extends StaffMembership {
  linked_user: StaffAccount | null;
  access_active: boolean;
  invitation_expires_at: string | null;
  requests: StaffClaim[];
}
export interface StaffAppointment {
  id: number;
  service_name: string;
  start_at: string;
  end_at: string;
  status: string;
  price: string | number;
  client_first_name: string;
  client_last_name: string | null;
  client_phone: string;
  comment: string | null;
}
export interface StaffAppointmentsPage {
  data: StaffAppointment[];
  count: number;
  page: number;
  total_pages: number;
}
export interface StaffSchedule {
  working_hours: {
    weekday: number;
    start_time: string;
    end_time: string;
    is_working_day: boolean;
  }[];
  breaks: { weekday: number; start_time: string; end_time: string }[];
  days_off: { date: string; reason: string | null }[];
}
export interface StaffServiceItem {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  duration_minutes: number;
}
export interface InvitationInfo {
  staff: Omit<StaffMembership, "can_complete">;
  status: string;
  valid: boolean;
  expires_at: string;
  account: StaffAccount;
}
const root = "/api/staff-access/";
const options = { withCredentials: true };
export const staffAccess = {
  ownerList: async (businessId: number) =>
    (
      await api.get<{ data: OwnerStaff[] }>(
        `${root}owner/businesses/${businessId}/staff/`,
        options,
      )
    ).data.data,
  invite: async (id: number) =>
    (
      await api.post<{ token: string; expires_at: string }>(
        `${root}owner/staff/${id}/invitation/`,
        {},
        options,
      )
    ).data,
  cancelInvite: async (id: number) =>
    api.delete(`${root}owner/staff/${id}/invitation/`, options),
  revoke: async (id: number) =>
    api.delete(`${root}owner/staff/${id}/access/`, options),
  permission: async (id: number, can_complete: boolean) =>
    api.patch(`${root}owner/staff/${id}/access/`, { can_complete }, options),
  review: async (id: number, claimId: number, decision: "approve" | "reject") =>
    api.post(
      `${root}owner/staff/${id}/requests/${claimId}/`,
      { decision },
      options,
    ),
  memberships: async () =>
    (await api.get<{ data: StaffMembership[] }>(`${root}me/`, options)).data
      .data,
  invitation: async (token: string) =>
    (
      await api.get<InvitationInfo>(
        `${root}invitations/${encodeURIComponent(token)}/`,
        options,
      )
    ).data,
  apply: async (token: string) =>
    api.post(`${root}invitations/${encodeURIComponent(token)}/`, {}, options),
  appointments: async (id: number, date: string, page: number) =>
    (
      await api.get<StaffAppointmentsPage>(
        `${root}profiles/${id}/appointments/`,
        { ...options, params: { date, page } },
      )
    ).data,
  schedule: async (id: number) =>
    (await api.get<StaffSchedule>(`${root}profiles/${id}/schedule/`, options))
      .data,
  services: async (id: number) =>
    (
      await api.get<{ data: StaffServiceItem[] }>(
        `${root}profiles/${id}/services/`,
        options,
      )
    ).data.data,
  complete: async (id: number, appointmentId: number) =>
    api.patch(
      `${root}profiles/${id}/appointments/${appointmentId}/complete/`,
      {},
      options,
    ),
};
export function staffError(error: unknown): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  const flatten = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(flatten).join(" ");
    if (value && typeof value === "object")
      return Object.values(value).map(flatten).join(" ");
    return "";
  };
  return flatten(data) || "Не удалось выполнить действие. Попробуйте ещё раз.";
}

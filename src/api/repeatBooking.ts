import { api } from "./api";
export interface RepeatBookingDraft {
  business: number; service: number | null; staff: number | null; addon_ids: number[];
  client_first_name: string; client_last_name: string; client_phone: string; comment: string; warnings: string[];
}
export async function getRepeatBookingDraft(id: number): Promise<RepeatBookingDraft> {
  const response = await api.get(`/api/appointments/${id}/repeat/`, { withCredentials: true });
  return response.data.data;
}

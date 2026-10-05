export const BUSINESS_LIST_PATH = "/crm/my-businesses";

export function businessPath(id: string | number, section = "dashboard") {
  return `/crm/businesses/${encodeURIComponent(String(id))}/${section.replace(/^\/+/, "")}`;
}
export function readLastBusiness(userId: number | undefined): number | null {
  if (!userId) return null;
  try {
    const value = Number(localStorage.getItem(`kezek_last_business_${userId}`));
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}
export function saveLastBusiness(userId: number, id: number) {
  try {
    localStorage.setItem(`kezek_last_business_${userId}`, String(id));
  } catch {
    /* Navigation works when browser storage is disabled. */
  }
}

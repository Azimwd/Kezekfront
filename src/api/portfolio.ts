import { api } from "./api";
export const PUBLIC_PORTFOLIO_PAGE_SIZE = 4;
export const OWNER_PORTFOLIO_PAGE_SIZE = 6;

export interface PortfolioPhoto {
  id: number;
  business: number;
  staff: number | null;
  staff_name: string | null;
  image: string;
  caption: string;
  is_published: boolean;
  created_at: string;
}
export interface PortfolioPage {
  count: number;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
  next: string | null;
  previous: string | null;
  data: PortfolioPhoto[];
  staff: { id: number; first_name: string; last_name: string | null }[];
}
export async function getPortfolio(
  businessId: number,
  page: number,
  publicView = false,
  staffId?: number,
  signal?: AbortSignal,
): Promise<PortfolioPage> {
  return (
    await api.get(
      `/api/businesses/${publicView ? "public/" : ""}${businessId}/portfolio/`,
      {
        signal,
        params: {
          page,
          staff_id: staffId,
          page_size: publicView
            ? PUBLIC_PORTFOLIO_PAGE_SIZE
            : OWNER_PORTFOLIO_PAGE_SIZE,
        },
        withCredentials: !publicView,
      },
    )
  ).data;
}
export async function savePortfolioPhoto(
  businessId: number,
  data: FormData,
  id?: number,
) {
  const options = {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  };
  if (id) return api.patch(`/api/businesses/portfolio/${id}/`, data, options);
  return api.post(`/api/businesses/${businessId}/portfolio/`, data, options);
}
export async function deletePortfolioPhoto(id: number) {
  await api.delete(`/api/businesses/portfolio/${id}/`, {
    withCredentials: true,
  });
}

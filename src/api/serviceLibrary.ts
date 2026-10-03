import { api } from "./api";
import type { Category } from "./categories";
import type { ServiceItem } from "./services";

export interface ServiceTemplate {
  id: number;
  slug: string;
  name: string;
  description: string;
  keywords: string;
  category: number;
  suggested_duration_minutes: number | null;
  is_active: boolean;
}
export interface LibraryRow {
  matching_services: ServiceItem[];
  key: string;
  template: ServiceTemplate | null;
  service: ServiceItem | null;
  category: number | null;
  category_path: string;
  is_active: boolean;
}
export interface LibraryResponse {
  message: string;
  data: LibraryRow[];
  counts: { total: number; active: number; inactive: number };
  categories: Category[];
  business_categories: number[];
  business_type: string;
  staff: { id: number; first_name: string; last_name: string }[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
  };
}
export interface LibraryFilters {
  page: number;
  search: string;
  category?: number;
  active: "all" | "true" | "false";
}
export interface ServiceConfiguration {
  name: string;
  description: string;
  price: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  assign_staff_ids: number[];
}
export const getServiceLibrary = async (
  businessId: number,
  params: LibraryFilters,
  signal?: AbortSignal,
): Promise<LibraryResponse> => {
  const response = await api.get(
    `/api/businesses/${businessId}/service-library/`,
    { params, signal, withCredentials: true },
  );
  return response.data;
};
export const activateServiceTemplate = async (
  businessId: number,
  templateId: number,
  data: Partial<ServiceConfiguration> & { existing_service_id?: number },
) => {
  const response = await api.post(
    `/api/businesses/${businessId}/service-templates/${templateId}/activate/`,
    data,
    { withCredentials: true },
  );
  return response.data;
};
export const setServiceState = async (id: number, is_active: boolean) => {
  const response = await api.patch(
    `/api/businesses/services/${id}/state/`,
    { is_active },
    { withCredentials: true },
  );
  return response.data;
};
export const createConfiguredService = async (
  businessId: number,
  data: ServiceConfiguration & { category: number | null; is_active: boolean },
) => {
  const response = await api.post(
    `/api/businesses/${businessId}/services/`,
    data,
    { withCredentials: true },
  );
  return response.data;
};

export const configureExistingService = async (
  id: number,
  data: ServiceConfiguration,
) => {
  const response = await api.patch(
    `/api/businesses/services/${id}/`,
    { ...data, is_active: true },
    { withCredentials: true },
  );
  return response.data;
};

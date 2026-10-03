import type { Category } from "./categories";
import { api } from "./api";

export type BusinessType =
  | "beauty_salon"
  | "hair_salon"
  | "barbershop"
  | "studio"
  | "massage_center"
  | "spa"
  | "sauna"
  | "other";
export const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "beauty_salon", label: "Салон красоты" },
  { value: "hair_salon", label: "Парикмахерская" },
  { value: "barbershop", label: "Барбершоп" },
  { value: "studio", label: "Студия" },
  { value: "massage_center", label: "Массажный кабинет / центр" },
  { value: "spa", label: "SPA-центр" },
  { value: "sauna", label: "Баня / сауна" },
  { value: "other", label: "Другой тип" },
];
export interface BusinessCatalogOptions {
  categories: number[];
  business_type: BusinessType;
}
export interface Business {
  id: number;
  owner: number;
  categories: number[];
  category_details: Category[];
  business_type: BusinessType;
  business_type_display: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  city: number;
  city_name: string;
  address: string;
  logo: string | null;
  status: string;
  min_price: number | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  images: string[];
}

interface businessesCreateResponse {
  message: string;
  data: Business;
}

interface BusinessesPagination {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}

interface businessesListResponse {
  message: string;
  pagination: BusinessesPagination;
  data: Business[];
}

export const createBusinesses = async (
  name: string,
  description: string,
  phone: string,
  email: string,
  city: number,
  address: string,
  status: string,
  logo: File | null,
  catalog?: BusinessCatalogOptions,
) => {
  const formData = new FormData();
  if (catalog) {
    catalog.categories.forEach((id) =>
      formData.append("categories", String(id)),
    );
    formData.append("business_type", catalog.business_type);
  }
  formData.append("name", name);
  formData.append("description", description);
  formData.append("phone", phone);
  formData.append("email", email);
  formData.append("city", city.toString());
  formData.append("address", address);
  formData.append("status", status);

  if (logo) {
    formData.append("logo", logo);
  }

  const response = await api.post<businessesCreateResponse>(
    "/api/businesses/",
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const listBusinesses = async (page: number = 1) => {
  const response = await api.get<businessesListResponse>("/api/businesses/", {
    withCredentials: true,
    params: {
      page,
    },
  });

  return response.data;
};

export const editCardBusinesses = async (
  id: number,
  name: string,
  description: string,
  phone: string,
  email: string,
  city: number,
  address: string,
  status: string,
  logo: File | null,
  catalog?: BusinessCatalogOptions,
) => {
  const formData = new FormData();
  if (catalog) {
    catalog.categories.forEach((id) =>
      formData.append("categories", String(id)),
    );
    formData.append("business_type", catalog.business_type);
  }
  formData.append("name", name);
  formData.append("description", description);
  formData.append("phone", phone);
  formData.append("email", email);
  formData.append("city", city.toString());
  formData.append("address", address);
  formData.append("status", status);

  if (logo) {
    formData.append("logo", logo);
  }

  try {
    const response = await api.patch(`/api/businesses/${id}/`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при редактировании:", error);
    throw error;
  }
};

export const deleteCardBusinesses = async (id: number) => {
  const response = await api.delete(`/api/businesses/${id}/`, {
    withCredentials: true,
  });

  return response.data;
};

export const listAllBusinesses = async (): Promise<Business[]> => {
  let page = 1;
  let allBusinesses: Business[] = [];

  while (true) {
    const response = await listBusinesses(page);

    allBusinesses = [...allBusinesses, ...response.data];

    if (!response.pagination || page >= response.pagination.total_pages) {
      break;
    }

    page += 1;
  }

  return allBusinesses;
};
export const updateBusinessDirections = async (
  id: number,
  categories: number[],
) => {
  const response = await api.patch(
    `/api/businesses/${id}/`,
    { categories },
    { withCredentials: true },
  );
  return response.data;
};

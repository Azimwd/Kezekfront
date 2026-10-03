import { api } from "./api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  parent_name: string | null;
  sort_order: number;
  is_legacy: boolean;
  is_active: boolean;
}
export interface CategoriesResponse {
  message: string;
  data: Category[];
}
export const listCategories = async (
  includeLegacy = false,
): Promise<CategoriesResponse> => {
  const response = await api.get<CategoriesResponse>(
    "/api/businesses/categories/",
    {
      withCredentials: true,
      params: includeLegacy ? { include_legacy: "true" } : undefined,
    },
  );
  return response.data;
};
export const categoryPath = (category: Category, all: Category[]): string => {
  const names = [category.name];
  const seen = new Set([category.id]);
  let parent = all.find((item) => item.id === category.parent);
  while (parent && !seen.has(parent.id)) {
    names.unshift(parent.name);
    seen.add(parent.id);
    parent = all.find((item) => item.id === parent?.parent);
  }
  return names.join(" / ");
};

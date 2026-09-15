import {
    api
} from './api';


export interface Category {
    id: number;

    name: string;

    slug: string;
}


export interface CategoriesResponse {
    message: string;

    data: Category[];
}


export const listCategories =
    async (): Promise<CategoriesResponse> => {

        const response =
            await api.get<CategoriesResponse>(
                '/api/businesses/categories/',
                {
                    withCredentials: true
                }
            );


        return response.data;
    };
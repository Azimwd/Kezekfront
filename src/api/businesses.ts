import { api } from "./api";

export interface Business { 
    id: number;
    owner: number;
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

export const createBusinesses = async(
    name: string, 
    description: string, 
    phone: string, 
    email: string, 
    city: number, 
    address: string,
    status: string,
    logo: File | null
) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('city', city.toString());
    formData.append('address', address);
    formData.append('status', status);

    if (logo) {
        formData.append('logo', logo);
    }

    const response = await api.post<businessesCreateResponse>(
        '/api/businesses/',
        formData,
        { 
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
}

export const listBusinesses = async (
    page: number = 1
) => {
    const response = await api.get<businessesListResponse>(
        '/api/businesses/',
        {
            withCredentials: true,
            params: {
                page
            }
        }
    );

    return response.data;
};

export const editCardBusinesses = async(
    id: number,
    name: string, 
    description: string, 
    phone: string, 
    email: string, 
    city: number, 
    address: string,
    status: string,
    logo: File | null
) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('city', city.toString());
    formData.append('address', address);
    formData.append('status', status)

    if (logo) {
        formData.append('logo', logo);
    }

    try {
        const response = await api.patch(
            `/api/businesses/${id}/`,
            formData,
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch(error) {
        console.error("Ошибка при редактировании:", error);
        throw error;
    }
}

export const deleteCardBusinesses = async(id: number) => {
    const response = await api.delete(`/api/businesses/${id}/`,{
        withCredentials:true
    })

    return response.data
}

export const listAllBusinesses = async (): Promise<Business[]> => {
    let page = 1;
    let allBusinesses: Business[] = [];

    while (true) {
        const response = await listBusinesses(page);

        allBusinesses = [
            ...allBusinesses,
            ...response.data
        ];

        if (
            !response.pagination ||
            page >= response.pagination.total_pages
        ) {
            break;
        }

        page += 1;
    }

    return allBusinesses;
};
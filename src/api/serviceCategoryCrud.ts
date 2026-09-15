import {
    api
} from './api';


export interface ServiceItem {
    id: number;

    business: number;

    category: number | null;
    category_name: string | null;

    name: string;

    description: string | null;

    price: string | number;

    duration_minutes: number;

    buffer_before_minutes: number;
    buffer_after_minutes: number;

    is_active: boolean;

    created_at?: string;
    updated_at?: string;
}


export interface ServicePayload {
    category: number | null;

    name: string;

    description: string | null;

    price: number;

    duration_minutes: number;

    buffer_before_minutes: number;

    buffer_after_minutes: number;

    is_active: boolean;
}


interface ServiceResponse {
    message: string;
    data: ServiceItem;
}

export const createServiceWithCategory =
    async (
        businessId: number,
        payload: ServicePayload
    ): Promise<ServiceItem> => {

        const response =
            await api.post<ServiceResponse>(
                `/api/businesses/${businessId}/services/`,
                payload,
                {
                    withCredentials: true
                }
            );


        return response.data.data;
    };



export const updateServiceWithCategory =
    async (
        serviceId: number,
        payload: ServicePayload
    ): Promise<ServiceItem> => {

        const response =
            await api.patch<ServiceResponse>(
                `/api/businesses/services/${serviceId}/`,
                payload,
                {
                    withCredentials: true
                }
            );


        return response.data.data;
    };
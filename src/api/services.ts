import { api } from './api';

export interface StaffMember {
    id: number;
    business: number;
    first_name: string;
    last_name: string;
    position: string;
    description: string;
    photo: string | null;
    is_active: boolean;

    services_count?: number;
    active_services_count?: number;
}

export interface StaffPagination {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
}

export interface StaffResponse {
    message: string;
    pagination: StaffPagination;
    data: StaffMember[];
}

export interface ServiceStaffItem {
    id: number;
    staff: number;
    staff_name: string;
    service: number;
    service_name: string;
}

export interface PutStaffResponse {
    message: string;
    data: ServiceStaffItem[];
}
export const createService = async (
    id: number,
    name: string,
    description: string,
    price: number,
    duration_minutes: number,
    buffer_before_minutes: number,
    buffer_after_minutes: number,
    is_active: boolean
) => {
    const response = await api.post(
        `/api/businesses/${id}/services/`,
        {
            name,
            description,
            price,
            duration_minutes,
            buffer_before_minutes,
            buffer_after_minutes,
            is_active
        },
        { withCredentials: true }
    );
    return response.data;
};

export const listOfServices = async (id: number) => {
    const response = await api.get(`/api/businesses/${id}/services/`, {
        withCredentials: true
    });
    return response.data;
};

export const editService = async (
    id: number,
    name: string,
    description: string,
    price: number,
    duration_minutes: number,
    buffer_before_minutes: number,
    buffer_after_minutes: number,
    is_active: boolean
) => {
    const response = await api.patch(
        `/api/businesses/services/${id}/`,
        {
            name,
            description,
            price,
            duration_minutes,
            buffer_before_minutes,
            buffer_after_minutes,
            is_active
        },
        { withCredentials: true }
    );
    return response.data;
};

export const deleteService = async (id: number) => {
    const response = await api.delete(`/api/businesses/services/${id}/`, {
        withCredentials: true
    });
    return response.data;
};

export const searchStaff = async (
    id: number,
    searchQuery: string = '',
    status: 'all' | 'active' | 'inactive' = 'all',
    page: number = 1
): Promise<StaffResponse> => {

    const response =
        await api.get<StaffResponse>(
            `/api/businesses/${id}/staff/`,
            {
                params: {
                    search: searchQuery,
                    status,
                    page
                },

                withCredentials: true
            }
        );

    return response.data;
};
export const putStaffToService = async (
    id: number,
    staff_ids: number[]
): Promise<PutStaffResponse> => {
    const response = await api.put(
        `/api/businesses/services/${id}/staff/`,
        { staff_ids: staff_ids },
        { withCredentials: true }
    );
    return response.data;
};

export const getAssignedStaffForService = async (serviceId: number) => {
    const response = await api.get(
        `/api/businesses/services/${serviceId}/staff/`,
        {
            params: { assigned_only: true },
            withCredentials: true
        }
    );
    return response.data;
};
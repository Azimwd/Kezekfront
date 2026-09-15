import { api } from './api';


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


export interface ServicePagination {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
}


export interface ServicesResponse {
    message: string;
    pagination: ServicePagination;
    data: ServiceItem[];
}


export interface ServiceResponse {
    message: string;
    data: ServiceItem;
}


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


/*
 * ============================================================
 * CREATE SERVICE
 * ============================================================
 */

export const createService = async (
    businessId: number,
    category: number | null,
    name: string,
    description: string,
    price: number,
    duration_minutes: number,
    buffer_before_minutes: number,
    buffer_after_minutes: number,
    is_active: boolean
): Promise<ServiceItem> => {

    const response =
        await api.post<ServiceResponse>(
            `/api/businesses/${businessId}/services/`,
            {
                category,
                name,
                description,
                price,
                duration_minutes,
                buffer_before_minutes,
                buffer_after_minutes,
                is_active
            },
            {
                withCredentials: true
            }
        );


    const payload =
        response.data as any;


    return payload.data ?? payload;
};


/*
 * ============================================================
 * LIST SERVICES
 * ============================================================
 */

export const listOfServices = async (
    businessId: number,
    page: number = 1
): Promise<ServicesResponse> => {

    const response =
        await api.get<ServicesResponse>(
            `/api/businesses/${businessId}/services/`,
            {
                params: {
                    page
                },

                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * EDIT SERVICE
 * ============================================================
 */

export const editService = async (
    serviceId: number,
    category: number | null,
    name: string,
    description: string,
    price: number,
    duration_minutes: number,
    buffer_before_minutes: number,
    buffer_after_minutes: number,
    is_active: boolean
): Promise<ServiceItem> => {

    const response =
        await api.patch<ServiceResponse>(
            `/api/businesses/services/${serviceId}/`,
            {
                category,
                name,
                description,
                price,
                duration_minutes,
                buffer_before_minutes,
                buffer_after_minutes,
                is_active
            },
            {
                withCredentials: true
            }
        );


    const payload =
        response.data as any;


    return payload.data ?? payload;
};


/*
 * ============================================================
 * DELETE SERVICE
 * ============================================================
 */

export const deleteService = async (
    serviceId: number
) => {

    const response =
        await api.delete(
            `/api/businesses/services/${serviceId}/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * SEARCH STAFF
 * ============================================================
 */

export const searchStaff = async (
    businessId: number,
    searchQuery: string = '',
    status: 'all' | 'active' | 'inactive' = 'all',
    page: number = 1
): Promise<StaffResponse> => {

    const response =
        await api.get<StaffResponse>(
            `/api/businesses/${businessId}/staff/`,
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


/*
 * ============================================================
 * PUT STAFF TO SERVICE
 * ============================================================
 */

export const putStaffToService = async (
    serviceId: number,
    staff_ids: number[]
): Promise<PutStaffResponse> => {

    const response =
        await api.put<PutStaffResponse>(
            `/api/businesses/services/${serviceId}/staff/`,
            {
                staff_ids
            },
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * GET ASSIGNED STAFF
 * ============================================================
 */

export const getAssignedStaffForService = async (
    serviceId: number
) => {

    const response =
        await api.get(
            `/api/businesses/services/${serviceId}/staff/`,
            {
                params: {
                    assigned_only: true
                },

                withCredentials: true
            }
        );


    return response.data;
};
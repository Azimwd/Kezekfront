import {
    api
} from './api';


export interface BookingBusiness {
    id: number;
    name: string;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    city?: number | null;
    city_name?: string | null;
    address?: string | null;
    logo?: string | null;
    status: string;
    booking_days_ahead?: number;
    rating?: number | null;
    reviews_count?: number;

    images?: Array<{
        id: number;
        image: string;
        is_main: boolean;
    }>;
}


export interface BookingServiceAddon {
    id: number;
    service: number;
    name: string;
    description?: string | null;
    price: string | number;
    duration_minutes: number;
    is_active: boolean;
}


export interface BookingService {
    id: number;
    business: number;
    category?: number | null;
    category_name?: string | null;
    name: string;
    description?: string | null;
    price: string | number;
    duration_minutes: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    is_active: boolean;
    addons: BookingServiceAddon[];
}


export interface BookingStaff {
    id: number;
    business: number;
    user?: number | null;
    first_name: string;
    last_name: string;
    position?: string | null;
    description?: string | null;
    photo?: string | null;
    is_active: boolean;
}


export interface CreatedAppointmentAddon {
    id: number;
    addon: number | null;
    name: string;
    price: string | number;
    duration_minutes: number;
}


export interface CreateBookingData {
    business: number;
    staff: number;
    service: number;
    addon_ids: number[];
    start_at: string;
    client_first_name: string;
    client_last_name: string;
    client_phone: string;
    comment?: string;
}


export interface CreatedAppointment {
    id: number;
    business: number;
    business_name?: string;
    staff: number;
    staff_name?: string;
    service: number;
    service_name?: string;
    addons?: CreatedAppointmentAddon[];
    start_at: string;
    end_at?: string;
    price?: string | number;
    status: string;
    client_first_name?: string;
    client_last_name?: string;
    client_phone?: string;
    comment?: string | null;
}


export interface CreateBookingResponse {
    message: string;
    data: CreatedAppointment;
}


interface PaginationResponse {
    pagination?: {
        current_page?: number;
        total_pages?: number;
        count?: number;
        page_size?: number;
    };

    data?: unknown;
    results?: unknown;
}


const extractArray =
    <T,>(
        payload: unknown
    ): T[] => {

        if (
            Array.isArray(
                payload
            )
        ) {
            return payload as T[];
        }


        if (
            !payload ||
            typeof payload !==
                'object'
        ) {
            return [];
        }


        const response =
            payload as
                PaginationResponse;


        if (
            Array.isArray(
                response.data
            )
        ) {
            return response.data as T[];
        }


        if (
            Array.isArray(
                response.results
            )
        ) {
            return response.results as T[];
        }


        return [];
    };


const getTotalPages =
    (
        payload: unknown
    ): number => {

        if (
            !payload ||
            typeof payload !==
                'object'
        ) {
            return 1;
        }


        const response =
            payload as
                PaginationResponse;


        const totalPages =
            Number(
                response
                    .pagination
                    ?.total_pages ??
                1
            );


        if (
            !Number.isFinite(
                totalPages
            ) ||
            totalPages < 1
        ) {
            return 1;
        }


        return totalPages;
    };


export const getBookingBusiness =
    async (
        businessId: number
    ): Promise<
        BookingBusiness
    > => {

        const response =
            await api.get(
                `/api/businesses/public/${businessId}/`,
                {
                    withCredentials:
                        true
                }
            );


        return (
            response.data
                ?.data ??
            response.data
        ) as BookingBusiness;
    };


export const getBookingServices =
    async (
        businessId: number
    ): Promise<
        BookingService[]
    > => {

        let page =
            1;


        const allServices:
            BookingService[] =
            [];


        while (
            true
        ) {

            const response =
                await api.get(
                    `/api/businesses/public/${businessId}/services/`,
                    {
                        params: {
                            page
                        },

                        withCredentials:
                            true
                    }
                );


            const services =
                extractArray<
                    BookingService
                >(
                    response.data
                );


            allServices.push(
                ...services
            );


            const totalPages =
                getTotalPages(
                    response.data
                );


            if (
                page >=
                totalPages
            ) {
                break;
            }


            page += 1;
        }


        return allServices
            .filter(
                service =>
                    service.is_active
            )
            .map(
                service => ({
                    ...service,

                    addons:
                        (
                            service.addons ??
                            []
                        ).filter(
                            addon =>
                                addon.is_active
                        )
                })
            );
    };


export const getBookingStaff =
    async (
        businessId: number,
        serviceId: number
    ): Promise<
        BookingStaff[]
    > => {

        let page =
            1;


        const allStaff:
            BookingStaff[] =
            [];


        while (
            true
        ) {

            const response =
                await api.get(
                    `/api/businesses/public/${businessId}/staff/`,
                    {
                        params: {
                            page,

                            service_id:
                                serviceId
                        },

                        withCredentials:
                            true
                    }
                );


            const staff =
                extractArray<
                    BookingStaff
                >(
                    response.data
                );


            allStaff.push(
                ...staff
            );


            const totalPages =
                getTotalPages(
                    response.data
                );


            if (
                page >=
                totalPages
            ) {
                break;
            }


            page += 1;
        }


        return allStaff.filter(
            staff =>
                staff.is_active
        );
    };


export const createBooking =
    async (
        data:
            CreateBookingData
    ): Promise<
        CreateBookingResponse
    > => {

        const response =
            await api.post<
                CreateBookingResponse
            >(
                '/api/appointments/',
                data,
                {
                    withCredentials:
                        true
                }
            );


        return response.data;
    };

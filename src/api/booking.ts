import {
    api
} from './api';


/*
 * ============================================================
 * BUSINESS
 * ============================================================
 */

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


/*
 * ============================================================
 * SERVICE
 * ============================================================
 */

export interface BookingService {
    id: number;

    business: number;

    category?: number | null;

    category_name?: string | null;

    name: string;

    description?: string | null;

    price:
        string |
        number;

    duration_minutes:
        number;

    buffer_before_minutes:
        number;

    buffer_after_minutes:
        number;

    is_active:
        boolean;
}


/*
 * ============================================================
 * STAFF
 * ============================================================
 */

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


/*
 * ============================================================
 * CREATE APPOINTMENT
 * ============================================================
 */

export interface CreateBookingData {
    business: number;

    staff: number;

    service: number;

    start_at: string;

    client_first_name: string;

    client_last_name: string;

    client_phone: string;

    comment?: string;
}


export interface CreatedAppointment {
    id: number;

    business: number;

    staff: number;

    service: number;

    start_at: string;

    status: string;

    client_first_name?: string;

    client_last_name?: string;

    client_phone?: string;

    comment?: string | null;
}


export interface CreateBookingResponse {
    message: string;

    data:
        CreatedAppointment;
}


/*
 * ============================================================
 * API RESPONSE
 * ============================================================
 */

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


/*
 * ============================================================
 * EXTRACT ARRAY
 * ============================================================
 */

const extractArray =
    <T,>(
        payload: unknown
    ): T[] => {

        /*
         * Backend может вернуть:
         *
         * [
         *     ...
         * ]
         */

        if (
            Array.isArray(
                payload
            )
        ) {

            return payload as T[];
        }


        /*
         * Проверяем object.
         */

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


        /*
         * Backend:
         *
         * {
         *     data: [...]
         * }
         */

        if (
            Array.isArray(
                response.data
            )
        ) {

            return response.data as T[];
        }


        /*
         * DRF:
         *
         * {
         *     results: [...]
         * }
         */

        if (
            Array.isArray(
                response.results
            )
        ) {

            return response.results as T[];
        }


        return [];
    };


/*
 * ============================================================
 * TOTAL PAGES
 * ============================================================
 */

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


/*
 * ============================================================
 * GET BUSINESS
 * ============================================================
 */

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


        /*
         * Поддерживаем:
         *
         * {
         *     data: {...}
         * }
         *
         * либо:
         *
         * {...}
         */

        return (
            response.data
                ?.data ??
            response.data
        ) as BookingBusiness;
    };


/*
 * ============================================================
 * GET SERVICES
 * ============================================================
 */

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


        /*
         * На странице записи
         * показываем только
         * активные услуги.
         */

        return allServices.filter(
            service =>
                service.is_active
        );
    };


/*
 * ============================================================
 * GET STAFF FOR SERVICE
 * ============================================================
 */

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


        /*
         * Не показываем
         * отключённых мастеров.
         */

        return allStaff.filter(
            staff =>
                staff.is_active
        );
    };


/*
 * ============================================================
 * CREATE BOOKING
 * ============================================================
 */

export const createBooking =
    async (
        data:
            CreateBookingData
    ): Promise<
        CreateBookingResponse
    > => {

        /*
         * appointments/urls.py:
         *
         * path(
         *     "",
         *     AppointmentCreateView.as_view()
         * )
         *
         * Поэтому endpoint:
         *
         * POST /api/appointments/
         */

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
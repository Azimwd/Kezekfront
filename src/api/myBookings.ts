import {
    api
} from './api';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface MyBooking {
    id: number;

    business: number;
    business_name?: string | null;

    staff: number;
    staff_name?: string | null;
    staff_first_name?: string | null;
    staff_last_name?: string | null;

    service: number;
    service_name?: string | null;

    start_at: string;
    end_at?: string | null;

    status: string;

    price?: string | number | null;

    client_first_name?: string;
    client_last_name?: string;
    client_phone?: string;

    comment?: string | null;

    /*
     * Backend должен отдавать эти два поля
     * через AppointmentSerializer.
     */
    has_review?: boolean;
    review_id?: number | null;

    created_at?: string;
}

export type MyBookingsTab =
    | 'upcoming'
    | 'history';
    
export interface MyBookingsPagination {
    current_page: number;
    total_pages: number;
    count: number;
    page_size?: number;

    next?: number | null;
    previous?: number | null;
}


export interface MyBookingsResponse {
    message: string;

    pagination:
        MyBookingsPagination;

    data:
        MyBooking[];
}


export interface CancelBookingResponse {
    message: string;
    status?: string;
    data?: MyBooking;
}


export interface RescheduleMyBookingData {
    appointmentId: number;
    startAt: string;
}


export interface RescheduleMyBookingResponse {
    message: string;
    data: MyBooking;
}


/*
 * ============================================================
 * GET MY BOOKINGS
 * ============================================================
 */

export const getMyBookings =
    async (
        page: number = 1,
        tab: MyBookingsTab = 'upcoming'
    ): Promise<
        MyBookingsResponse
    > => {

        const response =
            await api.get<
                MyBookingsResponse
            >(
                '/api/appointments/my/',
                {
                    params: {
                        page,
                        tab
                    },

                    withCredentials:
                        true
                }
            );


        return response.data;
    };


/*
 * ============================================================
 * CANCEL
 * ============================================================
 */

export const cancelMyBooking =
    async (
        appointmentId: number
    ): Promise<
        CancelBookingResponse
    > => {

        const response =
            await api.patch<
                CancelBookingResponse
            >(
                `/api/appointments/${appointmentId}/cancel/`,
                {},
                {
                    withCredentials:
                        true
                }
            );


        return response.data;
    };


/*
 * ============================================================
 * RESCHEDULE
 * ============================================================
 */

export const rescheduleMyBooking =
    async ({
        appointmentId,
        startAt
    }: RescheduleMyBookingData): Promise<
        RescheduleMyBookingResponse
    > => {

        const response =
            await api.patch<
                RescheduleMyBookingResponse
            >(
                `/api/appointments/${appointmentId}/reschedule/`,
                {
                    start_at:
                        startAt
                },
                {
                    withCredentials:
                        true
                }
            );


        return response.data;
    };

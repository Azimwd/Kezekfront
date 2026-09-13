import { api } from './api';


export interface DashboardSummary {
    today_count: number;
    pending_count: number;
    confirmed_count: number;
    completed_count: number;

    completed_revenue: number | string;
    expected_revenue: number | string;
}


export interface DashboardPagination {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;

    next: string | null;
    previous: string | null;
}


export interface DashboardAppointment {
    id: number;

    client: number;
    business: number;

    service: number;
    staff: number | null;

    start_at: string;
    end_at: string;

    status: string;

    price?: number | string;
    price_snapshot?: number | string;
    service_price?: number | string;

    client_name?: string | null;
    client_first_name?: string | null;
    client_last_name?: string | null;

    client_phone?: string | null;
    client_phone_snapshot?: string | null;

    service_name?: string | null;

    staff_name?: string | null;
    staff_first_name?: string | null;
    staff_last_name?: string | null;

    comment?: string | null;

    created_at?: string;
    updated_at?: string;
}


export interface DashboardAppointmentsResponse {
    message: string;

    summary: DashboardSummary;

    filtered_count: number;

    pagination: DashboardPagination;

    data: DashboardAppointment[];
}


export interface DashboardBusiness {
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

    services_count?: number;
    staff_count?: number;

    today_appointments_count?: number;

    rating?: number | string | null;
}


/*
 * ============================================================
 * ОДНА СТРАНИЦА APPOINTMENTS
 * ============================================================
 */

export const getDashboardAppointmentsPage = async (
    businessId: number,
    page: number = 1
): Promise<DashboardAppointmentsResponse> => {

    const response =
        await api.get<DashboardAppointmentsResponse>(
            `/api/appointments/businesses/${businessId}/`,
            {
                withCredentials: true,

                params: {
                    page
                }
            }
        );


    return response.data;
};


/*
 * ============================================================
 * DASHBOARD + ВСЕ СТРАНИЦЫ
 * ============================================================
 */

export const getDashboardData = async (
    businessId: number
): Promise<DashboardAppointmentsResponse> => {

    /*
     * Сначала получаем первую страницу.
     * Она даёт нам summary + количество страниц.
     */

    const firstPage =
        await getDashboardAppointmentsPage(
            businessId,
            1
        );


    const totalPages =
        firstPage.pagination?.total_pages ??
        1;


    /*
     * Если страница одна — сразу возвращаем.
     */

    if (
        totalPages <= 1
    ) {
        return firstPage;
    }


    /*
     * Загружаем остальные страницы параллельно.
     */

    const requests =
        Array.from(
            {
                length:
                    totalPages - 1
            },
            (
                _,
                index
            ) =>
                getDashboardAppointmentsPage(
                    businessId,
                    index + 2
                )
        );


    const otherPages =
        await Promise.all(
            requests
        );


    const allAppointments = [
        ...firstPage.data,

        ...otherPages.flatMap(
            page =>
                page.data
        )
    ];


    return {
        ...firstPage,

        data:
            allAppointments
    };
};


/*
 * ============================================================
 * BUSINESS
 * ============================================================
 */

export const getDashboardBusiness = async (
    businessId: number
): Promise<DashboardBusiness> => {

    const response =
        await api.get(
            `/api/businesses/${businessId}/`,
            {
                withCredentials: true
            }
        );


    const payload =
        response.data;


    /*
     * Поддерживает оба варианта:
     *
     * {
     *   message: "...",
     *   data: {...}
     * }
     *
     * и просто:
     *
     * {...}
     */

    return payload.data ??
        payload;
};


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

export const getAppointmentPrice = (
    appointment: DashboardAppointment
): number => {

    return Number(
        appointment.price ??
        appointment.price_snapshot ??
        appointment.service_price ??
        0
    );
};


export const getAppointmentClientName = (
    appointment: DashboardAppointment
): string => {

    if (
        appointment.client_name
    ) {
        return appointment.client_name;
    }


    const fullName =
        `${
            appointment.client_first_name ??
            ''
        } ${
            appointment.client_last_name ??
            ''
        }`
            .trim();


    if (
        fullName
    ) {
        return fullName;
    }


    return `Клиент #${appointment.client}`;
};


export const getAppointmentPhone = (
    appointment: DashboardAppointment
): string => {

    return (
        appointment.client_phone ??
        appointment.client_phone_snapshot ??
        ''
    );
};


export const getAppointmentStaffName = (
    appointment: DashboardAppointment
): string => {

    if (
        appointment.staff_name
    ) {
        return appointment.staff_name;
    }


    const fullName =
        `${
            appointment.staff_first_name ??
            ''
        } ${
            appointment.staff_last_name ??
            ''
        }`
            .trim();


    return fullName || '—';
};
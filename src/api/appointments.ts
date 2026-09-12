import { api } from './api';


export const getAllAppointments = async (
    businessId: number
) => {
    const response = await api.get(
        `/api/appointments/businesses/${businessId}/`,
        {
            withCredentials: true
        }
    );

    return response.data;
};


export const filterAppointments = async (
    businessId: number,
    filters: Record<string, unknown> = {}
) => {
    const response = await api.get(
        `/api/appointments/businesses/${businessId}/`,
        {
            withCredentials: true,
            params: filters
        }
    );

    return response.data;
};


export const getAppointmentDetail = async (
    appointmentId: number
) => {
    const response = await api.get(
        `/api/appointments/${appointmentId}/`,
        {
            withCredentials: true
        }
    );

    return response.data;
};


/*
 * Старое имя функции.
 * Оставляем для компонентов,
 * которые уже используют appointmentById.
 */
export const appointmentById = async (
    appointmentId: number
) => {
    return getAppointmentDetail(
        appointmentId
    );
};


export const confirmAppointment = async (
    appointmentId: number
) => {
    const response = await api.patch(
        `/api/appointments/${appointmentId}/confirm/`,
        {},
        {
            withCredentials: true
        }
    );

    return response.data;
};


export const completeAppointment = async (
    appointmentId: number
) => {
    const response = await api.patch(
        `/api/appointments/${appointmentId}/complete/`,
        {},
        {
            withCredentials: true
        }
    );

    return response.data;
};


export const cancelAppointment = async (
    appointmentId: number
) => {
    const response = await api.patch(
        `/api/appointments/${appointmentId}/cancel/`,
        {},
        {
            withCredentials: true
        }
    );

    return response.data;
};


export const rescheduleAppointment = async (
    appointmentId: number,
    startAt: string
) => {
    const response = await api.patch(
        `/api/appointments/${appointmentId}/reschedule/`,
        {
            start_at: startAt
        },
        {
            withCredentials: true
        }
    );

    return response.data;
};
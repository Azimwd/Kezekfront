import { api } from './api';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface AvailabilityDate {
    date: string;
    is_available: boolean;
    reason: string | null;
    available_slots_count: number;
}


export interface AvailabilityDatesResponse {
    message: string;
    data: AvailabilityDate[];
}


export interface AvailabilitySlot {
    time: string;
    start_at: string;
    end_at: string;
    is_available: boolean;
    reason: string | null;
}


export interface DayAvailability {
    date: string;
    is_available: boolean;
    reason: string | null;
    slots: AvailabilitySlot[];
}


export interface DayAvailabilityResponse {
    message: string;
    data: DayAvailability;
}


/*
 * ============================================================
 * ДОСТУПНЫЕ ДАТЫ
 * ============================================================
 */

export const getAvailabilityDates = async (
    staffId: number,
    serviceId: number,
    startDate: string
) => {
    const response = await api.get(
        '/api/scheduling/availability/dates/',
        {
            withCredentials: true,
            params: {
                staff_id: staffId,
                service_id: serviceId,
                start_date: startDate
            }
        }
    );

    return response.data;
};


/*
 * ============================================================
 * ДОСТУПНОЕ ВРЕМЯ НА ДАТУ
 * ============================================================
 */

export const getDayAvailability = async (
    staffId: number,
    serviceId: number,
    date: string
): Promise<DayAvailabilityResponse> => {

    const response =
        await api.get<DayAvailabilityResponse>(
            '/api/scheduling/availability/day/',
            {
                withCredentials: true,

                params: {
                    staff_id: staffId,
                    service_id: serviceId,
                    date
                }
            }
        );


    return response.data;
};
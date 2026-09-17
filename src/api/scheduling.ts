import {
    api
} from './api';


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
 *
 * Старый вариант:
 *
 * getAvailabilityDates(
 *     staffId,
 *     serviceId,
 *     startDate
 * )
 *
 *
 * Новый вариант:
 *
 * getAvailabilityDates(
 *     staffId,
 *     serviceId,
 *     startDate,
 *     bookingDaysAhead,
 *     addonIds
 * )
 *
 * Оба варианта работают.
 * ============================================================
 */

export const getAvailabilityDates =
    async (
        staffId: number,

        serviceId: number,

        startDate: string,

        bookingDaysAhead?: number,

        addonIds: number[] = []

    ): Promise<
        AvailabilityDatesResponse
    > => {

        /*
         * Формируем params отдельно,
         * чтобы не отправлять лишние
         * значения, если их нет.
         */

        const params: {
            staff_id: number;

            service_id: number;

            start_date: string;

            days?: number;

            addon_ids?: string;
        } = {

            staff_id:
                staffId,

            service_id:
                serviceId,

            start_date:
                startDate
        };


        /*
         * Количество дней вперёд.
         */

        if (
            bookingDaysAhead !==
                undefined &&
            bookingDaysAhead > 0
        ) {

            params.days =
                bookingDaysAhead;
        }


        /*
         * Addons.
         *
         * Например:
         *
         * [1, 5, 8]
         *
         * ->
         *
         * addon_ids=1,5,8
         */

        if (
            addonIds.length > 0
        ) {

            params.addon_ids =
                addonIds.join(
                    ','
                );
        }


        const response =
            await api.get<
                AvailabilityDatesResponse
            >(
                '/api/scheduling/availability/dates/',
                {
                    withCredentials:
                        true,

                    params
                }
            );


        return response.data;
    };


/*
 * ============================================================
 * ДОСТУПНОЕ ВРЕМЯ НА ДАТУ
 * ============================================================
 *
 * Старый вариант:
 *
 * getDayAvailability(
 *     staffId,
 *     serviceId,
 *     date
 * )
 *
 *
 * Новый вариант:
 *
 * getDayAvailability(
 *     staffId,
 *     serviceId,
 *     date,
 *     addonIds
 * )
 *
 * Оба варианта работают.
 * ============================================================
 */

export const getDayAvailability =
    async (
        staffId: number,

        serviceId: number,

        date: string,

        addonIds: number[] = []

    ): Promise<
        DayAvailabilityResponse
    > => {

        const params: {
            staff_id: number;

            service_id: number;

            date: string;

            addon_ids?: string;
        } = {

            staff_id:
                staffId,

            service_id:
                serviceId,

            date
        };


        /*
         * Дополнительные услуги.
         */

        if (
            addonIds.length > 0
        ) {

            params.addon_ids =
                addonIds.join(
                    ','
                );
        }


        const response =
            await api.get<
                DayAvailabilityResponse
            >(
                '/api/scheduling/availability/day/',
                {
                    withCredentials:
                        true,

                    params
                }
            );


        return response.data;
    };
import { api } from './api';


export interface BookingSettings {
    slot_step_minutes: number;
    min_booking_notice_hours: number;
    max_booking_days_ahead: number;
    auto_confirm_bookings: boolean;
    allow_client_cancel: boolean;
    cancel_before_hours: number;
}


interface BookingSettingsResponse {
    message: string;

    data: BookingSettings & {
        id: number;
        business: number;
    };
}


export const getSettings = async (
    businessId: number
): Promise<BookingSettingsResponse> => {
    const response =
        await api.get<BookingSettingsResponse>(
            `/api/scheduling/businesses/${businessId}/booking-settings/`
        );

    return response.data;
};


export const patchSettings = async (
    businessId: number,
    settings: BookingSettings
): Promise<BookingSettingsResponse> => {
    const response =
        await api.patch<BookingSettingsResponse>(
            `/api/scheduling/businesses/${businessId}/booking-settings/`,
            {
                slot_step_minutes:
                    settings.slot_step_minutes,

                min_booking_notice_hours:
                    settings.min_booking_notice_hours,

                max_booking_days_ahead:
                    settings.max_booking_days_ahead,

                auto_confirm_bookings:
                    settings.auto_confirm_bookings,

                allow_client_cancel:
                    settings.allow_client_cancel,

                cancel_before_hours:
                    settings.cancel_before_hours
            }
        );

    return response.data;
};
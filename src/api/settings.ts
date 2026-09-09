import { api } from "./api";

export const getSettings = async(id:number ) => {
    const response = await api.get(`/api/scheduling/businesses/${id}/booking-settings/`,
        { withCredentials: true }
    )

    return response.data
}

export const patchSettings = async(id:number, slot_step_minutes: number, min_booking_notice_hours: number, max_booking_days_ahead: number, auto_confirm_bookings: boolean, allow_client_cancel: boolean, cancel_before_hours: number) => {
    const response = await api.patch(`/api/scheduling/businesses/${id}/booking-settings/`,
        {
            slot_step_minutes, min_booking_notice_hours, max_booking_days_ahead, auto_confirm_bookings, allow_client_cancel, cancel_before_hours
        },
        {
            withCredentials:true
        }
    )

    return response.data
}
import { api } from './api';


export const getAllAppointments = async(id: number) => {
    const response = await api.get(`/api/appointments/businesses/${id}/`,
        {
            withCredentials: true
        }
    )

    return response.data
}


export const filterAppointments = async(id: number, filters: Record<string, any>) => {
    const response = await api.get(`/api/appointments/businesses/${id}/`,
        {
            withCredentials: true,
            params: filters
        },
        
    )

    return response.data
}

export const appointmentById = async(id: number) => {
    const response = await api.get(`/api/appointments/${id}/`,
        {
            withCredentials:true
        }
    )

    return response.data
}
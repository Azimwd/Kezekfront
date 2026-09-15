import { api } from './api';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface StaffAddData {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    description: string;
    is_active: boolean;
    photo?: File | null;
}


export interface StaffEditData {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    description: string;
    is_active: boolean;
    photo?: File | null;
}


/*
 * ============================================================
 * CREATE STAFF
 * ============================================================
 */

export const staffAdd = async ({
    id,
    first_name,
    last_name,
    position,
    description,
    is_active,
    photo
}: StaffAddData) => {

    const formData =
        new FormData();


    formData.append(
        'first_name',
        first_name
    );


    formData.append(
        'last_name',
        last_name
    );


    formData.append(
        'position',
        position
    );


    formData.append(
        'description',
        description
    );


    formData.append(
        'is_active',
        String(
            is_active
        )
    );


    /*
     * Фото отправляем только если
     * это настоящий File.
     */

    if (
        photo instanceof File
    ) {

        formData.append(
            'photo',
            photo,
            photo.name
        );
    }


    const response =
        await api.postForm(
            `/api/businesses/${id}/staff/`,
            formData,
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * GET ONE MASTER
 * ============================================================
 */

export const getOneMaster = async (
    id: number
) => {

    const response =
        await api.get(
            `/api/businesses/staff/${id}/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * GET MASTERS
 * ============================================================
 */

export const getMasters = async (
    id: number,
    page: number = 1,
    search: string = '',
    status:
        'all' |
        'active' |
        'inactive' = 'all'
) => {

    const response =
        await api.get(
            `/api/businesses/${id}/staff/`,
            {
                withCredentials: true,

                params: {
                    page,
                    search,
                    status
                }
            }
        );


    return response.data;
};


/*
 * ============================================================
 * GET ALL MASTERS
 * ============================================================
 */

export const getAllMasters = async (
    id: number
) => {

    let page =
        1;


    let allMasters: any[] =
        [];


    while (
        true
    ) {

        const response =
            await getMasters(
                id,
                page
            );


        allMasters = [
            ...allMasters,
            ...(
                response.data ??
                []
            )
        ];


        if (
            !response.pagination ||
            page >=
                response.pagination.total_pages
        ) {

            break;
        }


        page +=
            1;
    }


    return allMasters;
};


/*
 * ============================================================
 * EDIT STAFF
 * ============================================================
 */

export const editMasters = async ({
    id,
    first_name,
    last_name,
    position,
    description,
    is_active,
    photo
}: StaffEditData) => {

    const formData =
        new FormData();


    formData.append(
        'first_name',
        first_name
    );


    formData.append(
        'last_name',
        last_name
    );


    formData.append(
        'position',
        position
    );


    formData.append(
        'description',
        description
    );


    formData.append(
        'is_active',
        String(
            is_active
        )
    );


    /*
     * Если новое фото не выбрано,
     * поле photo не отправляется.
     *
     * Тогда старое фото останется.
     */

    if (
        photo instanceof File
    ) {

        formData.append(
            'photo',
            photo,
            photo.name
        );
    }


    const response =
        await api.patchForm(
            `/api/businesses/staff/${id}/`,
            formData,
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * DELETE STAFF
 * ============================================================
 */

export const deleteMasters = async (
    id: number
) => {

    const response =
        await api.delete(
            `/api/businesses/staff/${id}/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * GET STAFF BY ID
 * ============================================================
 */

export const getStaffById = async (
    id: number
) => {

    const response =
        await api.get(
            `/api/businesses/staff/${id}/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * WORKING HOURS
 * ============================================================
 */

export const getScheduleStaff = async (
    id: number
) => {

    const response =
        await api.get(
            `/api/scheduling/staff/${id}/working-hours/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


export const patchScheduleStaff = async (
    id: number,
    weekday: number,
    start_time: string,
    end_time: string,
    is_working_day: boolean
) => {

    const response =
        await api.patch(
            `/api/scheduling/working-hours/${id}/`,
            {
                weekday,
                start_time,
                end_time,
                is_working_day
            },
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * BREAKS
 * ============================================================
 */

export const getScheduleStaffBreaks = async (
    id: number
) => {

    const response =
        await api.get(
            `/api/scheduling/staff/${id}/breaks/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


export const postScheduleStaffBreaks = async (
    id: number,
    weekday: number,
    start_time: string,
    end_time: string
) => {

    const response =
        await api.post(
            `/api/scheduling/staff/${id}/breaks/`,
            {
                weekday,
                start_time,
                end_time
            },
            {
                withCredentials: true
            }
        );


    return response.data;
};


export const patchScheduleStaffBreaks = async (
    id: number,
    weekday: number,
    start_time: string,
    end_time: string
) => {

    const response =
        await api.patch(
            `/api/scheduling/breaks/${id}/`,
            {
                weekday,
                start_time,
                end_time
            },
            {
                withCredentials: true
            }
        );


    return response.data;
};


export const deleteScheduleStaffBreaks = async (
    id: number
) => {

    const response =
        await api.delete(
            `/api/scheduling/breaks/${id}/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


/*
 * ============================================================
 * DAYS OFF
 * ============================================================
 */

export const getScheduleStaffDaysOff = async (
    id: number
) => {

    const response =
        await api.get(
            `/api/scheduling/staff/${id}/days-off/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};


export const postScheduleStaffDaysOff = async (
    id: number,
    date: string,
    reason: string
) => {

    const response =
        await api.post(
            `/api/scheduling/staff/${id}/days-off/`,
            {
                date,
                reason
            },
            {
                withCredentials: true
            }
        );


    return response.data;
};


export const patchScheduleStaffDaysOff = async (
    id: number,
    date: string,
    reason: string
) => {

    const response =
        await api.patch(
            `/api/scheduling/days-off/${id}/`,
            {
                date,
                reason
            },
            {
                withCredentials: true
            }
        );


    return response.data;
};


export const deleteScheduleStaffDaysOff = async (
    id: number
) => {

    const response =
        await api.delete(
            `/api/scheduling/days-off/${id}/`,
            {
                withCredentials: true
            }
        );


    return response.data;
};
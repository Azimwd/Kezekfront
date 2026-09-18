import { useState } from 'react';

import {
    Pencil,
    Trash2
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';

import {
    deleteMasters
} from '../../../../api/staff';


const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';


export type Staff = {
    id: number;

    first_name: string;

    last_name: string;

    position: string;

    is_active: boolean;

    photo?: string | null;

    active_services_count?: number;
};


interface StaffTableProps {
    staffs: Staff[];
}


/*
 * ============================================================
 * PHOTO URL
 * ============================================================
 */

const getPhotoUrl = (
    photo?: string | null
): string | null => {

    if (
        !photo
    ) {
        return null;
    }


    if (
        photo.startsWith(
            'http://'
        ) ||
        photo.startsWith(
            'https://'
        )
    ) {
        return photo;
    }


    if (
        photo.startsWith(
            '/'
        )
    ) {
        return `${BACKEND_URL}${photo}`;
    }


    return `${BACKEND_URL}/${photo}`;
};


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function StaffTable({
    staffs
}: StaffTableProps) {

    const navigate =
        useNavigate();


    const queryClient =
        useQueryClient();


    /*
     * ============================================================
     * DELETE MODAL
     * ============================================================
     */

    const [
        deleteTarget,
        setDeleteTarget
    ] = useState<Staff | null>(
        null
    );


    const [
        deleteError,
        setDeleteError
    ] = useState('');


    /*
     * ============================================================
     * DELETE
     * ============================================================
     */

    const deleteMutation =
        useMutation({

            mutationFn:
                deleteMasters,


            onSuccess: () => {

                queryClient.invalidateQueries({
                    queryKey: [
                        'masters'
                    ]
                });


                queryClient.invalidateQueries({
                    queryKey: [
                        'staff'
                    ]
                });


                setDeleteTarget(
                    null
                );


                setDeleteError(
                    ''
                );
            },


            onError: (
                error
            ) => {

                console.error(
                    'Ошибка при удалении мастера:',
                    error
                );


                setDeleteError(
                    'Не удалось удалить сотрудника. Попробуйте ещё раз.'
                );
            }
        });


    const openDeleteModal = (
        staff: Staff
    ) => {

        setDeleteError(
            ''
        );


        setDeleteTarget(
            staff
        );
    };


    const closeDeleteModal = () => {

        if (
            deleteMutation.isPending
        ) {
            return;
        }


        setDeleteError(
            ''
        );


        setDeleteTarget(
            null
        );
    };


    const handleConfirmDelete = () => {

        if (
            !deleteTarget ||
            deleteMutation.isPending
        ) {
            return;
        }


        setDeleteError(
            ''
        );


        deleteMutation.mutate(
            deleteTarget.id
        );
    };


    /*
     * ============================================================
     * EMPTY
     * ============================================================
     */

    if (
        staffs.length ===
        0
    ) {

        return (
            <div
                className="
                    w-full
                    border-t
                    border-[#c7c4d8]
                    bg-white
                    px-4
                    py-10
                    text-center
                    text-sm
                    text-gray-500
                "
            >
                Сотрудники не найдены.
            </div>
        );
    }


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <>
            <div
                className="
                    mx-0
                flex
                w-full
                min-w-0
                flex-col
                overflow-hidden
                border-t
                border-[#c7c4d8]
                bg-[#f8f9ff]

                md:-mx-5
                md:w-auto
            "
        >

            {/* =====================================================
                MOBILE
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    divide-y
                    divide-gray-200
                    bg-white

                    md:hidden
                "
            >

                {staffs.map(
                    staff => {

                        const photoUrl =
                            getPhotoUrl(
                                staff.photo
                            );


                        const initial =
                            staff.first_name
                                ?.charAt(
                                    0
                                )
                                .toUpperCase() ||
                            '?';


                        return (
                            <div
                                key={
                                    staff.id
                                }
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                    p-4
                                "
                            >

                                {/* =================================
                                    TOP
                                ================================= */}

                                <div
                                    className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-3
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            items-center
                                            gap-3
                                        "
                                    >

                                        {/* PHOTO */}

                                        <div
                                            className="
                                                relative
                                                flex
                                                h-12
                                                w-12
                                                shrink-0
                                                items-center
                                                justify-center
                                                overflow-visible
                                                rounded-full
                                                bg-indigo-50
                                            "
                                        >

                                            <span
                                                className="
                                                    absolute
                                                    inset-0
                                                    flex
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    text-lg
                                                    font-bold
                                                    uppercase
                                                    text-indigo-600
                                                "
                                            >
                                                {
                                                    initial
                                                }
                                            </span>


                                            {photoUrl && (

                                                <img
                                                    src={
                                                        photoUrl
                                                    }
                                                    alt={
                                                        `${staff.first_name} ${staff.last_name || ''}`.trim()
                                                    }
                                                    className="
                                                        absolute
                                                        inset-0
                                                        z-[1]
                                                        h-full
                                                        w-full
                                                        rounded-full
                                                        border-2
                                                        border-indigo-50/50
                                                        bg-white
                                                        object-cover
                                                    "
                                                    onError={
                                                        event => {
                                                            event.currentTarget.style.display =
                                                                'none';
                                                        }
                                                    }
                                                />

                                            )}


                                            <span
                                                className={`
                                                    absolute
                                                    bottom-0
                                                    right-0
                                                    z-[2]
                                                    h-3.5
                                                    w-3.5
                                                    rounded-full
                                                    border-2
                                                    border-white

                                                    ${
                                                        staff.is_active
                                                            ? 'bg-[#10b981]'
                                                            : 'bg-gray-400'
                                                    }
                                                `}
                                            />

                                        </div>


                                        {/* NAME */}

                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >

                                            <Typography
                                                text={
                                                    `${staff.first_name} ${staff.last_name || ''}`.trim()
                                                }
                                                className="
                                                    break-words
                                                    text-[15px]
                                                    font-semibold
                                                    text-slate-900
                                                "
                                            />


                                            <div
                                                className="
                                                    mt-1
                                                    text-[12px]
                                                    text-gray-500
                                                "
                                            >
                                                {
                                                    staff.position ||
                                                    'Должность не указана'
                                                }
                                            </div>

                                        </div>

                                    </div>


                                    {/* ACTIONS */}

                                    <div
                                        className="
                                            flex
                                            shrink-0
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <Button
                                            type="button"
                                            className="
                                                flex
                                                h-9
                                                w-9
                                                cursor-pointer
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-[#EEF2FF]
                                                text-[#4F46E5]
                                                transition-colors
                                                hover:bg-[#E0E7FF]
                                            "
                                            onClick={() =>
                                                navigate(
                                                    `/crm/staff/edit/${staff.id}`
                                                )
                                            }
                                        >

                                            <Icon
                                                icon={
                                                    Pencil
                                                }
                                                size={
                                                    17
                                                }
                                            />

                                        </Button>


                                        <Button
                                            type="button"
                                            className={`
                                                flex
                                                h-9
                                                w-9
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-red-50
                                                text-red-500
                                                transition-colors
                                                hover:bg-red-100

                                                ${
                                                    deleteMutation.isPending
                                                        ? `
                                                            cursor-not-allowed
                                                            opacity-50
                                                        `
                                                        : `
                                                            cursor-pointer
                                                        `
                                                }
                                            `}
                                            onClick={() =>
                                                openDeleteModal(
                                                    staff
                                                )
                                            }
                                            disabled={
                                                deleteMutation.isPending
                                            }
                                        >

                                            <Icon
                                                icon={
                                                    Trash2
                                                }
                                                size={
                                                    17
                                                }
                                            />

                                        </Button>

                                    </div>

                                </div>


                                {/* =================================
                                    INFO
                                ================================= */}

                                <div
                                    className="
                                        grid
                                        grid-cols-2
                                        gap-3
                                        rounded-xl
                                        bg-[#f8f9ff]
                                        p-3
                                    "
                                >

                                    {/* STATUS */}

                                    <div>

                                        <div
                                            className="
                                                mb-1
                                                text-[10px]
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-gray-400
                                            "
                                        >
                                            Статус
                                        </div>


                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >

                                            <span
                                                className={`
                                                    h-2
                                                    w-2
                                                    shrink-0
                                                    rounded-full

                                                    ${
                                                        staff.is_active
                                                            ? 'bg-[#10b981]'
                                                            : 'bg-gray-400'
                                                    }
                                                `}
                                            />


                                            <span
                                                className={`
                                                    text-[13px]
                                                    font-medium

                                                    ${
                                                        staff.is_active
                                                            ? 'text-[#10b981]'
                                                            : 'text-gray-500'
                                                    }
                                                `}
                                            >
                                                {
                                                    staff.is_active
                                                        ? 'Активен'
                                                        : 'Неактивен'
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    {/* SERVICES */}

                                    <div>

                                        <div
                                            className="
                                                mb-1
                                                text-[10px]
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-gray-400
                                            "
                                        >
                                            Услуги
                                        </div>


                                        <div
                                            className="
                                                text-[14px]
                                                font-semibold
                                                text-[#4F46E5]
                                            "
                                        >
                                            {
                                                staff.active_services_count ??
                                                0
                                            }
                                        </div>

                                    </div>

                                </div>

                            </div>
                        );
                    }
                )}

            </div>


            {/* =====================================================
                DESKTOP TABLE
            ===================================================== */}

            <div
                className="
                    hidden
                    overflow-x-auto

                    md:block
                "
            >

                <table
                    className="
                        min-w-[800px]
                        w-full
                        border-collapse
                        text-left
                    "
                >

                    {/* =================================================
                        HEAD
                    ================================================= */}

                    <thead>

                        <tr
                            className="
                                border-b
                                border-[#c7c4d8]
                            "
                        >

                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-[#444444]
                                "
                            >
                                Сотрудник
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-[#444444]
                                "
                            >
                                Должность
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-[#444444]
                                "
                            >
                                Статус
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-[#444444]
                                "
                            >
                                Услуги
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-right
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-[#444444]
                                "
                            >
                                Действия
                            </th>

                        </tr>

                    </thead>


                    {/* =================================================
                        BODY
                    ================================================= */}

                    <tbody
                        className="
                            divide-y
                            divide-gray-200
                            bg-white
                        "
                    >

                        {staffs.map(
                            staff => {

                                const photoUrl =
                                    getPhotoUrl(
                                        staff.photo
                                    );


                                const initial =
                                    staff.first_name
                                        ?.charAt(
                                            0
                                        )
                                        .toUpperCase() ||
                                    '?';


                                return (
                                    <tr
                                        key={
                                            staff.id
                                        }
                                        className="
                                            transition-colors
                                            hover:bg-[#f8f9ff]
                                        "
                                    >

                                        {/* STAFF */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-6
                                                py-4
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        relative
                                                        flex
                                                        h-11
                                                        w-11
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        overflow-visible
                                                        rounded-full
                                                        bg-indigo-50
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            absolute
                                                            inset-0
                                                            flex
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            text-lg
                                                            font-bold
                                                            uppercase
                                                            text-indigo-600
                                                        "
                                                    >
                                                        {
                                                            initial
                                                        }
                                                    </span>


                                                    {photoUrl && (

                                                        <img
                                                            src={
                                                                photoUrl
                                                            }
                                                            alt={
                                                                `${staff.first_name} ${staff.last_name || ''}`.trim()
                                                            }
                                                            className="
                                                                absolute
                                                                inset-0
                                                                z-[1]
                                                                h-full
                                                                w-full
                                                                rounded-full
                                                                border-2
                                                                border-indigo-50/50
                                                                bg-white
                                                                object-cover
                                                            "
                                                            onError={
                                                                event => {
                                                                    event.currentTarget.style.display =
                                                                        'none';
                                                                }
                                                            }
                                                        />

                                                    )}


                                                    <span
                                                        className={`
                                                            absolute
                                                            bottom-0
                                                            right-0
                                                            z-[2]
                                                            h-3.5
                                                            w-3.5
                                                            rounded-full
                                                            border-2
                                                            border-white

                                                            ${
                                                                staff.is_active
                                                                    ? 'bg-[#10b981]'
                                                                    : 'bg-gray-400'
                                                            }
                                                        `}
                                                    />

                                                </div>


                                                <Typography
                                                    className="
                                                        text-base
                                                        font-semibold
                                                        text-slate-900
                                                    "
                                                    text={
                                                        `${staff.first_name} ${staff.last_name || ''}`.trim()
                                                    }
                                                />

                                            </div>

                                        </td>


                                        {/* POSITION */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-6
                                                py-4
                                                text-sm
                                                text-gray-700
                                            "
                                        >
                                            {
                                                staff.position ||
                                                '—'
                                            }
                                        </td>


                                        {/* STATUS */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-6
                                                py-4
                                                text-sm
                                            "
                                        >

                                            {staff.is_active ? (

                                                <span
                                                    className="
                                                        font-medium
                                                        text-[#10b981]
                                                    "
                                                >
                                                    Активен
                                                </span>

                                            ) : (

                                                <span
                                                    className="
                                                        font-medium
                                                        text-gray-500
                                                    "
                                                >
                                                    Неактивен
                                                </span>

                                            )}

                                        </td>


                                        {/* SERVICES */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-6
                                                py-4
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-[#eeebff]
                                                    px-3
                                                    py-1
                                                    text-sm
                                                    font-semibold
                                                    text-[#4F46E5]
                                                "
                                            >
                                                {
                                                    staff.active_services_count ??
                                                    0
                                                }
                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-6
                                                py-4
                                                text-sm
                                                text-gray-700
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-end
                                                    gap-5
                                                "
                                            >

                                                <Button
                                                    type="button"
                                                    className="
                                                        cursor-pointer
                                                        text-slate-500
                                                        transition-colors
                                                        hover:text-indigo-600
                                                    "
                                                    onClick={() =>
                                                        navigate(
                                                            `/crm/staff/edit/${staff.id}`
                                                        )
                                                    }
                                                >

                                                    <Icon
                                                        icon={
                                                            Pencil
                                                        }
                                                        size={
                                                            20
                                                        }
                                                    />

                                                </Button>


                                                <Button
                                                    type="button"
                                                    className={`
                                                        text-slate-500
                                                        transition-colors
                                                        hover:text-red-500

                                                        ${
                                                            deleteMutation.isPending
                                                                ? `
                                                                    cursor-not-allowed
                                                                    opacity-50
                                                                `
                                                                : `
                                                                    cursor-pointer
                                                                `
                                                        }
                                                    `}
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            staff
                                                        )
                                                    }
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                >

                                                    <Icon
                                                        icon={
                                                            Trash2
                                                        }
                                                        size={
                                                            20
                                                        }
                                                    />

                                                </Button>

                                            </div>

                                        </td>

                                    </tr>
                                );
                            }
                        )}

                    </tbody>

                </table>

            </div>

        </div>


        {deleteTarget && (

            <div
                className="
                    fixed
                    inset-0
                    z-[100]
                    flex
                    items-center
                    justify-center
                    bg-slate-950/45
                    px-4
                    backdrop-blur-[2px]
                "
                onMouseDown={
                    closeDeleteModal
                }
            >

                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-staff-title"
                    onMouseDown={
                        event =>
                            event.stopPropagation()
                    }
                    className="
                        w-full
                        max-w-[440px]
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-2xl
                    "
                >

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-2xl
                            bg-red-50
                            text-red-500
                        "
                    >
                        <Trash2 size={22} />
                    </div>

                    <h2
                        id="delete-staff-title"
                        className="
                            mt-5
                            text-xl
                            font-bold
                            text-slate-900
                        "
                    >
                        Удалить сотрудника?
                    </h2>

                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        Вы собираетесь удалить{' '}
                        <span className="font-semibold text-slate-800">
                            {`${deleteTarget.first_name} ${deleteTarget.last_name || ''}`.trim()}
                        </span>
                        . Это действие нельзя отменить.
                    </p>

                    {deleteTarget.active_services_count !== undefined &&
                        deleteTarget.active_services_count > 0 && (
                            <div
                                className="
                                    mt-4
                                    rounded-xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    px-4
                                    py-3
                                    text-sm
                                    leading-5
                                    text-amber-800
                                "
                            >
                                У сотрудника привязано услуг:{' '}
                                <strong>
                                    {deleteTarget.active_services_count}
                                </strong>
                                . После удаления проверьте привязки услуг.
                            </div>
                        )}

                    {deleteError && (
                        <div
                            className="
                                mt-4
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                                text-sm
                                leading-5
                                text-red-700
                            "
                        >
                            {deleteError}
                        </div>
                    )}

                    <div
                        className="
                            mt-6
                            flex
                            flex-col-reverse
                            gap-3
                            sm:flex-row
                            sm:justify-end
                        "
                    >
                        <Button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={closeDeleteModal}
                            className="
                                cursor-pointer
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-700
                                transition-colors
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Отмена
                        </Button>

                        <Button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={handleConfirmDelete}
                            className="
                                cursor-pointer
                                rounded-xl
                                bg-red-500
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition-colors
                                hover:bg-red-600
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {deleteMutation.isPending
                                ? 'Удаление...'
                                : 'Удалить'}
                        </Button>
                    </div>
                </div>
            </div>

        )}

        </>
    );
}
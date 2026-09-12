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


export default function StaffTable({
    staffs
}: StaffTableProps) {

    const navigate =
        useNavigate();

    const queryClient =
        useQueryClient();


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

            },

            onError: (
                error
            ) => {

                console.error(
                    'Ошибка при удалении мастера:',
                    error
                );

                alert(
                    'Произошла ошибка при удалении.'
                );
            }
        });


    const handleDelete = (
        id: number
    ) => {

        const isConfirmed =
            window.confirm(
                'Вы уверены, что хотите удалить этого сотрудника?'
            );


        if (
            isConfirmed
        ) {
            deleteMutation.mutate(
                id
            );
        }
    };


    return (
        <div
            className="
                -mx-5
                flex
                flex-col
                overflow-hidden
                border-t
                border-[#c7c4d8]
                bg-[#f8f9ff]
            "
        >

            <div className="overflow-x-auto">

                <table
                    className="
                        min-w-[800px]
                        w-full
                        border-collapse
                        text-left
                    "
                >

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


                    <tbody
                        className="
                            divide-y
                            divide-gray-200
                            bg-white
                        "
                    >

                        {staffs.length > 0 ? (

                            staffs.map(
                                (
                                    staff
                                ) => (

                                    <tr
                                        key={
                                            staff.id
                                        }
                                        className="
                                            transition-colors
                                            hover:bg-[#f8f9ff]
                                        "
                                    >

                                        {/* СОТРУДНИК */}

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
                                                        rounded-full
                                                        bg-indigo-50
                                                    "
                                                >

                                                    {staff.photo ? (

                                                        <img
                                                            src={
                                                                staff.photo
                                                            }
                                                            alt={
                                                                staff.first_name
                                                            }
                                                            className="
                                                                h-full
                                                                w-full
                                                                rounded-full
                                                                border-2
                                                                border-indigo-50/50
                                                                object-cover
                                                            "
                                                        />

                                                    ) : (

                                                        <span
                                                            className="
                                                                text-lg
                                                                font-bold
                                                                uppercase
                                                                text-indigo-600
                                                            "
                                                        >
                                                            {
                                                                staff.first_name
                                                                    ?.charAt(
                                                                        0
                                                                    ) ||
                                                                '?'
                                                            }
                                                        </span>

                                                    )}


                                                    <span
                                                        className={`
                                                            absolute
                                                            bottom-0
                                                            right-0
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
                                                    className="
                                                        cursor-pointer
                                                        text-slate-500
                                                        transition-colors
                                                        hover:text-red-500
                                                        disabled:opacity-50
                                                    "
                                                    onClick={() =>
                                                        handleDelete(
                                                            staff.id
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

                                )
                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan={
                                        5
                                    }
                                    className="
                                        px-6
                                        py-10
                                        text-center
                                        text-gray-500
                                    "
                                >
                                    Сотрудники не найдены.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}
import {
    CalendarClock,
    FileText,
    Trash2
} from 'lucide-react';

import {
    useState
} from 'react';

import {
    useParams,
    useNavigate
} from 'react-router-dom';

import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import Button from '../../../../atoms/Button';
import Icon from '../../../../atoms/Icon';
import Typography from '../../../../atoms/Typography';

import {
    deleteMasters
} from '../../../../../api/staff';


interface StaffEditButtonsProps {
    fullName: string;
}


export default function StaffEditButtons({
    fullName
}: StaffEditButtonsProps) {
    const {
        id
    } = useParams<{
        id: string;
    }>();


    const navigate =
        useNavigate();


    const queryClient =
        useQueryClient();


    const [
        showDeleteModal,
        setShowDeleteModal
    ] = useState(false);


    const [
        deleteError,
        setDeleteError
    ] = useState('');


    const deleteMutation =
        useMutation({
            mutationFn:
                deleteMasters,

            onSuccess: () => {
                setShowDeleteModal(
                    false
                );

                setDeleteError(
                    ''
                );

                queryClient.invalidateQueries({
                    queryKey: [
                        'masters'
                    ]
                });

                navigate(
                    '/crm/staff'
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


    const handleSchedule = () => {
        if (!id) {
            return;
        }

        navigate(
            `/crm/schedule?staff_id=${id}`
        );
    };


    const handleAppointments = () => {
        if (!id) {
            return;
        }


        const params =
            new URLSearchParams();


        params.set(
            'staff_id',
            id
        );


        if (
            fullName.trim()
        ) {
            params.set(
                'search',
                fullName.trim()
            );
        }


        navigate(
            `/crm/appointments?${params.toString()}`
        );
    };


    const handleDelete = () => {
        setDeleteError(
            ''
        );

        setShowDeleteModal(
            true
        );
    };


    const handleConfirmDelete = () => {
        if (!id) {
            return;
        }

        deleteMutation.mutate(
            Number(id)
        );
    };


    const handleCloseModal = () => {
        if (
            deleteMutation.isPending
        ) {
            return;
        }

        setDeleteError(
            ''
        );

        setShowDeleteModal(
            false
        );
    };


    return (
        <>
            <div
                className="
                    flex
                    w-full
                    flex-col
                    rounded-3xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    p-6
                    sm:p-8
                "
            >
                <Typography
                    text="БЫСТРЫЕ ДЕЙСТВИЯ"
                    className="
                        mb-6
                        text-[13px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#475569]
                    "
                />


                <div
                    className="
                        flex
                        flex-col
                        gap-5
                    "
                >

                    {/* РАСПИСАНИЕ */}

                    <Button
                        type="button"
                        onClick={
                            handleSchedule
                        }
                        className="
                            -ml-2
                            flex
                            w-full
                            cursor-pointer
                            items-center
                            justify-start
                            gap-4
                            rounded-xl
                            border-none
                            bg-transparent
                            p-2
                            shadow-none
                            transition-colors
                            hover:bg-slate-50
                        "
                    >
                        <Icon
                            icon={
                                CalendarClock
                            }
                            className="
                                h-[22px]
                                w-[22px]
                                text-[#3B28CC]
                            "
                        />

                        <Typography
                            text="Настроить расписание"
                            className="
                                text-[15px]
                                font-medium
                                text-[#0F172A]
                            "
                        />
                    </Button>


                    {/* ЗАПИСИ */}

                    <Button
                        type="button"
                        onClick={
                            handleAppointments
                        }
                        className="
                            -ml-2
                            flex
                            w-full
                            cursor-pointer
                            items-center
                            justify-start
                            gap-4
                            rounded-xl
                            border-none
                            bg-transparent
                            p-2
                            shadow-none
                            transition-colors
                            hover:bg-slate-50
                        "
                    >
                        <Icon
                            icon={
                                FileText
                            }
                            className="
                                h-[22px]
                                w-[22px]
                                text-[#3B28CC]
                            "
                        />

                        <Typography
                            text="Посмотреть записи"
                            className="
                                text-[15px]
                                font-medium
                                text-[#0F172A]
                            "
                        />
                    </Button>

                </div>


                <div
                    className="
                        my-6
                        w-full
                        border-t
                        border-[#E2E8F0]
                    "
                />


                {/* УДАЛИТЬ */}

                <Button
                    type="button"
                    onClick={
                        handleDelete
                    }
                    disabled={
                        deleteMutation.isPending
                    }
                    className="
                        group
                        -ml-2
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        justify-start
                        gap-4
                        rounded-xl
                        border-none
                        bg-transparent
                        p-2
                        shadow-none
                        transition-colors
                        hover:bg-red-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <Icon
                        icon={
                            Trash2
                        }
                        className="
                            h-[22px]
                            w-[22px]
                            text-[#DC2626]
                            transition-colors
                            group-hover:text-red-700
                        "
                    />

                    <Typography
                        text="Удалить мастера"
                        className="
                            text-[15px]
                            font-medium
                            text-[#DC2626]
                            transition-colors
                            group-hover:text-red-700
                        "
                    />
                </Button>
            </div>


            {/* MODAL */}

            {showDeleteModal && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        px-4
                        backdrop-blur-[2px]
                    "
                    onClick={
                        handleCloseModal
                    }
                >
                    <div
                        className="
                            w-full
                            max-w-[430px]
                            rounded-3xl
                            bg-white
                            p-6
                            shadow-2xl
                        "
                        onClick={(
                            e
                        ) =>
                            e.stopPropagation()
                        }
                    >

                        {/* ICON */}

                        <div
                            className="
                                mb-5
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-red-50
                            "
                        >
                            <Trash2
                                size={
                                    22
                                }
                                className="
                                    text-red-600
                                "
                            />
                        </div>


                        {/* TITLE */}

                        <h2
                            className="
                                text-xl
                                font-semibold
                                text-slate-900
                            "
                        >
                            Удалить сотрудника?
                        </h2>


                        {/* DESCRIPTION */}

                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-slate-500
                            "
                        >
                            Вы уверены, что хотите удалить{' '}

                            <span
                                className="
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                {fullName ||
                                    'этого сотрудника'}
                            </span>

                            ? Это действие нельзя будет отменить.
                        </p>


                        {/* ERROR */}

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
                                    text-red-600
                                "
                            >
                                {deleteError}
                            </div>
                        )}


                        {/* BUTTONS */}

                        <div
                            className="
                                mt-7
                                flex
                                justify-end
                                gap-3
                            "
                        >

                            <button
                                type="button"
                                disabled={
                                    deleteMutation.isPending
                                }
                                onClick={
                                    handleCloseModal
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    transition
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                Отмена
                            </button>


                            <button
                                type="button"
                                disabled={
                                    deleteMutation.isPending
                                }
                                onClick={
                                    handleConfirmDelete
                                }
                                className="
                                    min-w-[100px]
                                    rounded-xl
                                    bg-red-600
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {deleteMutation.isPending
                                    ? 'Удаление...'
                                    : 'Удалить'
                                }
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
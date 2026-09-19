import {
    useState
} from 'react';

import {
    useParams
} from 'react-router-dom';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import {
    format,
    intervalToDuration
} from 'date-fns';


import EditHeader from './EditHeader';

import ManageAppoinment from './ManageAppoinment';

import Details from './Details';

import MasterAppointment from './MasterAppointment';

import CommentAppointment from './CommentAppointment';

import RescheduleModal from '../../../../molecules/Crm/Appointments/RescheduleModal';


import ClientInfo from '../../../../molecules/Crm/Appointments/ClientInfo';


import {
    appointmentById,
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    rescheduleAppointment
} from '../../../../../api/appointments';


export default function EditAppointment() {

    const {
        id
    } = useParams<{
        id: string;
    }>();


    const appointmentId =
        Number(id);


    const queryClient =
        useQueryClient();


    const [
        showRescheduleModal,
        setShowRescheduleModal
    ] = useState(false);


    /*
     * ========================================================
     * GET APPOINTMENT
     * ========================================================
     */

    const {
        data,
        isPending,
        isError
    } = useQuery({

        queryKey: [
            'editAppointment',
            id
        ],

        queryFn: () =>
            appointmentById(
                appointmentId
            ),

        enabled:
            !!id &&
            Number.isFinite(
                appointmentId
            ),

        retry: false
    });


    /*
     * ========================================================
     * ОБНОВИТЬ ДАННЫЕ ПОСЛЕ ИЗМЕНЕНИЙ
     * ========================================================
     */

    const refreshAppointment = () => {

        queryClient.invalidateQueries({
            queryKey: [
                'editAppointment',
                id
            ]
        });


        /*
         * Обновляем также общий
         * список записей.
         */
        queryClient.invalidateQueries({
            queryKey: [
                'appointments'
            ]
        });

    };


    /*
     * ========================================================
     * CONFIRM
     * ========================================================
     */

    const confirmMutation =
        useMutation({

            mutationFn: () =>
                confirmAppointment(
                    appointmentId
                ),

            onSuccess: () => {

                refreshAppointment();

            },

            onError: (
                error
            ) => {

                console.error(
                    'Ошибка подтверждения записи:',
                    error
                );

            }
        });


    /*
     * ========================================================
     * COMPLETE
     * ========================================================
     */

    const completeMutation =
        useMutation({

            mutationFn: () =>
                completeAppointment(
                    appointmentId
                ),

            onSuccess: () => {

                refreshAppointment();

            },

            onError: (
                error
            ) => {

                console.error(
                    'Ошибка завершения записи:',
                    error
                );

            }
        });


    /*
     * ========================================================
     * CANCEL
     * ========================================================
     */

    const cancelMutation =
        useMutation({

            mutationFn: () =>
                cancelAppointment(
                    appointmentId
                ),

            onSuccess: () => {

                refreshAppointment();

            },

            onError: (
                error
            ) => {

                console.error(
                    'Ошибка отмены записи:',
                    error
                );

            }
        });


    /*
     * ========================================================
     * RESCHEDULE
     * ========================================================
     */

    const rescheduleMutation =
        useMutation({

            mutationFn: (
                newStartAt: string
            ) =>
                rescheduleAppointment(
                    appointmentId,
                    newStartAt
                ),

            onSuccess: () => {

                setShowRescheduleModal(
                    false
                );


                refreshAppointment();

            },

            onError: (
                error
            ) => {

                console.error(
                    'Ошибка переноса записи:',
                    error
                );

            }
        });


    /*
     * ========================================================
     * LOADING
     * ========================================================
     */

    if (
        isPending
    ) {
        return (
            <div
                className="
                    flex
                    h-64
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                "
            >
                <span
                    className="
                        text-gray-500
                    "
                >
                    Загрузка данных...
                </span>
            </div>
        );
    }


    /*
     * ========================================================
     * ERROR
     * ========================================================
     */

    if (
        isError ||
        !data?.data
    ) {
        return (
            <div
                className="
                    flex
                    h-64
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-red-200
                    bg-white
                "
            >
                <span
                    className="
                        text-red-500
                    "
                >
                    Ошибка загрузки или запись не найдена.
                </span>
            </div>
        );
    }


    /*
     * ========================================================
     * APPOINTMENT
     * ========================================================
     */

    const appointment =
        data.data;


    /*
     * ========================================================
     * DATE FORMAT
     * ========================================================
     */


    const formatCreateAt =
        format(
            new Date(
                appointment.created_at
            ),
            'dd.MM.yyyy'
        );


    const formatTimeCreateAt =
        format(
            new Date(
                appointment.created_at
            ),
            'HH:mm'
        );


    /*
     * ========================================================
     * DURATION
     * ========================================================
     */

    const durationMinutes =
        Math.max(
            0,
            Math.round(
                (
                    new Date(
                        appointment.end_at
                    ).getTime() -
                    new Date(
                        appointment.start_at
                    ).getTime()
                ) / 60000
            )
        );


    /*
     * ========================================================
     * ACTION LOADING
     * ========================================================
     */

    const actionPending =
        confirmMutation.isPending ||
        completeMutation.isPending ||
        cancelMutation.isPending;


    return (
        <div
            className="
                flex
                flex-col
                gap-10
            "
        >

            {/* HEADER */}

            <EditHeader
                id={
                    `${appointment.id}`
                }
                created_at={
                    formatCreateAt
                }
                created_time={
                    formatTimeCreateAt
                }
            />


            {/* CONTENT */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-10
                    lg:grid-cols-[2fr_1fr]
                "
            >

                {/* LEFT */}

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-10
                    "
                >

                    <ClientInfo
                        name={
                            appointment.client_first_name
                        }
                        last_name={
                            appointment.client_last_name
                        }
                        phone_num={
                            appointment.client_phone
                        }
                        client_ltv={
                            appointment.client_ltv
                        }
                        client_total_visit={
                            appointment.client_total_visits ??
                            appointment.client_total_visit ??
                            0
                        }
                    />


                    <Details
                        service_name={
                            appointment.service_name
                        }
                        description={
                            appointment.service_description
                        }
                        duration_minutes={
                            durationMinutes
                        }
                        price={
                            appointment.price
                        }
                        addons={
                            appointment.addons || []
                        }
                    />

                </div>


                {/* RIGHT */}

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-10
                    "
                >

                    <ManageAppoinment
                        status={
                            appointment.status
                        }
                        isPending={
                            actionPending
                        }
                        onConfirm={() =>
                            confirmMutation.mutate()
                        }
                        onComplete={() =>
                            completeMutation.mutate()
                        }
                        onCancel={() =>
                            cancelMutation.mutate()
                        }
                        onReschedule={() =>
                            setShowRescheduleModal(
                                true
                            )
                        }
                    />


                    <CommentAppointment
                        comment={
                            appointment.comment
                        }
                    />


                    <MasterAppointment
                        name={
                            appointment.staff_first_name
                        }
                        last_name={
                            appointment.staff_last_name
                        }
                        position={
                            appointment.staff_position
                        }
                    />

                </div>

            </div>


            {/* RESCHEDULE MODAL */}

            {showRescheduleModal && (
                <RescheduleModal
                    currentStartAt={
                        appointment.start_at
                    }
                    staffId={
                        Number(
                            appointment.staff
                        )
                    }
                    serviceId={
                        Number(
                            appointment.service
                        )
                    }
                    onClose={() =>
                        setShowRescheduleModal(
                            false
                        )
                    }
                    onSubmit={(
                        newStartAt: string
                    ) =>
                        rescheduleMutation.mutate(
                            newStartAt
                        )
                    }
                    isPending={
                        rescheduleMutation.isPending
                    }
                />
            )}
        </div>
    );
}
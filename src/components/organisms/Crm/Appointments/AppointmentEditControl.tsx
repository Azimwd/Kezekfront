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
    format
} from 'date-fns';

import {
    ru
} from 'date-fns/locale';


import ClientInfo
    from '../../../molecules/Crm/Appointments/ClientInfo';

import AppointmentManagement
    from '../../../molecules/Crm/Appointments/AppointmentManagement';

import AppointmentComment
    from '../../../molecules/Crm/Appointments/AppointmentComment';

import AppointmentStaff
    from '../../../molecules/Crm/Appointments/AppointmentStaff';

import AppointmentTime
    from '../../../organisms/Crm/Appointments/AppointmentTime';

import Details
    from '../../../organisms/Crm/Appointments/Edit/Details';

import RescheduleModal
    from '../../../molecules/Crm/Appointments/RescheduleModal';


import {
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    getAppointmentDetail,
    rescheduleAppointment
} from '../../../../api/appointments';


export default function AppointmentEditControl() {

    /*
     * ============================================================
     * PARAMS
     * ============================================================
     */

    const {
        id
    } = useParams<{
        id: string;
    }>();


    const appointmentId =
        Number(id);


    const queryClient =
        useQueryClient();


    /*
     * ============================================================
     * STATE
     * ============================================================
     */

    const [
        showReschedule,
        setShowReschedule
    ] = useState(false);


    /*
     * ============================================================
     * GET APPOINTMENT
     * ============================================================
     */

    const {
        data,
        isLoading,
        error
    } = useQuery({

        queryKey: [
            'appointment',
            appointmentId
        ],

        queryFn: () =>
            getAppointmentDetail(
                appointmentId
            ),

        enabled:
            Number.isInteger(
                appointmentId
            ) &&
            appointmentId > 0,

        retry: false
    });


    const appointment =
        data?.data;


    /*
     * ============================================================
     * REFRESH
     * ============================================================
     */

    const refresh = () => {

        queryClient.invalidateQueries({
            queryKey: [
                'appointment',
                appointmentId
            ]
        });


        queryClient.invalidateQueries({
            queryKey: [
                'appointments'
            ]
        });

    };


    /*
     * ============================================================
     * CONFIRM
     * ============================================================
     */

    const confirmMutation =
        useMutation({

            mutationFn: () =>
                confirmAppointment(
                    appointmentId
                ),

            onSuccess: () => {
                refresh();
            }

        });


    /*
     * ============================================================
     * COMPLETE
     * ============================================================
     */

    const completeMutation =
        useMutation({

            mutationFn: () =>
                completeAppointment(
                    appointmentId
                ),

            onSuccess: () => {
                refresh();
            }

        });


    /*
     * ============================================================
     * CANCEL
     * ============================================================
     */

    const cancelMutation =
        useMutation({

            mutationFn: () =>
                cancelAppointment(
                    appointmentId
                ),

            onSuccess: () => {
                refresh();
            }

        });


    /*
     * ============================================================
     * RESCHEDULE
     * ============================================================
     */

    const rescheduleMutation =
        useMutation({

            mutationFn: (
                startAt: string
            ) =>
                rescheduleAppointment(
                    appointmentId,
                    startAt
                ),

            onSuccess: () => {

                setShowReschedule(
                    false
                );

                refresh();
            }

        });


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (isLoading) {

        return (
            <div
                className="
                    flex
                    min-h-[400px]
                    items-center
                    justify-center
                    text-sm
                    text-slate-500
                "
            >
                Загрузка записи...
            </div>
        );
    }


    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    if (
        error ||
        !appointment
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[400px]
                    items-center
                    justify-center
                    text-sm
                    text-red-500
                "
            >
                Не удалось загрузить запись.
            </div>
        );
    }


    /*
     * ============================================================
     * DATE / TIME
     * ============================================================
     */

    const startDate =
        new Date(
            appointment.start_at
        );


    const endDate =
        new Date(
            appointment.end_at
        );


    const formatDate =
        format(
            startDate,
            'd MMMM yyyy',
            {
                locale: ru
            }
        );


    const formatTimeFrom =
        format(
            startDate,
            'HH:mm'
        );


    const formatTimeTo =
        format(
            endDate,
            'HH:mm'
        );


    /*
     * Полная длительность записи.
     *
     * Например:
     * 12:30 → 14:37
     *
     * = 127 минут
     *
     * В эту продолжительность уже входят
     * выбранные дополнительные услуги.
     */
    const durationMinutes =
        Math.max(
            0,
            Math.round(
                (
                    endDate.getTime() -
                    startDate.getTime()
                ) /
                60000
            )
        );


    /*
     * ============================================================
     * MUTATIONS STATE
     * ============================================================
     */

    const actionPending =
        confirmMutation.isPending ||
        completeMutation.isPending ||
        cancelMutation.isPending;


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <>

            <div
                className="
                    grid
                    grid-cols-1
                    items-start
                    gap-5
                    xl:grid-cols-[minmax(0,1fr)_300px]
                "
            >

                {/* ==================================================
                    LEFT COLUMN
                ================================================== */}

                <div
                    className="
                        flex
                        min-w-0
                        flex-col
                        gap-5
                    "
                >

                    {/* ==============================================
                        CLIENT
                    ============================================== */}

                    <ClientInfo
                        name={
                            appointment.client_first_name
                        }
                        last_name={
                            appointment.client_last_name ||
                            ''
                        }
                        phone_num={
                            appointment.client_phone
                        }
                        client_ltv={
                            appointment.client_ltv
                        }
                        client_total_visit={
                            appointment.client_total_visits
                        }
                    />


                    {/* ==============================================
                        SERVICE + ADDONS
                    ============================================== */}

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
                            appointment.addons ||
                            []
                        }
                    />


                    {/* ==============================================
                        TIME + STAFF
                    ============================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                        "
                    >

                        <AppointmentTime
                            date={
                                formatDate
                            }
                            timeFrom={
                                formatTimeFrom
                            }
                            timeTo={
                                formatTimeTo
                            }
                        />


                        <AppointmentStaff
                            firstName={
                                appointment.staff_first_name
                            }
                            lastName={
                                appointment.staff_last_name
                            }
                            position={
                                appointment.staff_position
                            }
                        />

                    </div>


                    {/* ==============================================
                        COMMENT
                    ============================================== */}

                    <AppointmentComment
                        comment={
                            appointment.comment
                        }
                    />

                </div>


                {/* ==================================================
                    RIGHT COLUMN
                ================================================== */}

                <div
                    className="
                        flex
                        flex-col
                        gap-5
                    "
                >

                    <AppointmentManagement
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
                            setShowReschedule(
                                true
                            )
                        }
                    />

                </div>

            </div>


            {/* ======================================================
                RESCHEDULE MODAL
            ====================================================== */}

            {showReschedule && (

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
                        setShowReschedule(
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

        </>
    );
}
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

import {
    ru
} from 'date-fns/locale';


import ClientInfo from '../../../molecules/Crm/Appointments/ClientInfo';

import AppointmentManagement from '../../../molecules/Crm/Appointments/AppointmentManagement';

import AppointmentComment from '../../../molecules/Crm/Appointments/AppointmentComment';

import AppointmentStaff from '../../../molecules/Crm/Appointments/AppointmentStaff';

import RescheduleModal from '../../../molecules/Crm/Appointments/RescheduleModal';

import Details from '../../../organisms/Crm/Appointments/Edit/Details';


import {
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    getAppointmentDetail,
    rescheduleAppointment
} from '../../../../api/appointments';


export default function AppointmentEditControl() {

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
            Number.isFinite(
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

            onSuccess:
                refresh
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

            onSuccess:
                refresh
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

            onSuccess:
                refresh
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
                    min-h-[300px]
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
                    min-h-[300px]
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
     * DATE
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
     * Полная продолжительность записи.
     *
     * Берётся из start_at / end_at,
     * поэтому сюда уже входит время
     * дополнительных услуг.
     */
    const duration =
        intervalToDuration({
            start: startDate,
            end: endDate
        });


    /*
     * ============================================================
     * MUTATION STATE
     * ============================================================
     */

    const actionPending =
        confirmMutation.isPending ||
        completeMutation.isPending ||
        cancelMutation.isPending ||
        rescheduleMutation.isPending;


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-6
            "
        >

            {/* ==================================================
                DETAILS
            ================================================== */}

            <Details
                service_name={
                    appointment.service_name
                }
                description={
                    appointment.service_description
                }
                duration={
                    duration
                }
                price={
                    appointment.price
                }
                format_date={
                    formatDate
                }
                format_time_from={
                    formatTimeFrom
                }
                format_time_to={
                    formatTimeTo
                }
                addons={
                    appointment.addons || []
                }
            />


            {/* ==================================================
                APPOINTMENT MANAGEMENT
            ================================================== */}

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


            {/* ==================================================
                CLIENT + STAFF
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-6
                    xl:grid-cols-2
                "
            >

                <ClientInfo
                    name={
                        appointment.client_first_name
                    }
                    last_name={
                        appointment.client_last_name || ''
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


            {/* ==================================================
                COMMENT
            ================================================== */}

            <AppointmentComment
                comment={
                    appointment.comment
                }
            />


            {/* ==================================================
                RESCHEDULE MODAL
            ================================================== */}

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

        </div>
    );
}
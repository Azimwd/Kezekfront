import {
    useEffect,
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


import ClientInfo from '../../../molecules/Crm/Appointments/ClientInfo';

import AppointmentManagement from '../../../molecules/Crm/Appointments/AppointmentManagement';

import AppointmentComment from '../../../molecules/Crm/Appointments/AppointmentComment';

import AppointmentStaff from '../../../molecules/Crm/Appointments/AppointmentStaff';

import RescheduleModal from '../../../molecules/Crm/Appointments/RescheduleModal';


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


    const [
        selectedDate,
        setSelectedDate
    ] = useState('');


    const [
        selectedTime,
        setSelectedTime
    ] = useState('');


    /*
     * Пока пример.
     *
     * После подключим сюда твой
     * AvailableSlotsView.
     */
    const [
        availableSlots
    ] = useState<string[]>([
        '09:00',
        '10:30',
        '11:00',
        '14:00',
        '15:30',
        '16:00'
    ]);


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
            ),

        retry: false
    });


    const appointment =
        data?.data;


    useEffect(() => {

        if (
            !appointment?.start_at
        ) {
            return;
        }


        const date =
            new Date(
                appointment.start_at
            );


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                '0'
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                '0'
            );


        setSelectedDate(
            `${year}-${month}-${day}`
        );

    }, [
        appointment?.start_at
    ]);


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


    const confirmMutation =
        useMutation({

            mutationFn: () =>
                confirmAppointment(
                    appointmentId
                ),

            onSuccess:
                refresh
        });


    const completeMutation =
        useMutation({

            mutationFn: () =>
                completeAppointment(
                    appointmentId
                ),

            onSuccess:
                refresh
        });


    const cancelMutation =
        useMutation({

            mutationFn: () =>
                cancelAppointment(
                    appointmentId
                ),

            onSuccess:
                refresh
        });


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

                setSelectedTime(
                    ''
                );

                refresh();
            }
        });


    const handleReschedule = () => {

        if (
            !selectedDate ||
            !selectedTime
        ) {
            return;
        }


        const date =
            new Date(
                `${selectedDate}T${selectedTime}:00`
            );


        rescheduleMutation.mutate(
            date.toISOString()
        );
    };


    if (isLoading) {
        return (
            <div className="py-16 text-center text-slate-500">
                Загрузка записи...
            </div>
        );
    }


    if (
        error ||
        !appointment
    ) {
        return (
            <div className="py-16 text-center text-red-500">
                Не удалось загрузить запись.
            </div>
        );
    }


    const actionPending =
        confirmMutation.isPending ||
        completeMutation.isPending ||
        cancelMutation.isPending;


    return (
        <div
            className="
                flex
                flex-col
                gap-6
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
                    appointment.client_total_visit
                }
            />


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


            <AppointmentComment
                comment={
                    appointment.comment
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
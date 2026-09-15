import {
    ChevronRight
} from 'lucide-react';

import {
    addDays,
    format
} from 'date-fns';

import {
    ru
} from 'date-fns/locale';

import {
    useNavigate
} from 'react-router-dom';

import {
    getAppointmentClientName,
    getAppointmentStaffName,
    type DashboardAppointment
} from '../../../../api/dashboard';


interface TomorrowCardProps {
    appointments: DashboardAppointment[];
}


export default function TomorrowCard({
    appointments
}: TomorrowCardProps) {
    const navigate =
        useNavigate();


    const tomorrow =
        addDays(
            new Date(),
            1
        );


    const tomorrowTitle =
        format(
            tomorrow,
            'd MMMM',
            {
                locale: ru
            }
        );


    const visibleAppointments =
        appointments
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        a.start_at
                    ).getTime() -
                    new Date(
                        b.start_at
                    ).getTime()
            )
            .slice(
                0,
                3
            );


    return (
        <div
            className="
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-[#D9DDEC]
                bg-white
                shadow-sm
            "
        >
            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/crm/appointments'
                    )
                }
                className="
                    flex
                    min-h-[50px]
                    w-full
                    min-w-0
                    cursor-pointer
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-[#EAECF0]
                    px-3.5
                    py-3.5
                    text-left
                    transition
                    hover:bg-[#F9FAFB]

                    sm:px-4
                "
            >
                <span
                    className="
                        min-w-0
                        break-words
                        text-[13px]
                        font-semibold
                        capitalize
                        leading-5
                        text-[#344054]
                    "
                >
                    Завтра, {tomorrowTitle}
                </span>


                <ChevronRight
                    size={17}
                    className="
                        shrink-0
                        text-[#4F46E5]
                    "
                />
            </button>


            <div
                className="
                    p-3.5

                    sm:p-4
                "
            >
                {visibleAppointments.length === 0 ? (
                    <div
                        className="
                            flex
                            min-h-[90px]
                            items-center
                            justify-center
                            px-2
                            text-center
                            text-[12px]
                            leading-5
                            text-[#98A2B3]
                        "
                    >
                        На завтра записей нет
                    </div>
                ) : (
                    <div
                        className="
                            flex
                            min-w-0
                            flex-col
                            gap-2

                            sm:gap-3
                        "
                    >
                        {visibleAppointments.map(
                            appointment => {
                                const clientName =
                                    getAppointmentClientName(
                                        appointment
                                    );


                                const staffName =
                                    getAppointmentStaffName(
                                        appointment
                                    );


                                const serviceName =
                                    appointment.service_name ??
                                    `Услуга #${appointment.service}`;


                                return (
                                    <button
                                        key={appointment.id}
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/crm/appointments/${appointment.id}`
                                            )
                                        }
                                        className="
                                            group
                                            grid
                                            w-full
                                            min-w-0
                                            grid-cols-[46px_minmax(0,1fr)]
                                            gap-2.5
                                            rounded-xl
                                            p-2.5
                                            text-left
                                            transition
                                            hover:bg-[#F9FAFB]

                                            sm:grid-cols-[54px_minmax(0,1fr)]
                                            sm:gap-3
                                        "
                                    >
                                        <div
                                            className="
                                                pt-0.5
                                                text-[12px]
                                                font-semibold
                                                text-[#667085]
                                            "
                                        >
                                            {
                                                format(
                                                    new Date(
                                                        appointment.start_at
                                                    ),
                                                    'HH:mm'
                                                )
                                            }
                                        </div>


                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >
                                            <div
                                                className="
                                                    truncate
                                                    text-[13px]
                                                    font-semibold
                                                    text-[#344054]
                                                    transition
                                                    group-hover:text-[#4F46E5]
                                                "
                                            >
                                                {clientName}
                                            </div>


                                            <div
                                                className="
                                                    mt-1
                                                    truncate
                                                    text-[11px]
                                                    text-[#98A2B3]
                                                "
                                            >
                                                {serviceName}

                                                {staffName !== '—' && (
                                                    <>
                                                        {' · '}
                                                        {staffName}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>
                )}
            </div>


            {appointments.length > 3 && (
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/appointments'
                        )
                    }
                    className="
                        w-full
                        cursor-pointer
                        border-t
                        border-[#EAECF0]
                        px-3
                        py-3
                        text-[12px]
                        font-medium
                        text-[#4F46E5]
                        transition
                        hover:bg-[#F9FAFB]
                    "
                >
                    Показать все записи ({appointments.length})
                </button>
            )}
        </div>
    );
}

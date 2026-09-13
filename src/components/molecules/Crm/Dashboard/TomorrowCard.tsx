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


    /*
     * ============================================================
     * ЗАВТРАШНЯЯ ДАТА
     * ============================================================
     */

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


    /*
     * ============================================================
     * СОРТИРОВКА ЗАПИСЕЙ
     * ============================================================
     */

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


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[#D9DDEC]
                bg-white
                shadow-sm
            "
        >

            {/* HEADER */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/crm/appointments'
                    )
                }
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-[#EAECF0]
                    px-4
                    py-3.5
                    text-left
                    transition
                    hover:bg-[#F9FAFB]
                "
            >

                <span
                    className="
                        text-[13px]
                        font-semibold
                        capitalize
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


            {/* CONTENT */}

            <div
                className="
                    p-4
                "
            >

                {visibleAppointments.length === 0 ? (

                    <div
                        className="
                            flex
                            min-h-[90px]
                            items-center
                            justify-center
                            text-center
                            text-[12px]
                            text-[#98A2B3]
                        "
                    >
                        На завтра записей нет
                    </div>

                ) : (

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
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
                                        key={
                                            appointment.id
                                        }
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
                                            grid-cols-[54px_minmax(0,1fr)]
                                            gap-3
                                            rounded-xl
                                            p-2
                                            text-left
                                            transition
                                            hover:bg-[#F9FAFB]
                                        "
                                    >

                                        {/* TIME */}

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


                                        {/* INFO */}

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


            {/* FOOTER */}

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
                        border-t
                        border-[#EAECF0]
                        py-3
                        text-[12px]
                        font-medium
                        text-[#4F46E5]
                        transition
                        hover:bg-[#F9FAFB]
                    "
                >
                    Показать все записи
                    {' '}
                    ({appointments.length})
                </button>

            )}

        </div>
    );
}
import {
    useMemo
} from 'react';

import {
    addDays,
    format,
    subDays
} from 'date-fns';

import {
    ru
} from 'date-fns/locale';

import type {
    DashboardAppointment
} from '../../../../api/dashboard';


interface AppointmentsChartProps {
    appointments:
        DashboardAppointment[];

    revenue: number;
}


export default function AppointmentsChart({
    appointments,
    revenue
}: AppointmentsChartProps) {

    const chartData =
        useMemo(
            () => {

                const startDate =
                    subDays(
                        new Date(),
                        6
                    );


                return Array.from(
                    {
                        length: 7
                    },
                    (
                        _,
                        index
                    ) => {

                        const date =
                            addDays(
                                startDate,
                                index
                            );


                        const dateKey =
                            format(
                                date,
                                'yyyy-MM-dd'
                            );


                        const value =
                            appointments.filter(
                                appointment => {

                                    const appointmentDate =
                                        format(
                                            new Date(
                                                appointment.start_at
                                            ),
                                            'yyyy-MM-dd'
                                        );


                                    return (
                                        appointmentDate ===
                                        dateKey
                                    );

                                }
                            ).length;


                        return {

                            key:
                                dateKey,

                            day:
                                format(
                                    date,
                                    'EE',
                                    {
                                        locale: ru
                                    }
                                ),

                            value
                        };
                    }
                );

            },
            [
                appointments
            ]
        );


    const maxValue =
        Math.max(
            ...chartData.map(
                item =>
                    item.value
            ),
            1
        );


    return (
        <div
            className="
                min-h-[220px]
                rounded-2xl
                border
                border-[#D9DDEC]
                bg-white
                p-5
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <div
                        className="
                            text-[17px]
                            font-semibold
                            text-[#101828]
                        "
                    >
                        Динамика записей
                    </div>


                    <div
                        className="
                            mt-1
                            text-[11px]
                            text-[#98A2B3]
                        "
                    >
                        Последние 7 дней
                    </div>

                </div>


                <div
                    className="
                        text-right
                    "
                >

                    <div
                        className="
                            text-[10px]
                            text-[#98A2B3]
                        "
                    >
                        Доход за 7 дн.
                    </div>


                    <div
                        className="
                            mt-1
                            whitespace-nowrap
                            text-[18px]
                            font-bold
                            text-[#4F46E5]
                        "
                    >
                        {
                            revenue.toLocaleString(
                                'ru-RU'
                            )
                        } ₸
                    </div>

                </div>

            </div>


            <div
                className="
                    mt-5
                    flex
                    h-[130px]
                    items-end
                    gap-3
                    border-b
                    border-dashed
                    border-[#E5E7EB]
                "
            >

                {chartData.map(
                    (
                        item,
                        index
                    ) => {

                        const height =
                            item.value === 0
                                ? 6
                                : Math.max(
                                    (
                                        item.value /
                                        maxValue
                                    ) * 95,
                                    14
                                );


                        return (
                            <div
                                key={
                                    item.key
                                }
                                className="
                                    flex
                                    flex-1
                                    flex-col
                                    items-center
                                    justify-end
                                "
                            >

                                <div
                                    style={{
                                        height:
                                            `${height}px`
                                    }}
                                    title={
                                        `${item.value} записей`
                                    }
                                    className={`
                                        w-full
                                        max-w-[54px]
                                        rounded-t-md
                                        transition-all
                                        duration-300

                                        ${
                                            index ===
                                            chartData.length - 1
                                                ? 'bg-[#4F46E5]'
                                                : 'bg-[#D9E6FF]'
                                        }
                                    `}
                                />


                                <span
                                    className="
                                        mt-2
                                        text-[11px]
                                        capitalize
                                        text-[#98A2B3]
                                    "
                                >
                                    {item.day}
                                </span>

                            </div>
                        );
                    }
                )}

            </div>

        </div>
    );
}
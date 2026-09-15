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
    appointments: DashboardAppointment[];
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
                            key: dateKey,
                            day: format(
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
                item => item.value
            ),
            1
        );


    return (
        <div
            className="
                w-full
                min-w-0
                min-h-[210px]
                overflow-hidden
                rounded-2xl
                border
                border-[#D9DDEC]
                bg-white
                p-4
                shadow-sm

                sm:min-h-[220px]
                sm:p-5
            "
        >
            <div
                className="
                    flex
                    min-w-0
                    flex-col
                    gap-3

                    min-[390px]:flex-row
                    min-[390px]:items-start
                    min-[390px]:justify-between
                    min-[390px]:gap-4
                "
            >
                <div
                    className="
                        min-w-0
                    "
                >
                    <div
                        className="
                            text-[16px]
                            font-semibold
                            text-[#101828]

                            sm:text-[17px]
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
                        min-w-0
                        text-left

                        min-[390px]:text-right
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
                            break-words
                            text-[17px]
                            font-bold
                            text-[#4F46E5]

                            sm:text-[18px]
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
                    h-[120px]
                    min-w-0
                    items-end
                    gap-1.5
                    border-b
                    border-dashed
                    border-[#E5E7EB]

                    sm:h-[130px]
                    sm:gap-3
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
                                key={item.key}
                                className="
                                    flex
                                    min-w-0
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
                                        truncate
                                        text-[10px]
                                        capitalize
                                        text-[#98A2B3]

                                        sm:text-[11px]
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

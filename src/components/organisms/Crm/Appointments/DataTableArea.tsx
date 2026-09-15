import {
    useQuery
} from '@tanstack/react-query';

import {
    Calendar,
    CheckCircle,
    CheckCircle2,
    ClipboardList
} from 'lucide-react';

import {
    getAllAppointments
} from '../../../../api/appointments';

import {
    useBusiness
} from '../../../../context/BusinessContext';


export default function DataTableArea() {

    const {
        selectedBusiness
    } = useBusiness();


    const businessId =
        selectedBusiness?.id;


    /*
     * ============================================================
     * APPOINTMENTS
     * ============================================================
     */

    const {
        data: appointmentsResponse,
        isPending
    } = useQuery({

        queryKey: [
            'appointments',
            businessId
        ],

        queryFn: () =>
            getAllAppointments(
                Number(
                    businessId
                )
            ),

        enabled:
            !!businessId
    });


    /*
     * ============================================================
     * SUMMARY
     * ============================================================
     */

    const summary =
        appointmentsResponse?.summary || {
            today_count: 0,
            pending_count: 0,
            confirmed_count: 0,
            completed_count: 0
        };


    /*
     * ============================================================
     * CARDS
     * ============================================================
     */

    const statsCards = [
        {
            title: 'Сегодня',
            icon: Calendar,
            iconColor:
                'text-[#4031d0]',
            iconBg:
                'bg-[#EEF2FF]',
            topBarColor:
                null,
            value:
                summary.today_count,
            description:
                'записей'
        },

        {
            title: 'Ожидают',
            icon: ClipboardList,
            iconColor:
                'text-amber-500',
            iconBg:
                'bg-amber-50',
            topBarColor:
                'bg-amber-500',
            value:
                summary.pending_count,
            description:
                'требуют внимания'
        },

        {
            title: 'Подтверждены',
            icon: CheckCircle2,
            iconColor:
                'text-[#4031d0]',
            iconBg:
                'bg-[#EEF2FF]',
            topBarColor:
                'bg-[#4031d0]',
            value:
                summary.confirmed_count,
            description:
                'запланировано'
        },

        {
            title: 'Завершены',
            icon: CheckCircle,
            iconColor:
                'text-emerald-500',
            iconBg:
                'bg-emerald-50',
            topBarColor:
                'bg-emerald-500',
            value:
                summary.completed_count,
            description:
                'успешно'
        }
    ];


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
                min-w-0
                flex-col
                gap-6

                sm:gap-8

                lg:gap-10
            "
        >

            <div
                className="
                    w-full
                    min-w-0
                "
            >

                {isPending ? (

                    /*
                     * =================================================
                     * LOADING
                     * =================================================
                     */

                    <div
                        className="
                            flex
                            h-32
                            w-full
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-[#c7c4d8]
                            bg-white
                            p-4

                            sm:h-40
                            sm:p-6
                        "
                    >
                        <span
                            className="
                                animate-pulse
                                text-sm
                                font-medium
                                text-slate-500

                                sm:text-base
                            "
                        >
                            Загрузка записей...
                        </span>
                    </div>

                ) : (

                    /*
                     * =================================================
                     * STATS
                     * =================================================
                     */

                    <div
                        className="
                            grid
                            w-full
                            min-w-0
                            grid-cols-1
                            gap-3

                            sm:grid-cols-2
                            sm:gap-4

                            lg:grid-cols-4
                            lg:gap-5

                            xl:gap-6
                        "
                    >

                        {statsCards.map(
                            (
                                card,
                                index
                            ) => {

                                const IconComponent =
                                    card.icon;


                                return (
                                    <div
                                        key={
                                            index
                                        }
                                        className="
                                            relative
                                            flex
                                            min-h-[120px]
                                            min-w-0
                                            flex-col
                                            justify-between
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-[#c7c4d8]
                                            bg-white
                                            p-4
                                            shadow-sm

                                            sm:min-h-[135px]
                                            sm:p-5

                                            xl:p-6
                                        "
                                    >

                                        {/* =================================
                                            TOP COLOR BAR
                                        ================================= */}

                                        {card.topBarColor && (

                                            <div
                                                className={`
                                                    absolute
                                                    left-0
                                                    right-0
                                                    top-0
                                                    h-[4px]

                                                    ${
                                                        card.topBarColor
                                                    }
                                                `}
                                            />

                                        )}


                                        {/* =================================
                                            TITLE + ICON
                                        ================================= */}

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                items-start
                                                justify-between
                                                gap-3
                                            "
                                        >

                                            <span
                                                className="
                                                    min-w-0
                                                    text-[13px]
                                                    font-semibold
                                                    leading-5
                                                    text-slate-600

                                                    sm:text-sm
                                                "
                                            >
                                                {
                                                    card.title
                                                }
                                            </span>


                                            <div
                                                className={`
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl

                                                    ${
                                                        card.iconBg
                                                    }
                                                `}
                                            >
                                                <IconComponent
                                                    className={`
                                                        h-[18px]
                                                        w-[18px]

                                                        ${
                                                            card.iconColor
                                                        }
                                                    `}
                                                />
                                            </div>

                                        </div>


                                        {/* =================================
                                            VALUE
                                        ================================= */}

                                        <div
                                            className="
                                                mt-3
                                            "
                                        >

                                            <div
                                                className="
                                                    text-[32px]
                                                    font-bold
                                                    leading-none
                                                    text-slate-900

                                                    sm:text-4xl
                                                "
                                            >
                                                {
                                                    card.value
                                                }
                                            </div>


                                            <div
                                                className="
                                                    mt-2
                                                    text-[11px]
                                                    font-medium
                                                    leading-4
                                                    text-slate-500

                                                    sm:text-xs
                                                "
                                            >
                                                {
                                                    card.description
                                                }
                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}
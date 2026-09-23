import {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import {
    addDays,
    format,
    startOfDay,
    subDays
} from 'date-fns';

import {
    BriefcaseBusiness,
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Percent,
    Scissors,
    UserRound,
    UsersRound
} from 'lucide-react';


import {
    useBusiness
} from '../../../../context/BusinessContext';


import {
    listAllBusinesses
} from '../../../../api/businesses';


import {
    getAppointmentPrice,
    getDashboardBusiness,
    getDashboardData,
    type DashboardAppointment
} from '../../../../api/dashboard';


import {
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    confirmAppointmentPrepayment
} from '../../../../api/appointments';


import StatCard
    from '../../../molecules/Crm/Dashboard/StatCard';

import MiniStatCard
    from '../../../molecules/Crm/Dashboard/MiniStatCard';

import AppointmentsChart
    from '../../../molecules/Crm/Dashboard/AppointmentsChart';

import TodayAppointments
    from '../../../molecules/Crm/Dashboard/TodayAppointments';

import AttentionCard
    from '../../../molecules/Crm/Dashboard/AttentionCard';

import QuickActions
    from '../../../molecules/Crm/Dashboard/QuickActions';

import TomorrowCard
    from '../../../molecules/Crm/Dashboard/TomorrowCard';


export default function DashboardControl() {

    /*
     * ============================================================
     * QUERY CLIENT
     * ============================================================
     */

    const queryClient =
        useQueryClient();


    /*
     * ============================================================
     * BUSINESS CONTEXT
     * ============================================================
     */

    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    /*
     * ============================================================
     * BUSINESS DROPDOWN
     * ============================================================
     */

    const [
        isBusinessMenuOpen,
        setIsBusinessMenuOpen
    ] = useState(
        false
    );


    const businessMenuRef =
        useRef<HTMLDivElement | null>(
            null
        );


    /*
     * ============================================================
     * ALL BUSINESSES
     * ============================================================
     */

    const {
        data: businesses = [],
        isLoading: isBusinessesLoading
    } = useQuery({

        queryKey: [
            'all-businesses'
        ],

        queryFn:
            listAllBusinesses,

        retry:
            false
    });


    /*
     * ============================================================
     * AUTO SELECT BUSINESS
     * ============================================================
     */

    useEffect(
        () => {

            if (
                businesses.length === 0
            ) {
                return;
            }


            const selectedExists =
                selectedBusiness
                    ? businesses.some(
                        business =>
                            String(
                                business.id
                            ) ===
                            String(
                                selectedBusiness.id
                            )
                    )
                    : false;


            if (
                !selectedExists
            ) {

                const firstBusiness =
                    businesses[0];


                setSelectedBusiness({
                    id:
                        firstBusiness.id,

                    label:
                        firstBusiness.name
                });
            }

        },
        [
            businesses,
            selectedBusiness,
            setSelectedBusiness
        ]
    );


    /*
     * ============================================================
     * CLICK OUTSIDE BUSINESS MENU
     * ============================================================
     */

    useEffect(
        () => {

            const handleClickOutside =
                (
                    event: MouseEvent
                ) => {

                    if (
                        businessMenuRef.current &&
                        !businessMenuRef.current.contains(
                            event.target as Node
                        )
                    ) {
                        setIsBusinessMenuOpen(
                            false
                        );
                    }
                };


            document.addEventListener(
                'mousedown',
                handleClickOutside
            );


            return () => {

                document.removeEventListener(
                    'mousedown',
                    handleClickOutside
                );
            };

        },
        []
    );


    /*
     * ============================================================
     * CURRENT BUSINESS ID
     * ============================================================
     */

    const businessId =
        selectedBusiness?.id
            ? Number(
                selectedBusiness.id
            )
            : null;


    /*
     * ============================================================
     * ACTION LOADING
     * ============================================================
     */

    const [
        actionLoadingId,
        setActionLoadingId
    ] = useState<number | null>(
        null
    );


    /*
     * ============================================================
     * DASHBOARD DATA
     * ============================================================
     */

    const {
        data: dashboardData,
        isLoading: isDashboardLoading
    } = useQuery({

        queryKey: [
            'dashboard-data',
            businessId
        ],

        queryFn: () =>
            getDashboardData(
                businessId!
            ),

        enabled:
            !!businessId
    });


    /*
     * ============================================================
     * BUSINESS DETAIL
     * ============================================================
     */

    const {
        data: business
    } = useQuery({

        queryKey: [
            'dashboard-business',
            businessId
        ],

        queryFn: () =>
            getDashboardBusiness(
                businessId!
            ),

        enabled:
            !!businessId
    });


    /*
     * ============================================================
     * SELECT BUSINESS
     * ============================================================
     */

    const handleSelectBusiness =
        (
            id: number | string,
            name: string
        ) => {

            setSelectedBusiness({
                id,
                label:
                    name
            });


            setIsBusinessMenuOpen(
                false
            );
        };


    /*
     * ============================================================
     * REFRESH
     * ============================================================
     */

    const refreshDashboard =
        async () => {

            await Promise.all([

                queryClient.invalidateQueries({
                    queryKey: [
                        'dashboard-data',
                        businessId
                    ]
                }),

                queryClient.invalidateQueries({
                    queryKey: [
                        'dashboard-business',
                        businessId
                    ]
                }),

                queryClient.invalidateQueries({
                    queryKey: [
                        'appointments'
                    ]
                })

            ]);
        };


    /*
     * ============================================================
     * CONFIRM
     * ============================================================
     */

    const confirmMutation =
        useMutation({

            mutationFn: (
                appointmentId: number
            ) =>
                confirmAppointment(
                    appointmentId
                ),

            onMutate: (
                appointmentId
            ) => {

                setActionLoadingId(
                    appointmentId
                );
            },

            onSuccess:
                refreshDashboard,

            onSettled: () => {

                setActionLoadingId(
                    null
                );
            }
        });


    const confirmPrepaymentMutation =
        useMutation({

            mutationFn: (
                appointmentId: number
            ) =>
                confirmAppointmentPrepayment(
                    appointmentId
                ),

            onMutate: (
                appointmentId
            ) => {

                setActionLoadingId(
                    appointmentId
                );
            },

            onSuccess:
                refreshDashboard,

            onSettled: () => {

                setActionLoadingId(
                    null
                );
            }
        });


    /*
     * ============================================================
     * COMPLETE
     * ============================================================
     */

    const completeMutation =
        useMutation({

            mutationFn: (
                appointmentId: number
            ) =>
                completeAppointment(
                    appointmentId
                ),

            onMutate: (
                appointmentId
            ) => {

                setActionLoadingId(
                    appointmentId
                );
            },

            onSuccess:
                refreshDashboard,

            onSettled: () => {

                setActionLoadingId(
                    null
                );
            }
        });


    /*
     * ============================================================
     * CANCEL
     * ============================================================
     */

    const cancelMutation =
        useMutation({

            mutationFn: (
                appointmentId: number
            ) =>
                cancelAppointment(
                    appointmentId
                ),

            onMutate: (
                appointmentId
            ) => {

                setActionLoadingId(
                    appointmentId
                );
            },

            onSuccess:
                refreshDashboard,

            onSettled: () => {

                setActionLoadingId(
                    null
                );
            }
        });


    /*
     * ============================================================
     * ALL APPOINTMENTS
     * ============================================================
     */

    const appointments =
        useMemo<DashboardAppointment[]>(
            () =>
                dashboardData?.data ??
                [],
            [
                dashboardData
            ]
        );


    const handleConfirmAppointment = (
        appointmentId: number
    ) => {

        const appointment =
            appointments.find(
                item =>
                    item.id ===
                    appointmentId
            ) as any;

        if (
            appointment?.prepayment?.status ===
            'pending'
        ) {
            confirmPrepaymentMutation.mutate(
                appointmentId
            );
            return;
        }

        confirmMutation.mutate(
            appointmentId
        );
    };


    /*
     * ============================================================
     * DATES
     * ============================================================
     */

    const todayKey =
        format(
            new Date(),
            'yyyy-MM-dd'
        );


    const tomorrowKey =
        format(
            addDays(
                new Date(),
                1
            ),
            'yyyy-MM-dd'
        );


    const sevenDaysAgo =
        startOfDay(
            subDays(
                new Date(),
                6
            )
        );


    /*
     * ============================================================
     * TODAY
     * ============================================================
     */

    const todayAppointments =
        useMemo(
            () => {

                return appointments.filter(
                    appointment => {

                        return (
                            format(
                                new Date(
                                    appointment.start_at
                                ),
                                'yyyy-MM-dd'
                            ) ===
                            todayKey
                        );
                    }
                );

            },
            [
                appointments,
                todayKey
            ]
        );


    /*
     * ============================================================
     * TOMORROW
     * ============================================================
     */

    const tomorrowAppointments =
        useMemo(
            () => {

                return appointments.filter(
                    appointment => {

                        return (
                            format(
                                new Date(
                                    appointment.start_at
                                ),
                                'yyyy-MM-dd'
                            ) ===
                            tomorrowKey
                        );
                    }
                );

            },
            [
                appointments,
                tomorrowKey
            ]
        );


    /*
     * ============================================================
     * LAST 7 DAYS
     * ============================================================
     */

    const last7Appointments =
        useMemo(
            () => {

                return appointments.filter(
                    appointment => {

                        const appointmentDate =
                            new Date(
                                appointment.start_at
                            );


                        return (
                            appointmentDate >=
                            sevenDaysAgo
                        );
                    }
                );

            },
            [
                appointments,
                sevenDaysAgo
            ]
        );


    /*
     * ============================================================
     * LAST 7 DAYS REVENUE
     * ============================================================
     */

    const last7Revenue =
        useMemo(
            () => {

                return last7Appointments
                    .filter(
                        appointment =>
                            appointment.status ===
                            'completed'
                    )
                    .reduce(
                        (
                            total,
                            appointment
                        ) =>
                            total +
                            getAppointmentPrice(
                                appointment
                            ),
                        0
                    );

            },
            [
                last7Appointments
            ]
        );


    /*
     * ============================================================
     * CANCELLED LAST 7 DAYS
     * ============================================================
     */

    const cancelledWeek =
        useMemo(
            () => {

                return last7Appointments.filter(
                    appointment => {

                        return (
                            appointment.status ===
                                'cancelled' ||

                            appointment.status ===
                                'cancelled_by_client' ||

                            appointment.status ===
                                'cancelled_by_business'
                        );
                    }
                );

            },
            [
                last7Appointments
            ]
        );


    /*
     * ============================================================
     * CONVERSION
     * ============================================================
     */

    const completedForConversion =
        appointments.filter(
            appointment =>
                appointment.status ===
                'completed'
        ).length;


    const cancelledForConversion =
        appointments.filter(
            appointment =>

                appointment.status ===
                    'cancelled' ||

                appointment.status ===
                    'cancelled_by_client' ||

                appointment.status ===
                    'cancelled_by_business'
        ).length;


    const conversionBase =
        completedForConversion +
        cancelledForConversion;


    const conversion =
        conversionBase > 0
            ? Math.round(
                (
                    completedForConversion /
                    conversionBase
                ) * 100
            )
            : 0;


    /*
     * ============================================================
     * SUMMARY
     * ============================================================
     */

    const summary =
        dashboardData?.summary;


    const todayCount =
        summary?.today_count ??
        todayAppointments.length;


    const pendingCount =
        summary?.pending_count ??
        0;


    const confirmedCount =
        summary?.confirmed_count ??
        0;


    const completedCount =
        summary?.completed_count ??
        0;


    const completedRevenue =
        Number(
            summary?.completed_revenue ??
            0
        );


    const expectedRevenue =
        Number(
            summary?.expected_revenue ??
            0
        );


    /*
     * ============================================================
     * BUSINESS INFO
     * ============================================================
     */

    const businessName =
        business?.name ??
        selectedBusiness?.label ??
        'Бизнес';


    const businessLocation =
        [
            business?.city_name,
            business?.address
        ]
            .filter(
                Boolean
            )
            .join(
                ', '
            );


    /*
     * ============================================================
     * NO BUSINESSES
     * ============================================================
     */

    if (
        !isBusinessesLoading &&
        businesses.length === 0
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[500px]
                    items-center
                    justify-center
                    bg-[#F7F8FD]
                "
            >
                <div
                    className="
                        rounded-2xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        px-8
                        py-6
                        text-[14px]
                        text-[#667085]
                        shadow-sm
                    "
                >
                    У вас пока нет бизнесов
                </div>
            </div>
        );
    }


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div
            className="
                min-h-full
                min-w-0
                bg-[#F7F8FD]
                px-3
                py-4
                sm:px-4
                sm:py-5
                md:px-5
                xl:px-6
                xl:py-6
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    min-w-0
                    max-w-[1600px]
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        mb-4
                        flex
                        w-full
                        min-w-0
                        justify-end
                        sm:mb-6
                    "
                >

                    {/* =================================================
                        BUSINESS SELECT
                    ================================================= */}

                    <div
                        ref={businessMenuRef}
                        className="
                            relative
                            w-full
                            sm:w-[310px]
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                setIsBusinessMenuOpen(
                                    previous =>
                                        !previous
                                )
                            }
                            className={`
                                flex
                                min-h-[54px]
                                w-full
                                min-w-0
                                items-center
                                gap-2.5
                                sm:min-h-[58px]
                                sm:gap-3
                                rounded-2xl
                                border
                                bg-white
                                px-3.5
                                text-left
                                shadow-sm
                                transition

                                ${
                                    isBusinessMenuOpen
                                        ? `
                                            border-[#4F46E5]
                                            ring-2
                                            ring-[#4F46E5]/10
                                        `
                                        : `
                                            border-[#D9DDEC]
                                            hover:border-[#B9B5D3]
                                        `
                                }
                            `}
                        >

                            {/* ICON */}

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    sm:h-10
                                    sm:w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-[#E5E7EB]
                                    bg-[#F8FAFC]
                                "
                            >
                                <Scissors
                                    size={18}
                                    className="
                                        text-[#667085]
                                    "
                                />
                            </div>


                            {/* INFO */}

                            <div
                                className="
                                    min-w-0
                                    flex-1
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            truncate
                                            text-[13px]
                                            font-semibold
                                            text-[#101828]
                                        "
                                    >
                                        {businessName}
                                    </span>


                                    {business?.status ===
                                        'active' && (

                                        <span
                                            className="
                                                shrink-0
                                                rounded-md
                                                bg-[#ECFDF3]
                                                px-1.5
                                                py-0.5
                                                text-[9px]
                                                font-semibold
                                                text-[#16A34A]
                                            "
                                        >
                                            ACTIVE
                                        </span>

                                    )}

                                </div>


                                <div
                                    className="
                                        mt-1
                                        truncate
                                        text-[11px]
                                        text-[#667085]
                                    "
                                >
                                    {businessLocation ||
                                        'Выберите бизнес'
                                    }
                                </div>

                            </div>


                            {/* ARROW */}

                            <ChevronDown
                                size={17}
                                className={`
                                    shrink-0
                                    text-[#667085]
                                    transition-transform
                                    duration-200

                                    ${
                                        isBusinessMenuOpen
                                            ? 'rotate-180'
                                            : ''
                                    }
                                `}
                            />

                        </button>


                        {/* =================================================
                            DROPDOWN
                        ================================================= */}

                        {isBusinessMenuOpen && (

                            <div
                                className="
                                    absolute
                                    right-0
                                    top-[calc(100%+8px)]
                                    z-[100]
                                    w-full
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-[#D9DDEC]
                                    bg-white
                                    shadow-[0_14px_35px_rgba(15,23,42,0.12)]
                                "
                            >

                                {/* TITLE */}

                                <div
                                    className="
                                        border-b
                                        border-[#EAECF0]
                                        px-4
                                        py-3
                                    "
                                >

                                    <div
                                        className="
                                            text-[12px]
                                            font-semibold
                                            text-[#344054]
                                        "
                                    >
                                        Выберите бизнес
                                    </div>


                                    <div
                                        className="
                                            mt-0.5
                                            text-[10px]
                                            text-[#98A2B3]
                                        "
                                    >
                                        {businesses.length} бизнесов
                                    </div>

                                </div>


                                {/* BUSINESS LIST */}

                                <div
                                    className="
                                        max-h-[320px]
                                        overflow-y-auto
                                        p-2
                                    "
                                >

                                    {businesses.map(
                                        item => {

                                            const selected =
                                                String(
                                                    item.id
                                                ) ===
                                                String(
                                                    selectedBusiness?.id
                                                );


                                            const location =
                                                [
                                                    item.city_name,
                                                    item.address
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ');


                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectBusiness(
                                                            item.id,
                                                            item.name
                                                        )
                                                    }
                                                    className={`
                                                        flex
                                                        w-full
                                                        items-center
                                                        gap-3
                                                        rounded-xl
                                                        px-3
                                                        py-3
                                                        text-left
                                                        transition

                                                        ${
                                                            selected
                                                                ? 'bg-[#EEF2FF]'
                                                                : 'hover:bg-[#F9FAFB]'
                                                        }
                                                    `}
                                                >

                                                    <div
                                                        className={`
                                                            flex
                                                            h-9
                                                            w-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-lg

                                                            ${
                                                                selected
                                                                    ? `
                                                                        bg-white
                                                                        text-[#4F46E5]
                                                                    `
                                                                    : `
                                                                        bg-[#F2F4F7]
                                                                        text-[#667085]
                                                                    `
                                                            }
                                                        `}
                                                    >
                                                        <BriefcaseBusiness
                                                            size={16}
                                                        />
                                                    </div>


                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                            "
                                                        >

                                                            <span
                                                                className="
                                                                    truncate
                                                                    text-[13px]
                                                                    font-semibold
                                                                    text-[#101828]
                                                                "
                                                            >
                                                                {item.name}
                                                            </span>


                                                            {item.status ===
                                                                'active' && (

                                                                <span
                                                                    className="
                                                                        rounded
                                                                        bg-[#ECFDF3]
                                                                        px-1.5
                                                                        py-0.5
                                                                        text-[8px]
                                                                        font-semibold
                                                                        text-[#16A34A]
                                                                    "
                                                                >
                                                                    ACTIVE
                                                                </span>

                                                            )}

                                                        </div>


                                                        {location && (

                                                            <div
                                                                className="
                                                                    mt-1
                                                                    truncate
                                                                    text-[10px]
                                                                    text-[#98A2B3]
                                                                "
                                                            >
                                                                {location}
                                                            </div>

                                                        )}

                                                    </div>


                                                    {selected && (

                                                        <div
                                                            className="
                                                                flex
                                                                h-6
                                                                w-6
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-[#4F46E5]
                                                                text-white
                                                            "
                                                        >
                                                            <Check
                                                                size={13}
                                                            />
                                                        </div>

                                                    )}

                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    MAIN
                ================================================= */}

                {!businessId ? (

                    <div
                        className="
                            flex
                            min-h-[400px]
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-[#D9DDEC]
                            bg-white
                        "
                    >
                        <span
                            className="
                                text-[14px]
                                text-[#667085]
                            "
                        >
                            Выберите бизнес
                        </span>
                    </div>

                ) : (

                    <div
                        className="
                            grid
                            min-w-0
                            grid-cols-1
                            gap-4
                            sm:gap-5
                            xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,0.9fr)]
                        "
                    >

                        {/* =============================================
                            LEFT
                        ============================================= */}

                        <div
                            className="
                                min-w-0
                                space-y-5
                            "
                        >

                            {/* KPI */}

                            <div
                                className="
                                    grid
                                    min-w-0
                                    grid-cols-1
                                    gap-3
                                    min-[430px]:grid-cols-2
                                    sm:gap-4
                                    lg:grid-cols-4
                                "
                            >

                                <StatCard
                                    title="Сегодня"
                                    value={
                                        isDashboardLoading
                                            ? '...'
                                            : todayCount
                                    }
                                    subtitle="записей"
                                    icon={
                                        CalendarDays
                                    }
                                />


                                <StatCard
                                    title="Ожидают"
                                    value={
                                        isDashboardLoading
                                            ? '...'
                                            : pendingCount
                                    }
                                    icon={
                                        CalendarClock
                                    }
                                    variant="orange"
                                />


                                <StatCard
                                    title="Подтверждены"
                                    value={
                                        isDashboardLoading
                                            ? '...'
                                            : confirmedCount
                                    }
                                    icon={
                                        CalendarCheck
                                    }
                                />


                                <StatCard
                                    title="Завершены"
                                    value={
                                        isDashboardLoading
                                            ? '...'
                                            : completedCount
                                    }
                                    icon={
                                        CheckCircle2
                                    }
                                    variant="green"
                                />

                            </div>


                            {/* =============================================
                                REVENUE + CHART
                            ============================================= */}

                            <div
                                className="
                                    grid
                                    min-w-0
                                    grid-cols-1
                                    gap-3
                                    sm:gap-4
                                    lg:grid-cols-[230px_minmax(0,1fr)]
                                "
                            >

                                <div
                                    className="
                                        grid
                                        min-w-0
                                        grid-cols-1
                                        gap-3
                                        min-[430px]:grid-cols-2
                                        sm:gap-4
                                        lg:grid-cols-1
                                    "
                                >

                                    {/* COMPLETED REVENUE */}

                                    <div
                                        className="
                                            flex
                                            min-h-[108px]
                                            flex-col
                                            justify-center
                                            rounded-2xl
                                            border
                                            border-[#D9DDEC]
                                            border-l-4
                                            border-l-[#4F46E5]
                                            bg-white
                                            p-4
                                            shadow-sm
                                        "
                                    >

                                        <div
                                            className="
                                                text-[12px]
                                                font-medium
                                                text-[#667085]
                                            "
                                        >
                                            Доход (Завершенные)
                                        </div>


                                        <div
                                            className="
                                                mt-3
                                                break-words
                                                text-[22px]
                                                font-bold
                                                sm:text-[26px]
                                                leading-none
                                                text-[#101828]
                                            "
                                        >
                                            {
                                                completedRevenue
                                                    .toLocaleString(
                                                        'ru-RU'
                                                    )
                                            } ₸
                                        </div>

                                    </div>


                                    {/* EXPECTED */}

                                    <div
                                        className="
                                            flex
                                            min-h-[108px]
                                            flex-col
                                            justify-center
                                            rounded-2xl
                                            border
                                            border-[#D9DDEC]
                                            bg-white
                                            p-4
                                            shadow-sm
                                        "
                                    >

                                        <div
                                            className="
                                                text-[12px]
                                                font-medium
                                                text-[#667085]
                                            "
                                        >
                                            Ожидаемый (Подтв.)
                                        </div>


                                        <div
                                            className="
                                                mt-3
                                                break-words
                                                text-[22px]
                                                font-bold
                                                sm:text-[24px]
                                                leading-none
                                                text-[#101828]
                                            "
                                        >
                                            {
                                                expectedRevenue
                                                    .toLocaleString(
                                                        'ru-RU'
                                                    )
                                            } ₸
                                        </div>

                                    </div>

                                </div>


                                <AppointmentsChart
                                    appointments={
                                        last7Appointments
                                    }
                                    revenue={
                                        last7Revenue
                                    }
                                />

                            </div>


                            {/* TODAY */}

                            <TodayAppointments
                                appointments={
                                    todayAppointments
                                }
                                totalCount={
                                    todayAppointments.length
                                }
                                isLoading={
                                    isDashboardLoading
                                }
                                actionLoadingId={
                                    actionLoadingId
                                }
                                onConfirm={(
                                    id
                                ) =>
                                    handleConfirmAppointment(
                                        id
                                    )
                                }
                                onComplete={(
                                    id
                                ) =>
                                    completeMutation.mutate(
                                        id
                                    )
                                }
                                onCancel={(
                                    id
                                ) =>
                                    cancelMutation.mutate(
                                        id
                                    )
                                }
                            />

                        </div>


                        {/* =============================================
                            RIGHT
                        ============================================= */}

                        <div
                            className="
                                min-w-0
                                space-y-5
                            "
                        >

                            <div
                                className="
                                    grid
                                    min-w-0
                                    grid-cols-1
                                    gap-3
                                    min-[360px]:grid-cols-2
                                    sm:gap-4
                                "
                            >

                                <MiniStatCard
                                    title="Услуги"
                                    value={
                                        business
                                            ?.services_count ??
                                        0
                                    }
                                    icon={
                                        BriefcaseBusiness
                                    }
                                />


                                <MiniStatCard
                                    title="Мастеров"
                                    value={
                                        business
                                            ?.staff_count ??
                                        0
                                    }
                                    icon={
                                        UserRound
                                    }
                                />


                                <MiniStatCard
                                    title="Отмены (7 дн.)"
                                    value={
                                        cancelledWeek.length
                                    }
                                    icon={
                                        UsersRound
                                    }
                                />


                                <MiniStatCard
                                    title="Конверсия"
                                    value={
                                        `${conversion}%`
                                    }
                                    icon={
                                        Percent
                                    }
                                    highlight
                                />

                            </div>


                            <AttentionCard
                                pendingCount={
                                    pendingCount
                                }
                            />


                            <QuickActions />


                            <TomorrowCard
                                appointments={
                                    tomorrowAppointments
                                }
                            />

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}
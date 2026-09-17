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
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Pencil,
    Search,
    Scissors,
    UserRound,
    X
} from 'lucide-react';

import {
    useNavigate,
    useSearchParams
} from 'react-router-dom';

import Typography from '../../../atoms/Typography';

import Select, {
    type SelectOption
} from '../../../atoms/Select';

import Icon from '../../../atoms/Icon';
import Button from '../../../atoms/Button';

import {
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    filterAppointments
} from '../../../../api/appointments';

import {
    useBusiness
} from '../../../../context/BusinessContext';


const DATE_OPTIONS: SelectOption[] = [
    {
        id: 0,
        label: 'Все даты'
    },
    {
        id: 1,
        label: 'Сегодня'
    },
    {
        id: 2,
        label: 'Завтра'
    },
    {
        id: 3,
        label: 'Неделя'
    }
];


const STATUS_OPTIONS: SelectOption[] = [
    {
        id: 0,
        label: 'Все статусы'
    },
    {
        id: 1,
        label: 'Ожидают'
    },
    {
        id: 2,
        label: 'Подтверждены'
    },
    {
        id: 3,
        label: 'Завершены'
    },
    {
        id: 4,
        label: 'Отменены'
    }
];


/*
 * ============================================================
 * DATE
 * ============================================================
 */

const formatAppointmentDate = (
    dateString: string
) => {
    if (!dateString) {
        return '';
    }


    const date =
        new Date(
            dateString
        );


    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const targetDate =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    const diffTime =
        targetDate.getTime() -
        today.getTime();


    const diffDays =
        Math.round(
            diffTime /
                (
                    1000 *
                    3600 *
                    24
                )
        );


    const hours =
        date
            .getHours()
            .toString()
            .padStart(
                2,
                '0'
            );


    const minutes =
        date
            .getMinutes()
            .toString()
            .padStart(
                2,
                '0'
            );


    const timeString =
        `${hours}:${minutes}`;


    if (
        diffDays ===
        0
    ) {
        return `Сегодня, ${timeString}`;
    }


    if (
        diffDays ===
        1
    ) {
        return `Завтра, ${timeString}`;
    }


    const day =
        date
            .getDate()
            .toString()
            .padStart(
                2,
                '0'
            );


    const month =
        (
            date.getMonth() +
            1
        )
            .toString()
            .padStart(
                2,
                '0'
            );


    const year =
        date
            .getFullYear()
            .toString()
            .slice(
                -2
            );


    return `${day}.${month}.${year}, ${timeString}`;
};


/*
 * ============================================================
 * QUICK STATUS
 * ============================================================
 */

type StatusAction =
    | 'confirm'
    | 'complete'
    | 'cancel';


interface QuickStatusProps {
    appointmentId: number;

    status: string;

    isLoading: boolean;

    onAction: (
        appointmentId: number,
        action: StatusAction
    ) => void;
}


function QuickStatus({
    appointmentId,
    status,
    isLoading,
    onAction
}: QuickStatusProps) {

    const [
        isOpen,
        setIsOpen
    ] =
        useState(
            false
        );


    const containerRef =
        useRef<
            HTMLDivElement | null
        >(
            null
        );


    /*
     * ========================================================
     * CLICK OUTSIDE
     * ========================================================
     */

    useEffect(
        () => {

            if (
                !isOpen
            ) {
                return;
            }


            const handleClickOutside =
                (
                    event:
                        MouseEvent
                ) => {

                    if (
                        containerRef.current &&
                        !containerRef.current.contains(
                            event.target as Node
                        )
                    ) {

                        setIsOpen(
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
        [
            isOpen
        ]
    );


    /*
     * ========================================================
     * STATUS CONFIG
     * ========================================================
     */

    const config =
        useMemo(
            () => {

                switch (
                    status
                ) {

                    case 'pending':

                        return {
                            label:
                                'Ожидает',

                            className:
                                'bg-[#fffbe2] text-[#d97706]',

                            editable:
                                true
                        };


                    case 'confirmed':

                        return {
                            label:
                                'Подтверждена',

                            className:
                                'bg-[#eef4ff] text-[#4031d0]',

                            editable:
                                true
                        };


                    case 'completed':

                        return {
                            label:
                                'Завершена',

                            className:
                                'bg-[#ecfdf5] text-[#15803d]',

                            editable:
                                false
                        };


                    case 'cancelled_by_client':

                        return {
                            label:
                                'Отменена клиентом',

                            className:
                                'bg-[#fef2f2] text-[#e7000a]',

                            editable:
                                false
                        };


                    case 'cancelled_by_business':

                        return {
                            label:
                                'Отменена бизнесом',

                            className:
                                'bg-[#fef2f2] text-[#e7000a]',

                            editable:
                                false
                        };


                    case 'cancelled':

                    case 'canceled':

                        return {
                            label:
                                'Отменена',

                            className:
                                'bg-[#fef2f2] text-[#b91c1c]',

                            editable:
                                false
                        };


                    default:

                        return {
                            label:
                                status,

                            className:
                                'bg-slate-100 text-slate-600',

                            editable:
                                false
                        };
                }

            },
            [
                status
            ]
        );


    /*
     * ========================================================
     * ACTION
     * ========================================================
     */

    const handleAction =
        (
            action:
                StatusAction
        ) => {

            setIsOpen(
                false
            );


            onAction(
                appointmentId,
                action
            );
        };


    return (
        <div
            ref={
                containerRef
            }
            className="
                relative
                inline-flex
            "
        >

            <button
                type="button"

                disabled={
                    !config.editable ||
                    isLoading
                }

                onClick={() => {

                    if (
                        config.editable
                    ) {

                        setIsOpen(
                            previous =>
                                !previous
                        );
                    }
                }}

                className={`
                    inline-flex
                    items-center
                    gap-1.5
                    whitespace-nowrap
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    transition

                    ${config.className}

                    ${
                        config.editable
                            ? `
                                cursor-pointer
                                hover:ring-2
                                hover:ring-[#4F46E5]/10
                            `
                            : `
                                cursor-default
                            `
                    }

                    ${
                        isLoading
                            ? `
                                cursor-wait
                                opacity-60
                            `
                            : ''
                    }
                `}
            >

                {isLoading
                    ? 'Изменение...'
                    : config.label}


                {config.editable &&
                    !isLoading && (

                    <ChevronDown
                        size={
                            13
                        }

                        className={`
                            transition-transform

                            ${
                                isOpen
                                    ? 'rotate-180'
                                    : ''
                            }
                        `}
                    />

                )}

            </button>


            {isOpen &&
                config.editable &&
                !isLoading && (

                <div
                    className="
                        absolute
                        left-0
                        top-[calc(100%+6px)]
                        z-[100]
                        min-w-[180px]
                        overflow-hidden
                        rounded-xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        p-1.5
                        shadow-xl
                    "
                >

                    {status ===
                        'pending' && (

                        <button
                            type="button"

                            onClick={() =>
                                handleAction(
                                    'confirm'
                                )
                            }

                            className="
                                flex
                                w-full
                                cursor-pointer
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                font-medium
                                text-[#4031d0]
                                transition

                                hover:bg-[#EEF2FF]
                            "
                        >

                            <Check
                                size={
                                    16
                                }
                            />

                            Подтвердить

                        </button>

                    )}


                    {status ===
                        'confirmed' && (

                        <button
                            type="button"

                            onClick={() =>
                                handleAction(
                                    'complete'
                                )
                            }

                            className="
                                flex
                                w-full
                                cursor-pointer
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                font-medium
                                text-green-700
                                transition

                                hover:bg-green-50
                            "
                        >

                            <CheckCircle2
                                size={
                                    16
                                }
                            />

                            Завершить

                        </button>

                    )}


                    {(status ===
                        'pending' ||
                        status ===
                        'confirmed') && (

                        <button
                            type="button"

                            onClick={() =>
                                handleAction(
                                    'cancel'
                                )
                            }

                            className="
                                flex
                                w-full
                                cursor-pointer
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                font-medium
                                text-red-600
                                transition

                                hover:bg-red-50
                            "
                        >

                            <X
                                size={
                                    16
                                }
                            />

                            Отменить

                        </button>

                    )}

                </div>

            )}

        </div>
    );
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */
interface AppointmentAddon {
    id: number;
    addon: number | null;
    name: string;
    price?: string | number;
    duration_minutes?: number;
}


interface AppointmentServiceProps {
    serviceName?: string | null;
    addons?: AppointmentAddon[];
    isCanceled: boolean;
}


function AppointmentService({
    serviceName,
    addons = [],
    isCanceled
}: AppointmentServiceProps) {

    return (
        <div
            className="
                flex
                min-w-0
                flex-col
                gap-1
            "
        >
            <div
                className={`
                    break-words
                    text-sm
                    font-medium

                    ${
                        isCanceled
                            ? `
                                text-slate-400
                                line-through
                            `
                            : `
                                text-slate-700
                            `
                    }
                `}
            >
                {serviceName || '—'}
            </div>


            {addons.length > 0 && (

                <div
                    className="
                        flex
                        flex-col
                        gap-0.5
                    "
                >
                    {addons.map(
                        addon => (

                            <div
                                key={addon.id}
                                className={`
                                    break-words
                                    text-xs
                                    font-medium

                                    ${
                                        isCanceled
                                            ? `
                                                text-slate-400
                                                line-through
                                            `
                                            : `
                                                text-[#4F46E5]
                                            `
                                    }
                                `}
                            >
                                + {addon.name}
                            </div>

                        )
                    )}
                </div>

            )}

        </div>
    );
}

export default function StatsGrid() {

    const navigate =
        useNavigate();


    const queryClient =
        useQueryClient();


    /*
     * ============================================================
     * QUICK STATUS STATE
     * ============================================================
     */

    const [
        actionLoadingId,
        setActionLoadingId
    ] =
        useState<
            number | null
        >(
            null
        );


    const [
        statusError,
        setStatusError
    ] =
        useState(
            ''
        );


    const [
        searchParams,
        setSearchParams
    ] =
        useSearchParams();


    const searchFromUrl =
        searchParams.get(
            'search'
        ) ??
        '';


    const staffIdFromUrl =
        searchParams.get(
            'staff_id'
        );
        
    const dateFilterFromUrl =
        searchParams.get(
            'date_filter'
        );


    const statusFromUrl =
        searchParams.get(
            'status'
        );

    const {
        selectedBusiness
    } =
        useBusiness();


    const businessId =
        selectedBusiness?.id;


    /*
     * ============================================================
     * SEARCH
     * ============================================================
     */

    const [
        search,
        setSearch
    ] =
        useState(
            searchFromUrl
        );


    const [
        debouncedSearch,
        setDebouncedSearch
    ] =
        useState(
            searchFromUrl
        );


    /*
     * ============================================================
     * FILTERS
     * ============================================================
     */

    const [
        selectedDate,
        setSelectedDate
    ] =
        useState<SelectOption>(
            () => {

                if (
                    dateFilterFromUrl ===
                    'today'
                ) {
                    return DATE_OPTIONS[1];
                }


                if (
                    dateFilterFromUrl ===
                    'tomorrow'
                ) {
                    return DATE_OPTIONS[2];
                }


                if (
                    dateFilterFromUrl ===
                    'week'
                ) {
                    return DATE_OPTIONS[3];
                }


                return DATE_OPTIONS[0];
            }
        );


    const [
        selectedStatus,
        setSelectedStatus
    ] =
        useState<SelectOption>(
            () => {

                if (
                    statusFromUrl ===
                    'pending'
                ) {
                    return STATUS_OPTIONS[1];
                }


                if (
                    statusFromUrl ===
                    'confirmed'
                ) {
                    return STATUS_OPTIONS[2];
                }


                if (
                    statusFromUrl ===
                    'completed'
                ) {
                    return STATUS_OPTIONS[3];
                }


                if (
                    statusFromUrl ===
                    'cancelled'
                ) {
                    return STATUS_OPTIONS[4];
                }


                return STATUS_OPTIONS[0];
            }
        );


    /*
     * ============================================================
     * PAGE
     * ============================================================
     */

    const [
        page,
        setPage
    ] =
        useState(
            1
        );


    /*
     * ============================================================
     * DEBOUNCE
     * ============================================================
     */

    useEffect(
        () => {

            const timer =
                setTimeout(
                    () => {

                        setDebouncedSearch(
                            search
                        );

                    },
                    300
                );


            return () =>
                clearTimeout(
                    timer
                );

        },
        [
            search
        ]
    );


    /*
     * При смене фильтров
     * возвращаем страницу 1.
     */

    useEffect(
        () => {

            setPage(
                1
            );

        },
        [
            businessId,
            debouncedSearch,
            selectedDate.id,
            selectedStatus.id,
            staffIdFromUrl
        ]
    );


    /*
     * ============================================================
     * RESET
     * ============================================================
     */

    const handleReset =
        () => {

            setSearch(
                ''
            );


            setDebouncedSearch(
                ''
            );


            setSelectedDate(
                DATE_OPTIONS[0]
            );


            setSelectedStatus(
                STATUS_OPTIONS[0]
            );


            setPage(
                1
            );


            setSearchParams(
                {}
            );
        };


    /*
     * ============================================================
     * APPOINTMENTS
     * ============================================================
     */

    const {
        data:
            appointmentsResponse,

        isLoading,

        isFetching
    } =
        useQuery({

            queryKey: [
                'appointments',
                businessId,
                debouncedSearch,
                selectedDate.id,
                selectedStatus.id,
                staffIdFromUrl,
                page
            ],


            queryFn:
                async () => {

                    const filters:
                        Record<string, unknown> = {
                            page
                        };


                    if (
                        debouncedSearch.trim()
                    ) {

                        filters.search =
                            debouncedSearch.trim();
                    }


                    if (
                        staffIdFromUrl
                    ) {

                        filters.staff_id =
                            Number(
                                staffIdFromUrl
                            );
                    }


                    if (
                        selectedDate.id ===
                        1
                    ) {

                        filters.date_filter =
                            'today';
                    }


                    if (
                        selectedDate.id ===
                        2
                    ) {

                        filters.date_filter =
                            'tomorrow';
                    }


                    if (
                        selectedDate.id ===
                        3
                    ) {

                        filters.date_filter =
                            'week';
                    }


                    if (
                        selectedStatus.id ===
                        1
                    ) {

                        filters.status =
                            'pending';
                    }


                    if (
                        selectedStatus.id ===
                        2
                    ) {

                        filters.status =
                            'confirmed';
                    }


                    if (
                        selectedStatus.id ===
                        3
                    ) {

                        filters.status =
                            'completed';
                    }


                    if (
                        selectedStatus.id ===
                        4
                    ) {

                        filters.status =
                            'cancelled';
                    }


                    return await filterAppointments(
                        Number(
                            businessId
                        ),
                        filters
                    );
                },


            enabled:
                !!businessId,


            placeholderData:
                previousData =>
                    previousData
        });


    /*
     * ============================================================
     * QUICK STATUS MUTATION
     * ============================================================
     */

    const statusMutation =
        useMutation({

            mutationFn:
                async ({
                    appointmentId,
                    action
                }: {
                    appointmentId:
                        number;

                    action:
                        StatusAction;
                }) => {

                    if (
                        action ===
                        'confirm'
                    ) {

                        return confirmAppointment(
                            appointmentId
                        );
                    }


                    if (
                        action ===
                        'complete'
                    ) {

                        return completeAppointment(
                            appointmentId
                        );
                    }


                    return cancelAppointment(
                        appointmentId
                    );
                },


            onMutate:
                ({
                    appointmentId
                }) => {

                    setActionLoadingId(
                        appointmentId
                    );


                    setStatusError(
                        ''
                    );
                },


            onSuccess:
                async () => {

                    await Promise.all([

                        queryClient
                            .invalidateQueries({
                                queryKey: [
                                    'appointments'
                                ]
                            }),

                        queryClient
                            .invalidateQueries({
                                queryKey: [
                                    'dashboard-data'
                                ]
                            }),

                        queryClient
                            .invalidateQueries({
                                queryKey: [
                                    'dashboard'
                                ]
                            })
                    ]);
                },


            onError:
                (
                    error:
                        any
                ) => {

                    const message =
                        error
                            ?.response
                            ?.data
                            ?.message;


                    setStatusError(
                        typeof message ===
                            'string'
                            ? message
                            : 'Не удалось изменить статус записи.'
                    );
                },


            onSettled:
                () => {

                    setActionLoadingId(
                        null
                    );
                }
        });


    const handleStatusAction =
        (
            appointmentId:
                number,

            action:
                StatusAction
        ) => {

            if (
                statusMutation.isPending
            ) {
                return;
            }


            statusMutation.mutate({
                appointmentId,
                action
            });
        };


    /*
     * ============================================================
     * RESPONSE
     * ============================================================
     */

    const appointments =
        appointmentsResponse?.data ??
        [];


    const pagination =
        appointmentsResponse?.pagination;


    const currentPage =
        pagination?.current_page ??
        page;


    const totalPages =
        pagination?.total_pages ??
        1;


    const totalCount =
        pagination?.count ??
        0;


    const pageSize =
        pagination?.page_size ??
        5;


    const firstItem =
        totalCount ===
        0
            ? 0
            : (
                currentPage -
                1
            ) *
                pageSize +
                1;


    const lastItem =
        totalCount ===
        0
            ? 0
            : Math.min(
                currentPage *
                    pageSize,
                totalCount
            );


    /*
     * ============================================================
     * PAGE NUMBERS
     * ============================================================
     */

    const pageNumbers =
        useMemo(
            () => {

                if (
                    totalPages <=
                    5
                ) {

                    return Array.from(
                        {
                            length:
                                totalPages
                        },
                        (
                            _,
                            index
                        ) =>
                            index +
                            1
                    );
                }


                let start =
                    Math.max(
                        1,
                        currentPage -
                            2
                    );


                let end =
                    Math.min(
                        totalPages,
                        start +
                            4
                    );


                if (
                    end -
                        start <
                    4
                ) {

                    start =
                        Math.max(
                            1,
                            end -
                                4
                        );
                }


                const result:
                    number[] = [];


                for (
                    let number =
                        start;
                    number <=
                    end;
                    number +=
                        1
                ) {

                    result.push(
                        number
                    );
                }


                return result;

            },
            [
                currentPage,
                totalPages
            ]
        );


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
                overflow-hidden
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-white
            "
        >

            {/* =====================================================
                FILTERS
            ===================================================== */}

            <div
                className="
                    flex
                    w-full
                    min-w-0
                    flex-col
                    gap-3
                    border-b
                    border-[#e2e4f0]
                    p-4

                    sm:p-5

                    lg:flex-row
                    lg:items-center
                    lg:gap-4
                "
            >

                {/* SEARCH */}

                <div
                    className="
                        relative
                        w-full
                        min-w-0

                        lg:w-[320px]
                        lg:shrink-0
                    "
                >

                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-y-0
                            left-0
                            flex
                            items-center
                            pl-3
                        "
                    >
                        <Icon
                            icon={
                                Search
                            }
                            className="
                                h-4
                                w-4
                                text-slate-400
                            "
                        />
                    </div>


                    <input
                        type="text"
                        placeholder="Поиск по клиенту, мастеру или услуге..."
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        className="
                            h-11
                            w-full
                            min-w-0
                            rounded-xl
                            border
                            border-[#c7c4d8]
                            bg-white
                            py-3
                            pl-9
                            pr-4
                            text-sm
                            font-medium
                            text-slate-800
                            outline-none
                            placeholder:text-slate-400
                            focus:border-[#4031d0]
                            focus:ring-1
                            focus:ring-[#4031d0]
                        "
                    />

                </div>


                {/* DATE + STATUS */}

                <div
                    className="
                        grid
                        w-full
                        min-w-0
                        grid-cols-1
                        gap-3

                        sm:grid-cols-2

                        lg:w-auto
                        lg:grid-cols-[140px_160px]
                        lg:shrink-0
                    "
                >

                    <div
                        className="
                            w-full
                            min-w-0
                        "
                    >
                        <Select
                            options={
                                DATE_OPTIONS
                            }
                            value={
                                selectedDate
                            }
                            onChange={
                                setSelectedDate
                            }
                            className="
                                w-full
                                min-w-0
                                rounded-xl
                                border
                                border-[#c7c4d8]
                            "
                        />
                    </div>


                    <div
                        className="
                            w-full
                            min-w-0
                        "
                    >
                        <Select
                            options={
                                STATUS_OPTIONS
                            }
                            value={
                                selectedStatus
                            }
                            onChange={
                                setSelectedStatus
                            }
                            className="
                                w-full
                                min-w-0
                                rounded-xl
                                border
                                border-[#c7c4d8]
                            "
                        />
                    </div>

                </div>


                {/* RESET */}

                <button
                    type="button"
                    onClick={
                        handleReset
                    }
                    className="
                        w-full
                        cursor-pointer
                        rounded-xl
                        border
                        border-[#c7c4d8]
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-slate-500
                        transition-colors
                        hover:bg-slate-50
                        hover:text-slate-700

                        sm:w-auto

                        lg:border-0
                        lg:bg-transparent
                        lg:px-2
                    "
                >
                    Сбросить
                </button>


                {/* FETCHING */}

                {isFetching &&
                    !isLoading && (

                    <div
                        className="
                            text-center
                            text-xs
                            text-slate-400

                            lg:ml-auto
                        "
                    >
                        Обновление...
                    </div>

                )}

            </div>


            {statusError && (

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-red-600

                        sm:px-5
                    "
                >

                    <span>
                        {statusError}
                    </span>


                    <button
                        type="button"

                        onClick={() =>
                            setStatusError(
                                ''
                            )
                        }

                        className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            transition

                            hover:bg-red-100
                        "
                    >
                        <X
                            size={
                                16
                            }
                        />
                    </button>

                </div>

            )}


            {/* =====================================================
                MOBILE
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    divide-y
                    divide-[#e2e4f0]

                    md:hidden
                "
            >

                {isLoading ? (

                    <div
                        className="
                            px-4
                            py-10
                            text-center
                            text-sm
                            text-slate-500
                        "
                    >
                        Загрузка...
                    </div>

                ) : appointments.length ===
                    0 ? (

                    <div
                        className="
                            px-4
                            py-10
                            text-center
                            text-sm
                            text-slate-500
                        "
                    >
                        Записей не найдено
                    </div>

                ) : (

                    appointments.map(
                        (
                            row:
                                any
                        ) => {

                            const isCanceled =
                                row.status ===
                                    'canceled' ||
                                row.status ===
                                    'cancelled' ||
                                row.status ===
                                    'cancelled_by_client' ||
                                row.status ===
                                    'cancelled_by_business';


                            const clientName =
                                row.client_first_name &&
                                row.client_last_name
                                    ? `${row.client_first_name} ${row.client_last_name}`
                                    : `Клиент #${row.client}`;


                            return (
                                <div
                                    key={
                                        row.id
                                    }
                                    className="
                                        flex
                                        min-w-0
                                        flex-col
                                        gap-4
                                        p-4
                                    "
                                >

                                    {/* TOP */}

                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            items-start
                                            justify-between
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                min-w-0
                                                flex-1
                                            "
                                        >

                                            <div
                                                className={`
                                                    text-[14px]
                                                    font-semibold
                                                    leading-5

                                                    ${
                                                        isCanceled
                                                            ? `
                                                                text-slate-400
                                                                line-through
                                                            `
                                                            : `
                                                                text-slate-900
                                                            `
                                                    }
                                                `}
                                            >
                                                {
                                                    row.start_at
                                                        ? formatAppointmentDate(
                                                            row.start_at
                                                        )
                                                        : row.date
                                                }
                                            </div>


                                            <div
                                                className="
                                                    mt-2
                                                "
                                            >
                                                <QuickStatus
                                                    appointmentId={
                                                        row.id
                                                    }

                                                    status={
                                                        row.status
                                                    }

                                                    isLoading={
                                                        actionLoadingId ===
                                                        row.id
                                                    }

                                                    onAction={
                                                        handleStatusAction
                                                    }
                                                />
                                            </div>

                                        </div>


                                        <Button
                                            type="button"
                                            className="
                                                group
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                cursor-pointer
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-[#EEF2FF]
                                                transition-colors
                                                hover:bg-[#E0E7FF]
                                            "
                                            onClick={() =>
                                                navigate(
                                                    `/crm/appointments/edit/${row.id}`
                                                )
                                            }
                                        >
                                            <Icon
                                                icon={
                                                    Pencil
                                                }
                                                size={
                                                    17
                                                }
                                                className="
                                                    text-[#4F46E5]
                                                "
                                            />
                                        </Button>

                                    </div>


                                    {/* CLIENT */}

                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            items-start
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-[#f8f9ff]
                                                text-[#4F46E5]
                                            "
                                        >
                                            <UserRound
                                                size={
                                                    17
                                                }
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
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wider
                                                    text-slate-400
                                                "
                                            >
                                                Клиент
                                            </div>


                                            <div
                                                className={`
                                                    mt-0.5
                                                    break-words
                                                    text-[13px]
                                                    font-semibold

                                                    ${
                                                        isCanceled
                                                            ? `
                                                                text-slate-400
                                                                line-through
                                                            `
                                                            : `
                                                                text-slate-800
                                                            `
                                                    }
                                                `}
                                            >
                                                {
                                                    clientName
                                                }
                                            </div>


                                            {row.client_phone && (

                                                <div
                                                    className="
                                                        mt-0.5
                                                        break-all
                                                        text-[11px]
                                                        text-slate-500
                                                    "
                                                >
                                                    {
                                                        row.client_phone
                                                    }
                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    {/* SERVICE / STAFF */}

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-3

                                            min-[360px]:grid-cols-2
                                        "
                                    >

                                        {/* SERVICE */}

                                        <div
                                            className="
                                                min-w-0
                                                rounded-xl
                                                bg-[#f8f9ff]
                                                p-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-1.5
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                "
                                            >
                                                <Scissors
                                                    size={
                                                        13
                                                    }
                                                />

                                                Услуга
                                            </div>


                                            <div className="mt-1.5">

                                                <AppointmentService
                                                    serviceName={
                                                        row.service_name
                                                    }
                                                    addons={
                                                        Array.isArray(
                                                            row.addons
                                                        )
                                                            ? row.addons
                                                            : []
                                                    }
                                                    isCanceled={
                                                        isCanceled
                                                    }
                                                />

                                            </div>

                                        </div>


                                        {/* STAFF */}

                                        <div
                                            className="
                                                min-w-0
                                                rounded-xl
                                                bg-[#f8f9ff]
                                                p-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-1.5
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                "
                                            >
                                                <CalendarDays
                                                    size={
                                                        13
                                                    }
                                                />

                                                Мастер
                                            </div>


                                            <div
                                                className={`
                                                    mt-1.5
                                                    break-words
                                                    text-[12px]
                                                    font-medium

                                                    ${
                                                        isCanceled
                                                            ? `
                                                                text-slate-400
                                                                line-through
                                                            `
                                                            : `
                                                                text-slate-700
                                                            `
                                                    }
                                                `}
                                            >
                                                {
                                                    row.staff_name ||
                                                    'Не назначен'
                                                }
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            );
                        }
                    )

                )}

            </div>


            {/* =====================================================
                DESKTOP TABLE
            ===================================================== */}

            <div
                className="
                    hidden
                    w-full
                    overflow-x-auto

                    md:block
                "
            >

                <table
                    className="
                        w-full
                        min-w-[800px]
                        border-collapse
                        text-left
                    "
                >

                    <thead
                        className="
                            border-b
                            border-[#e2e4f0]
                            bg-slate-50
                        "
                    >

                        <tr>

                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-slate-500
                                "
                            >
                                Дата и время
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-slate-500
                                "
                            >
                                Клиент
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-slate-500
                                "
                            >
                                Услуга
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-slate-500
                                "
                            >
                                Мастер
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-slate-500
                                "
                            >
                                Статус
                            </th>


                            <th
                                className="
                                    px-6
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-slate-500
                                "
                            >
                                Действия
                            </th>

                        </tr>

                    </thead>


                    <tbody
                        className="
                            divide-y
                            divide-[#e2e4f0]
                        "
                    >

                        {isLoading ? (

                            <tr>

                                <td
                                    colSpan={
                                        6
                                    }
                                    className="
                                        py-8
                                        text-center
                                        text-slate-500
                                    "
                                >
                                    Загрузка...
                                </td>

                            </tr>

                        ) : appointments.length ===
                            0 ? (

                            <tr>

                                <td
                                    colSpan={
                                        6
                                    }
                                    className="
                                        py-8
                                        text-center
                                        text-slate-500
                                    "
                                >
                                    Записей не найдено
                                </td>

                            </tr>

                        ) : (

                            appointments.map(
                                (
                                    row:
                                        any
                                ) => {

                                    const isCanceled =
                                        row.status ===
                                            'canceled' ||
                                        row.status ===
                                            'cancelled' ||
                                        row.status ===
                                            'cancelled_by_business';


                                    return (
                                        <tr
                                            key={
                                                row.id
                                            }
                                            className="
                                                transition-colors
                                                hover:bg-slate-50/50
                                            "
                                        >

                                            {/* DATE */}

                                            <td
                                                className="
                                                    px-6
                                                    py-4
                                                    align-middle
                                                "
                                            >

                                                <div
                                                    className={`
                                                        text-sm
                                                        font-semibold

                                                        ${
                                                            isCanceled
                                                                ? `
                                                                    text-slate-400
                                                                    line-through
                                                                `
                                                                : `
                                                                    text-slate-900
                                                                `
                                                        }
                                                    `}
                                                >
                                                    {
                                                        row.start_at
                                                            ? formatAppointmentDate(
                                                                row.start_at
                                                            )
                                                            : row.date
                                                    }
                                                </div>

                                            </td>


                                            {/* CLIENT */}

                                            <td
                                                className="
                                                    px-6
                                                    py-4
                                                    align-middle
                                                "
                                            >

                                                <div
                                                    className={`
                                                        text-sm
                                                        font-semibold

                                                        ${
                                                            isCanceled
                                                                ? `
                                                                    text-slate-400
                                                                    line-through
                                                                `
                                                                : `
                                                                    text-slate-900
                                                                `
                                                        }
                                                    `}
                                                >
                                                    {
                                                        row.client_first_name &&
                                                        row.client_last_name
                                                            ? `${row.client_first_name} ${row.client_last_name}`
                                                            : `Клиент #${row.client}`
                                                    }
                                                </div>


                                                <div
                                                    className="
                                                        mt-0.5
                                                        text-xs
                                                        text-slate-500
                                                    "
                                                >
                                                    {
                                                        row.client_phone
                                                    }
                                                </div>

                                            </td>


                                            {/* SERVICE */}

                                            <td
                                                className="
                                                    px-6
                                                    py-4
                                                    align-middle
                                                "
                                            >

                                                <AppointmentService
                                                    serviceName={
                                                        row.service_name
                                                    }
                                                    addons={
                                                        Array.isArray(
                                                            row.addons
                                                        )
                                                            ? row.addons
                                                            : []
                                                    }
                                                    isCanceled={
                                                        isCanceled
                                                    }
                                                />

                                            </td>


                                            {/* STAFF */}

                                            <td
                                                className="
                                                    px-6
                                                    py-4
                                                    align-middle
                                                "
                                            >

                                                <div
                                                    className={`
                                                        text-sm
                                                        font-medium

                                                        ${
                                                            isCanceled
                                                                ? `
                                                                    text-slate-400
                                                                    line-through
                                                                `
                                                                : `
                                                                    text-slate-700
                                                                `
                                                        }
                                                    `}
                                                >
                                                    {
                                                        row.staff_name ||
                                                        'Не назначен'
                                                    }
                                                </div>

                                            </td>


                                            {/* STATUS */}

                                            <td
                                                className="
                                                    px-6
                                                    py-4
                                                    align-middle
                                                "
                                            >
                                                <QuickStatus
                                                    appointmentId={
                                                        row.id
                                                    }

                                                    status={
                                                        row.status
                                                    }

                                                    isLoading={
                                                        actionLoadingId ===
                                                        row.id
                                                    }

                                                    onAction={
                                                        handleStatusAction
                                                    }
                                                />
                                            </td>


                                            {/* ACTION */}

                                            <td
                                                className="
                                                    px-6
                                                    py-4
                                                    align-middle
                                                "
                                            >

                                                <Button
                                                    type="button"
                                                    className="
                                                        group
                                                        cursor-pointer
                                                    "
                                                    onClick={() =>
                                                        navigate(
                                                            `/crm/appointments/edit/${row.id}`
                                                        )
                                                    }
                                                >
                                                    <Icon
                                                        icon={
                                                            Pencil
                                                        }
                                                        size={
                                                            20
                                                        }
                                                        className="
                                                            text-[#7c7c7c]
                                                            group-hover:text-[#5a5a5a]
                                                        "
                                                    />
                                                </Button>

                                            </td>

                                        </tr>
                                    );
                                }
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* =====================================================
                PAGINATION
            ===================================================== */}

            <div
                className="
                    flex
                    w-full
                    min-w-0
                    flex-col
                    gap-4
                    border-t
                    border-[#e2e4f0]
                    px-4
                    py-4

                    sm:px-6
                "
            >

                <Typography
                    text={
                        totalCount ===
                        0
                            ? 'Записей нет'
                            : `Показано ${firstItem}-${lastItem} из ${totalCount} записей`
                    }
                    className="
                        text-center
                        text-xs
                        text-slate-500

                        sm:text-sm

                        md:text-left
                    "
                />


                {/* MOBILE PAGINATION */}

                {totalPages >
                    1 && (

                    <div
                        className="
                            flex
                            w-full
                            items-center
                            justify-between
                            gap-2

                            sm:hidden
                        "
                    >

                        <button
                            type="button"
                            disabled={
                                currentPage <=
                                    1 ||
                                isFetching
                            }
                            onClick={() =>
                                setPage(
                                    prev =>
                                        Math.max(
                                            1,
                                            prev -
                                                1
                                        )
                                )
                            }
                            className="
                                h-10
                                min-w-[82px]
                                cursor-pointer
                                rounded-lg
                                border
                                border-[#c7c4d8]
                                bg-white
                                px-3
                                text-xs
                                font-medium
                                text-slate-600
                                transition-colors
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            Пред.
                        </button>


                        <div
                            className="
                                flex
                                min-w-0
                                flex-1
                                justify-center
                                text-xs
                                font-semibold
                                text-slate-600
                            "
                        >
                            {currentPage} / {totalPages}
                        </div>


                        <button
                            type="button"
                            disabled={
                                currentPage >=
                                    totalPages ||
                                isFetching
                            }
                            onClick={() =>
                                setPage(
                                    prev =>
                                        Math.min(
                                            totalPages,
                                            prev +
                                                1
                                        )
                                )
                            }
                            className="
                                h-10
                                min-w-[82px]
                                cursor-pointer
                                rounded-lg
                                border
                                border-[#c7c4d8]
                                bg-white
                                px-3
                                text-xs
                                font-medium
                                text-slate-600
                                transition-colors
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            След.
                        </button>

                    </div>

                )}


                {/* TABLET / DESKTOP PAGINATION */}

                {totalPages >
                    1 && (

                    <div
                        className="
                            hidden
                            w-full
                            items-center
                            justify-end
                            gap-1

                            sm:flex
                        "
                    >

                        <button
                            type="button"
                            disabled={
                                currentPage <=
                                    1 ||
                                isFetching
                            }
                            onClick={() =>
                                setPage(
                                    prev =>
                                        Math.max(
                                            1,
                                            prev -
                                                1
                                        )
                                )
                            }
                            className="
                                cursor-pointer
                                rounded-lg
                                border
                                border-[#c7c4d8]
                                bg-white
                                px-3.5
                                py-1.5
                                text-sm
                                font-medium
                                text-slate-600
                                transition-colors
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            Пред.
                        </button>


                        {pageNumbers.map(
                            pageNumber => (

                                <button
                                    key={
                                        pageNumber
                                    }
                                    type="button"
                                    disabled={
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            pageNumber
                                        )
                                    }
                                    className={`
                                        min-w-[34px]
                                        cursor-pointer
                                        rounded-lg
                                        border
                                        px-3
                                        py-1.5
                                        text-sm
                                        font-medium
                                        transition-colors

                                        ${
                                            pageNumber ===
                                            currentPage
                                                ? `
                                                    border-[#4031d0]
                                                    bg-[#4031d0]
                                                    text-white
                                                `
                                                : `
                                                    border-[#c7c4d8]
                                                    bg-white
                                                    text-slate-600
                                                    hover:bg-slate-50
                                                `
                                        }

                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    `}
                                >
                                    {
                                        pageNumber
                                    }
                                </button>

                            )
                        )}


                        <button
                            type="button"
                            disabled={
                                currentPage >=
                                    totalPages ||
                                isFetching
                            }
                            onClick={() =>
                                setPage(
                                    prev =>
                                        Math.min(
                                            totalPages,
                                            prev +
                                                1
                                        )
                                )
                            }
                            className="
                                cursor-pointer
                                rounded-lg
                                border
                                border-[#c7c4d8]
                                bg-white
                                px-3.5
                                py-1.5
                                text-sm
                                font-medium
                                text-slate-600
                                transition-colors
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            След.
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
}
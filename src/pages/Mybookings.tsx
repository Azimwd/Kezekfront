import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import {
    useNavigate
} from 'react-router-dom';

import axios from 'axios';

import {
    CalendarClock,
    CalendarDays,
    CalendarX2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    MapPin,
    UserRound,
    X
} from 'lucide-react';

import {
    cancelMyBooking,
    getMyBookings,
    rescheduleMyBooking,
    type MyBooking
} from '../api/myBookings';

import RescheduleBookingModal
    from '../components/organisms/Mybookings/RescheduleBookingModal';

import CancelBookingModal
    from '../components/organisms/Mybookings/CancelBookingModal';


import ReviewBookingModal
    from '../components/organisms/Mybookings/ReviewBookingModal';

import {
    createReview
} from '../api/reviews';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type Tab =
    'upcoming' |
    'history';


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const formatMoney = (
    value:
        string |
        number |
        null |
        undefined
) => {

    const price =
        Number(
            value ??
            0
        );


    if (
        !Number.isFinite(
            price
        )
    ) {
        return '—';
    }


    return `${new Intl.NumberFormat(
        'ru-RU'
    ).format(
        price
    )} ₸`;
};


const formatDate = (
    value: string
) => {

    return new Date(
        value
    ).toLocaleDateString(
        'ru-RU',
        {
            day:
                'numeric',

            month:
                'long',

            year:
                'numeric'
        }
    );
};


const formatTime = (
    value: string
) => {

    return new Date(
        value
    ).toLocaleTimeString(
        'ru-RU',
        {
            hour:
                '2-digit',

            minute:
                '2-digit'
        }
    );
};


const getStaffName = (
    booking: MyBooking
) => {

    if (
        booking.staff_name
    ) {
        return booking.staff_name;
    }


    const fullName =
        [
            booking.staff_first_name,
            booking.staff_last_name
        ]
            .filter(
                Boolean
            )
            .join(
                ' '
            );


    if (
        fullName
    ) {
        return fullName;
    }


    return `Мастер #${booking.staff}`;
};


const getBusinessName = (
    booking: MyBooking
) => {

    return (
        booking.business_name ??
        `Бизнес #${booking.business}`
    );
};


const getServiceName = (
    booking: MyBooking
) => {

    return (
        booking.service_name ??
        `Услуга #${booking.service}`
    );
};


const isCancelled = (
    status: string
) => {

    return (
        status ===
            'cancelled' ||
        status ===
            'canceled' ||
        status ===
            'cancelled_by_client' ||
        status ===
            'cancelled_by_business'
    );
};


const isFinished = (
    booking: MyBooking
) => {

    if (
        booking.status ===
            'completed' ||
        isCancelled(
            booking.status
        )
    ) {
        return true;
    }


    return (
        new Date(
            booking.start_at
        ).getTime() <
        Date.now()
    );
};


const canCancel = (
    booking: MyBooking
) => {

    if (
        isCancelled(
            booking.status
        )
    ) {
        return false;
    }


    if (
        booking.status ===
        'completed'
    ) {
        return false;
    }


    return (
        new Date(
            booking.start_at
        ).getTime() >
        Date.now()
    );
};


const canReschedule = (
    booking: MyBooking
) => {

    if (
        isCancelled(
            booking.status
        )
    ) {
        return false;
    }


    if (
        booking.status ===
        'completed'
    ) {
        return false;
    }


    return (
        new Date(
            booking.start_at
        ).getTime() >
        Date.now()
    );
};


const getStatus = (
    status: string
) => {

    switch (
        status
    ) {

        case 'pending':

            return {
                label:
                    'Ожидает подтверждения',

                className:
                    'bg-[#FFF7ED] text-[#F79009]'
            };


        case 'confirmed':

            return {
                label:
                    'Подтверждена',

                className:
                    'bg-[#EFF8FF] text-[#2E90FA]'
            };


        case 'completed':

            return {
                label:
                    'Завершена',

                className:
                    'bg-[#ECFDF3] text-[#16A34A]'
            };


        case 'cancelled_by_client':

            return {
                label:
                    'Отменена вами',

                className:
                    'bg-[#FEF3F2] text-[#F04438]'
            };


        case 'cancelled_by_business':

            return {
                label:
                    'Отменена бизнесом',

                className:
                    'bg-[#FEF3F2] text-[#F04438]'
            };


        case 'cancelled':
        case 'canceled':

            return {
                label:
                    'Отменена',

                className:
                    'bg-[#FEF3F2] text-[#F04438]'
            };


        default:

            return {
                label:
                    status,

                className:
                    'bg-[#F2F4F7] text-[#667085]'
            };
    }
};


/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function Mybookings() {

    const navigate =
        useNavigate();


    const queryClient =
        useQueryClient();


    const [
        tab,
        setTab
    ] =
        useState<Tab>(
            'upcoming'
        );


    const [
        page,
        setPage
    ] =
        useState(
            1
        );


    const [
        cancellingId,
        setCancellingId
    ] =
        useState<
            number | null
        >(
            null
        );


    const [
        errorMessage,
        setErrorMessage
    ] =
        useState(
            ''
        );


    const [
        successMessage,
        setSuccessMessage
    ] =
        useState(
            ''
        );


    const [
        cancelBooking,
        setCancelBooking
    ] =
        useState<
            MyBooking | null
        >(
            null
        );


    const [
        rescheduleBooking,
        setRescheduleBooking
    ] =
        useState<
            MyBooking | null
        >(
            null
        );


    const [
        rescheduleError,
        setRescheduleError
    ] =
        useState(
            ''
        );


    /*
     * ========================================================
     * REVIEW
     * ========================================================
     */

    const [
        reviewBooking,
        setReviewBooking
    ] =
        useState<
            MyBooking | null
        >(
            null
        );


    const [
        reviewError,
        setReviewError
    ] =
        useState(
            ''
        );


    /*
     * ========================================================
     * LOCK PAGE SCROLL WHEN MODAL IS OPEN
     * ========================================================
     */

    useEffect(
        () => {

            const hasOpenModal =
                Boolean(
                    rescheduleBooking ||
                    cancelBooking ||
                    reviewBooking
                );


            if (
                !hasOpenModal
            ) {
                return;
            }


            const previousOverflow =
                document.body.style.overflow;


            const previousPaddingRight =
                document.body.style.paddingRight;


            const scrollbarWidth =
                window.innerWidth -
                document.documentElement.clientWidth;


            document.body.style.overflow =
                'hidden';


            if (
                scrollbarWidth > 0
            ) {
                document.body.style.paddingRight =
                    `${scrollbarWidth}px`;
            }


            return () => {

                document.body.style.overflow =
                    previousOverflow;


                document.body.style.paddingRight =
                    previousPaddingRight;
            };

        },
        [
            rescheduleBooking,
            cancelBooking,
            reviewBooking
        ]
    );


    /*
     * ========================================================
     * AUTO HIDE SUCCESS MESSAGE
     * ========================================================
     */

    useEffect(
        () => {

            if (
                !successMessage
            ) {
                return;
            }


            const timer =
                window.setTimeout(
                    () => {
                        setSuccessMessage(
                            ''
                        );
                    },
                    3500
                );


            return () =>
                window.clearTimeout(
                    timer
                );

        },
        [
            successMessage
        ]
    );


    /*
     * ========================================================
     * BOOKINGS
     * ========================================================
     */

    const {
        data:
            response,

        isLoading,

        isFetching,

        isError,

        error
    } =
        useQuery({

            queryKey: [
                'my-bookings',
                tab,
                page
            ],

            queryFn: () =>
                getMyBookings(
                    page,
                    tab
                ),

            placeholderData:
                previousData =>
                    previousData,

            retry:
                false
        });


    const bookings =
        response
            ?.data ??
        [];


    const pagination =
        response
            ?.pagination;


    /*
     * ========================================================
     * PAGINATION
     * ========================================================
     */

    const currentPage =
        pagination
            ?.current_page ??
        page;


    const totalPages =
        pagination
            ?.total_pages ??
        1;


    const totalCount =
        pagination
            ?.count ??
        0;


    const pageSize =
        pagination
            ?.page_size ??
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


                if (
                    currentPage <=
                    3
                ) {

                    return [
                        1,
                        2,
                        3,
                        4,
                        5
                    ];
                }


                if (
                    currentPage >=
                    totalPages -
                        2
                ) {

                    return [
                        totalPages -
                            4,

                        totalPages -
                            3,

                        totalPages -
                            2,

                        totalPages -
                            1,

                        totalPages
                    ];
                }


                return [
                    currentPage -
                        2,

                    currentPage -
                        1,

                    currentPage,

                    currentPage +
                        1,

                    currentPage +
                        2
                ];

            },
            [
                currentPage,
                totalPages
            ]
        );


    const handlePageChange =
        (
            newPage:
                number
        ) => {

            if (
                newPage <
                    1 ||
                newPage >
                    totalPages ||
                newPage ===
                    currentPage ||
                isFetching
            ) {
                return;
            }


            setPage(
                newPage
            );


            window.scrollTo({
                top:
                    0,

                behavior:
                    'smooth'
            });
        };

    const visibleBookings =
        bookings;

    /*
     * ========================================================
     * CANCEL
     * ========================================================
     */

    const cancelMutation =
        useMutation({

            mutationFn:
                cancelMyBooking,

            onMutate: (
                appointmentId
            ) => {

                setCancellingId(
                    appointmentId
                );

                setErrorMessage(
                    ''
                );
            },

            onSuccess:
                async () => {

                    await queryClient
                        .invalidateQueries({
                            queryKey: [
                                'my-bookings'
                            ]
                        });


                    setCancelBooking(
                        null
                    );


                    setErrorMessage(
                        ''
                    );


                    setSuccessMessage(
                        'Запись успешно отменена.'
                    );
                },

            onError: (
                error
            ) => {

                if (
                    axios.isAxiosError(
                        error
                    )
                ) {

                    const message =
                        error.response
                            ?.data
                            ?.message;


                    setErrorMessage(
                        typeof message ===
                            'string'
                            ? message
                            : 'Не удалось отменить запись.'
                    );

                    return;
                }


                setErrorMessage(
                    'Не удалось отменить запись.'
                );
            },

            onSettled: () => {

                setCancellingId(
                    null
                );
            }
        });


    const handleCancel =
        (
            booking:
                MyBooking
        ) => {

            if (
                !canCancel(
                    booking
                )
            ) {
                return;
            }


            setErrorMessage(
                ''
            );


            setCancelBooking(
                booking
            );
        };


    /*
     * ========================================================
     * RESCHEDULE
     * ========================================================
     */

    const rescheduleMutation =
        useMutation({

            mutationFn:
                rescheduleMyBooking,

            onMutate: () => {

                setRescheduleError(
                    ''
                );
            },

            onSuccess:
                async () => {

                    await queryClient
                        .invalidateQueries({
                            queryKey: [
                                'my-bookings'
                            ]
                        });


                    setRescheduleBooking(
                        null
                    );


                    setRescheduleError(
                        ''
                    );


                    setSuccessMessage(
                        'Запись успешно перенесена.'
                    );
                },

            onError: (
                error
            ) => {

                if (
                    axios.isAxiosError(
                        error
                    )
                ) {

                    const data =
                        error.response
                            ?.data as {
                                message?:
                                    string;

                                detail?:
                                    string;

                                start_at?:
                                    string[] |
                                    string;
                            } | undefined;


                    const startAtError =
                        Array.isArray(
                            data?.start_at
                        )
                            ? data
                                  ?.start_at
                                  ?.[0]
                            : data?.start_at;


                    setRescheduleError(
                        data?.message ??
                        data?.detail ??
                        startAtError ??
                        'Не удалось перенести запись.'
                    );

                    return;
                }


                setRescheduleError(
                    'Не удалось перенести запись.'
                );
            }
        });


    /*
     * ========================================================
     * CREATE REVIEW
     * ========================================================
     */

    const reviewMutation =
        useMutation({

            mutationFn:
                ({
                    appointment,
                    rating,
                    text
                }: {
                    appointment:
                        number;

                    rating:
                        number;

                    text:
                        string;
                }) =>
                    createReview({
                        appointment,
                        rating,
                        text
                    }),

            onMutate: () => {

                setReviewError(
                    ''
                );
            },

            onSuccess:
                async () => {

                    await Promise.all([

                        queryClient
                            .invalidateQueries({
                                queryKey: [
                                    'my-bookings'
                                ]
                            }),

                        queryClient
                            .invalidateQueries({
                                queryKey: [
                                    'reviews'
                                ]
                            }),

                        queryClient
                            .invalidateQueries({
                                queryKey: [
                                    'public-catalog'
                                ]
                            }),

                        queryClient
                            .invalidateQueries({
                                queryKey: [
                                    'favorite-businesses'
                                ]
                            })
                    ]);


                    setReviewBooking(
                        null
                    );


                    setReviewError(
                        ''
                    );


                    setSuccessMessage(
                        'Спасибо! Отзыв успешно опубликован.'
                    );
                },

            onError:
                (
                    error
                ) => {

                    if (
                        axios.isAxiosError(
                            error
                        )
                    ) {

                        const data =
                            error.response
                                ?.data as {
                                    message?:
                                        string;

                                    detail?:
                                        string;

                                    rating?:
                                        string[] |
                                        string;

                                    appointment?:
                                        string[] |
                                        string;

                                    text?:
                                        string[] |
                                        string;
                                } | undefined;


                        const getFieldError =
                            (
                                value:
                                    string[] |
                                    string |
                                    undefined
                            ) => {

                                if (
                                    Array.isArray(
                                        value
                                    )
                                ) {
                                    return (
                                        value[0] ??
                                        ''
                                    );
                                }


                                return (
                                    value ??
                                    ''
                                );
                            };


                        const fieldMessage =
                            getFieldError(
                                data?.rating
                            ) ||
                            getFieldError(
                                data?.appointment
                            ) ||
                            getFieldError(
                                data?.text
                            );


                        setReviewError(
                            data?.message ||
                            data?.detail ||
                            fieldMessage ||
                            'Не удалось отправить отзыв.'
                        );


                        return;
                    }


                    setReviewError(
                        'Не удалось отправить отзыв.'
                    );
                }
        });


    const handleOpenReview =
        (
            booking:
                MyBooking
        ) => {

            if (
                booking.status !==
                'completed' ||
                booking.has_review
            ) {
                return;
            }


            setReviewError(
                ''
            );


            setReviewBooking(
                booking
            );
        };


    /*
     * ========================================================
     * AUTH ERROR
     * ========================================================
     */

    const unauthorized =
        axios.isAxiosError(
            error
        ) &&
        (
            error.response
                ?.status ===
                401 ||
            error.response
                ?.status ===
                403
        );


    if (
        unauthorized
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[600px]
                    items-center
                    justify-center
                    bg-[#F7F8FD]
                    px-4
                "
            >
                <div
                    className="
                        w-full
                        max-w-[440px]
                        rounded-3xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        p-8
                        text-center
                        shadow-sm
                    "
                >

                    <CalendarDays
                        size={
                            42
                        }
                        className="
                            mx-auto
                            text-[#4F46E5]
                        "
                    />


                    <h1
                        className="
                            mt-5
                            text-xl
                            font-bold
                            text-slate-900
                        "
                    >
                        Войдите в аккаунт
                    </h1>


                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        Чтобы посмотреть свои записи,
                        необходимо авторизоваться.
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/auth/login'
                            )
                        }
                        className="
                            mt-6
                            w-full
                            cursor-pointer
                            rounded-xl
                            bg-[#4F46E5]
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#4338CA]
                        "
                    >
                        Войти
                    </button>

                </div>
            </div>
        );
    }


    /*
     * ========================================================
     * RENDER
     * ========================================================
     */

    return (
        <main
            className="
                min-h-screen
                bg-[#F7F8FD]
                px-4
                py-8
                sm:px-6
                lg:px-10
            "
        >

            {successMessage && (

                <div
                    className="
                        fixed
                        right-4
                        top-4
                        z-[10050]
                        flex
                        w-[calc(100%-2rem)]
                        max-w-[380px]
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-emerald-200
                        bg-white
                        px-4
                        py-4
                        shadow-xl
                        sm:right-6
                        sm:top-6
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-emerald-50
                            text-emerald-600
                        "
                    >
                        <CheckCircle2
                            size={20}
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
                                text-sm
                                font-semibold
                                text-slate-900
                            "
                        >
                            Готово
                        </div>

                        <div
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                            "
                        >
                            {successMessage}
                        </div>
                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setSuccessMessage(
                                ''
                            )
                        }
                        className="
                            cursor-pointer
                            rounded-lg
                            p-1
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                        "
                    >
                        <X
                            size={18}
                        />
                    </button>

                </div>

            )}


            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1200px]
                "
            >

                {/* HEADER */}

                <div
                    className="
                        mb-7
                    "
                >

                    <h1
                        className="
                            text-2xl
                            font-bold
                            text-slate-900
                            md:text-3xl
                        "
                    >
                        Мои записи
                    </h1>


                    <p
                        className="
                            mt-1.5
                            text-sm
                            text-slate-500
                        "
                    >
                        Здесь отображаются ваши записи
                        на услуги.
                    </p>

                </div>


                {/* TABS */}

                <div
                    className="
                        mb-6
                        inline-flex
                        rounded-xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        p-1
                    "
                >

                    <button
                        type="button"
                        onClick={() => {

                            setTab(
                                'upcoming'
                            );


                            setPage(
                                1
                            );
                        }}
                        className={`
                            cursor-pointer
                            rounded-lg
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            transition

                            ${
                                tab ===
                                'upcoming'
                                    ? `
                                        bg-[#4F46E5]
                                        text-white
                                    `
                                    : `
                                        text-slate-500
                                        hover:bg-[#F7F8FD]
                                    `
                            }
                        `}
                    >
                        Предстоящие
                    </button>


                    <button
                        type="button"
                        onClick={() => {

                            setTab(
                                'history'
                            );


                            setPage(
                                1
                            );
                        }}
                        className={`
                            cursor-pointer
                            rounded-lg
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            transition

                            ${
                                tab ===
                                'history'
                                    ? `
                                        bg-[#4F46E5]
                                        text-white
                                    `
                                    : `
                                        text-slate-500
                                        hover:bg-[#F7F8FD]
                                    `
                            }
                        `}
                    >
                        История
                    </button>

                </div>


                {/* ERROR */}

                {errorMessage && (

                    <div
                        className="
                            mb-5
                            flex
                            items-start
                            justify-between
                            gap-4
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-600
                        "
                    >

                        <span>
                            {errorMessage}
                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setErrorMessage(
                                    ''
                                )
                            }
                            className="
                                cursor-pointer
                            "
                        >
                            <X
                                size={
                                    17
                                }
                            />
                        </button>

                    </div>
                )}


                {/* LOADING */}

                {isLoading ? (

                    <div
                        className="
                            rounded-3xl
                            border
                            border-[#D9DDEC]
                            bg-white
                            px-6
                            py-16
                            text-center
                            text-sm
                            text-slate-500
                        "
                    >
                        Загружаем ваши записи...
                    </div>

                ) : isError ? (

                    <div
                        className="
                            rounded-3xl
                            border
                            border-red-200
                            bg-white
                            px-6
                            py-16
                            text-center
                        "
                    >

                        <div
                            className="
                                font-semibold
                                text-red-600
                            "
                        >
                            Не удалось загрузить записи
                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                queryClient
                                    .invalidateQueries({
                                        queryKey: [
                                            'my-bookings'
                                        ]
                                    })
                            }
                            className="
                                mt-4
                                cursor-pointer
                                text-sm
                                font-semibold
                                text-[#4F46E5]
                            "
                        >
                            Попробовать снова
                        </button>

                    </div>

                ) : visibleBookings.length ===
                  0 ? (

                    <div
                        className="
                            flex
                            min-h-[360px]
                            flex-col
                            items-center
                            justify-center
                            rounded-3xl
                            border
                            border-[#D9DDEC]
                            bg-white
                            px-6
                            text-center
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-full
                                bg-[#EEF2FF]
                                text-[#4F46E5]
                            "
                        >

                            <CalendarX2
                                size={
                                    28
                                }
                            />

                        </div>


                        <h2
                            className="
                                mt-5
                                text-lg
                                font-bold
                                text-slate-900
                            "
                        >
                            {tab ===
                            'upcoming'
                                ? 'Предстоящих записей нет'
                                : 'История пока пуста'}
                        </h2>


                        <p
                            className="
                                mt-2
                                max-w-[400px]
                                text-sm
                                leading-6
                                text-slate-500
                            "
                        >
                            {tab ===
                            'upcoming'
                                ? 'Выберите подходящую услугу в каталоге и запишитесь на удобное время.'
                                : 'Завершённые и отменённые записи будут отображаться здесь.'}
                        </p>


                        {tab ===
                            'upcoming' && (

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        '/catalog'
                                    )
                                }
                                className="
                                    mt-6
                                    cursor-pointer
                                    rounded-xl
                                    bg-[#4F46E5]
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-[#4338CA]
                                "
                            >
                                Перейти в каталог
                            </button>

                        )}

                    </div>

                ) : (

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                        "
                    >

                        {visibleBookings.map(
                            booking => {

                                const status =
                                    getStatus(
                                        booking.status
                                    );


                                const cancelling =
                                    cancellingId ===
                                    booking.id;


                                return (
                                    <article
                                        key={
                                            booking.id
                                        }
                                        className="
                                            overflow-hidden
                                            rounded-3xl
                                            border
                                            border-[#D9DDEC]
                                            bg-white
                                            shadow-sm
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                flex-col
                                                gap-5
                                                p-5
                                                md:p-6
                                                lg:flex-row
                                                lg:items-center
                                                lg:justify-between
                                            "
                                        >

                                            {/* LEFT */}

                                            <div
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-3
                                                    "
                                                >

                                                    <h2
                                                        className="
                                                            text-lg
                                                            font-bold
                                                            text-slate-900
                                                        "
                                                    >
                                                        {getServiceName(
                                                            booking
                                                        )}
                                                    </h2>


                                                    <span
                                                        className={`
                                                            inline-flex
                                                            rounded-full
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-semibold

                                                            ${status.className}
                                                        `}
                                                    >
                                                        {status.label}
                                                    </span>

                                                </div>


                                                <div
                                                    className="
                                                        mt-2
                                                        flex
                                                        items-center
                                                        gap-1.5
                                                        text-sm
                                                        text-slate-500
                                                    "
                                                >

                                                    <MapPin
                                                        size={
                                                            15
                                                        }
                                                    />

                                                    {getBusinessName(
                                                        booking
                                                    )}

                                                </div>


                                                <div
                                                    className="
                                                        mt-5
                                                        grid
                                                        grid-cols-1
                                                        gap-3
                                                        sm:grid-cols-2
                                                        lg:grid-cols-3
                                                    "
                                                >

                                                    <InfoItem
                                                        icon={
                                                            CalendarDays
                                                        }
                                                        label="Дата"
                                                        value={
                                                            formatDate(
                                                                booking.start_at
                                                            )
                                                        }
                                                    />


                                                    <InfoItem
                                                        icon={
                                                            Clock3
                                                        }
                                                        label="Время"
                                                        value={
                                                            formatTime(
                                                                booking.start_at
                                                            )
                                                        }
                                                    />


                                                    <InfoItem
                                                        icon={
                                                            UserRound
                                                        }
                                                        label="Мастер"
                                                        value={
                                                            getStaffName(
                                                                booking
                                                            )
                                                        }
                                                    />

                                                </div>


                                                {booking.comment && (

                                                    <div
                                                        className="
                                                            mt-4
                                                            rounded-xl
                                                            bg-[#F7F8FD]
                                                            px-4
                                                            py-3
                                                            text-xs
                                                            leading-5
                                                            text-slate-500
                                                        "
                                                    >
                                                        {booking.comment}
                                                    </div>

                                                )}

                                            </div>


                                            {/* RIGHT */}

                                            <div
                                                className="
                                                    flex
                                                    shrink-0
                                                    flex-row
                                                    items-center
                                                    justify-between
                                                    gap-5
                                                    border-t
                                                    border-[#EAECF0]
                                                    pt-5
                                                    lg:min-w-[210px]
                                                    lg:flex-col
                                                    lg:items-end
                                                    lg:border-l
                                                    lg:border-t-0
                                                    lg:pl-6
                                                    lg:pt-0
                                                "
                                            >

                                                <div
                                                    className="
                                                        text-right
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        Стоимость
                                                    </div>


                                                    <div
                                                        className="
                                                            mt-1
                                                            text-lg
                                                            font-bold
                                                            text-slate-900
                                                        "
                                                    >
                                                        {formatMoney(
                                                            booking.price
                                                        )}
                                                    </div>

                                                </div>


                                                <div
                                                    className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        justify-end
                                                        gap-2
                                                    "
                                                >

                                                    {booking.status ===
                                                        'completed' && (

                                                        booking.has_review ? (

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    rounded-xl
                                                                    border
                                                                    border-green-200
                                                                    bg-green-50
                                                                    px-4
                                                                    py-2.5
                                                                    text-sm
                                                                    font-semibold
                                                                    text-green-700
                                                                "
                                                            >

                                                                <CheckCircle2
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                                Отзыв оставлен

                                                            </div>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenReview(
                                                                        booking
                                                                    )
                                                                }
                                                                className="
                                                                    cursor-pointer
                                                                    rounded-xl
                                                                    bg-[#4F46E5]
                                                                    px-4
                                                                    py-2.5
                                                                    text-sm
                                                                    font-semibold
                                                                    text-white
                                                                    transition

                                                                    hover:bg-[#4338CA]
                                                                "
                                                            >
                                                                Оставить отзыв
                                                            </button>

                                                        )

                                                    )}


                                                    {canReschedule(
                                                        booking
                                                    ) && (

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setRescheduleError(
                                                                    ''
                                                                );

                                                                setRescheduleBooking(
                                                                    booking
                                                                );
                                                            }}
                                                            className="
                                                                flex
                                                                cursor-pointer
                                                                items-center
                                                                gap-2
                                                                rounded-xl
                                                                border
                                                                border-[#D9DDEC]
                                                                bg-white
                                                                px-4
                                                                py-2.5
                                                                text-sm
                                                                font-semibold
                                                                text-[#4F46E5]
                                                                transition
                                                                hover:border-[#4F46E5]
                                                                hover:bg-[#EEF2FF]
                                                            "
                                                        >

                                                            <CalendarClock
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                            Перенести

                                                        </button>

                                                    )}


                                                    {canCancel(
                                                        booking
                                                    ) && (

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                cancelling
                                                            }
                                                            onClick={() =>
                                                                handleCancel(
                                                                    booking
                                                                )
                                                            }
                                                            className="
                                                                cursor-pointer
                                                                rounded-xl
                                                                border
                                                                border-red-200
                                                                bg-white
                                                                px-4
                                                                py-2.5
                                                                text-sm
                                                                font-semibold
                                                                text-red-600
                                                                transition
                                                                hover:bg-red-50
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                            "
                                                        >
                                                            {cancelling
                                                                ? 'Отменяем...'
                                                                : 'Отменить'}
                                                        </button>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}


                {/* PAGINATION */}

                {!isLoading &&
                    totalCount >
                        0 && (

                    <div
                        className="
                            mt-6
                            flex
                            flex-col
                            gap-4
                            rounded-2xl
                            border
                            border-[#D9DDEC]
                            bg-white
                            px-4
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            sm:px-5
                        "
                    >

                        <div
                            className="
                                text-sm
                                font-medium
                                text-[#667085]
                            "
                        >
                            Показано{' '}

                            <span
                                className="
                                    font-semibold
                                    text-slate-800
                                "
                            >
                                {firstItem}
                                –
                                {lastItem}
                            </span>

                            {' '}из{' '}

                            <span
                                className="
                                    font-semibold
                                    text-slate-800
                                "
                            >
                                {totalCount}
                            </span>

                            {' '}записей
                        </div>


                        {totalPages >
                            1 && (

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
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
                                        handlePageChange(
                                            currentPage -
                                                1
                                        )
                                    }
                                    className="
                                        flex
                                        h-9
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        gap-1
                                        rounded-lg
                                        border
                                        border-[#D9DDEC]
                                        bg-white
                                        px-3
                                        text-sm
                                        font-medium
                                        text-[#667085]
                                        transition
                                        hover:border-[#4F46E5]
                                        hover:text-[#4F46E5]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <ChevronLeft
                                        size={
                                            16
                                        }
                                    />

                                    <span
                                        className="
                                            hidden
                                            sm:inline
                                        "
                                    >
                                        Пред.
                                    </span>
                                </button>


                                {pageNumbers.map(
                                    pageNumber => {

                                        const active =
                                            pageNumber ===
                                            currentPage;


                                        return (
                                            <button
                                                key={
                                                    pageNumber
                                                }
                                                type="button"
                                                disabled={
                                                    active ||
                                                    isFetching
                                                }
                                                onClick={() =>
                                                    handlePageChange(
                                                        pageNumber
                                                    )
                                                }
                                                className={`
                                                    flex
                                                    h-9
                                                    min-w-9
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    text-sm
                                                    font-medium
                                                    transition

                                                    ${
                                                        active
                                                            ? `
                                                                cursor-default
                                                                border-[#4F46E5]
                                                                bg-[#4F46E5]
                                                                text-white
                                                            `
                                                            : `
                                                                cursor-pointer
                                                                border-[#D9DDEC]
                                                                bg-white
                                                                text-[#667085]
                                                                hover:border-[#4F46E5]
                                                                hover:text-[#4F46E5]
                                                            `
                                                    }

                                                    disabled:opacity-60
                                                `}
                                            >
                                                {
                                                    pageNumber
                                                }
                                            </button>
                                        );
                                    }
                                )}


                                <button
                                    type="button"
                                    disabled={
                                        currentPage >=
                                            totalPages ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            currentPage +
                                                1
                                        )
                                    }
                                    className="
                                        flex
                                        h-9
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        gap-1
                                        rounded-lg
                                        border
                                        border-[#D9DDEC]
                                        bg-white
                                        px-3
                                        text-sm
                                        font-medium
                                        text-[#667085]
                                        transition
                                        hover:border-[#4F46E5]
                                        hover:text-[#4F46E5]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <span
                                        className="
                                            hidden
                                            sm:inline
                                        "
                                    >
                                        След.
                                    </span>

                                    <ChevronRight
                                        size={
                                            16
                                        }
                                    />
                                </button>

                            </div>

                        )}

                    </div>

                )}


                {isFetching &&
                    !isLoading && (

                    <div
                        className="
                            mt-4
                            text-center
                            text-xs
                            text-slate-400
                        "
                    >
                        Обновляем данные...
                    </div>

                )}

            </div>


            {cancelBooking && (

                <CancelBookingModal
                    booking={
                        cancelBooking
                    }
                    isPending={
                        cancelMutation
                            .isPending
                    }
                    errorMessage={
                        errorMessage
                    }
                    onClose={() => {

                        if (
                            cancelMutation
                                .isPending
                        ) {
                            return;
                        }


                        setCancelBooking(
                            null
                        );


                        setErrorMessage(
                            ''
                        );
                    }}
                    onConfirm={() => {

                        cancelMutation.mutate(
                            cancelBooking.id
                        );
                    }}
                />

            )}


            {rescheduleBooking && (

                <RescheduleBookingModal

                    booking={
                        rescheduleBooking
                    }

                    isPending={
                        rescheduleMutation
                            .isPending
                    }

                    errorMessage={
                        rescheduleError
                    }

                    onClose={() => {

                        if (
                            rescheduleMutation
                                .isPending
                        ) {
                            return;
                        }


                        setRescheduleBooking(
                            null
                        );


                        setRescheduleError(
                            ''
                        );
                    }}

                    onSubmit={(
                        startAt
                    ) => {

                        rescheduleMutation.mutate({
                            appointmentId:
                                rescheduleBooking.id,

                            startAt
                        });
                    }}

                />

            )}


            {reviewBooking && (

                <ReviewBookingModal
                    booking={
                        reviewBooking
                    }

                    isPending={
                        reviewMutation
                            .isPending
                    }

                    errorMessage={
                        reviewError
                    }

                    onClose={() => {

                        if (
                            reviewMutation
                                .isPending
                        ) {
                            return;
                        }


                        setReviewBooking(
                            null
                        );


                        setReviewError(
                            ''
                        );
                    }}

                    onSubmit={(
                        rating,
                        text
                    ) => {

                        reviewMutation.mutate({
                            appointment:
                                reviewBooking.id,

                            rating,

                            text
                        });
                    }}
                />

            )}

        </main>
    );
}


/*
 * ============================================================
 * INFO
 * ============================================================
 */

interface InfoItemProps {
    icon:
        React.ComponentType<{
            size?: number;

            className?: string;
        }>;

    label:
        string;

    value:
        string;
}


function InfoItem({
    icon: Icon,
    label,
    value
}: InfoItemProps) {

    return (
        <div
            className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-[#F7F8FD]
                px-3.5
                py-3
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
                    rounded-xl
                    bg-white
                    text-[#4F46E5]
                "
            >
                <Icon
                    size={
                        17
                    }
                />
            </div>


            <div
                className="
                    min-w-0
                "
            >

                <div
                    className="
                        text-[10px]
                        text-slate-400
                    "
                >
                    {label}
                </div>


                <div
                    className="
                        mt-0.5
                        truncate
                        text-xs
                        font-semibold
                        text-slate-700
                    "
                >
                    {value}
                </div>

            </div>

        </div>
    );
}
import {
    useMemo,
    useState
} from 'react';

import {
    useMutation,
    useQuery
} from '@tanstack/react-query';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    ArrowLeft,
    CalendarDays,
    Check,
    Clock3,
    MapPin,
    Phone,
    Scissors,
    Search,
    UserRound
} from 'lucide-react';

import type {
    AxiosError
} from 'axios';

import {
    createBooking,
    getBookingBusiness,
    getBookingServices,
    getBookingStaff,
    type BookingService,
    type BookingStaff
} from '../../../api/booking';

import {
    getAvailabilityDates,
    getDayAvailability
} from '../../../api/scheduling';

import BusinessReviews
    from '../../../components/organisms/Reviews/BusinessReviews';
    
/*
 * ============================================================
 * TYPES
 * ============================================================
 */

interface AvailabilityDate {
    date: string;

    is_available: boolean;

    available_slots_count: number;
}


interface AvailabilitySlot {
    start_at: string;

    end_at?: string;

    is_available: boolean;
}


interface ApiErrorData {
    message?: string;

    detail?: string;

    non_field_errors?: string[];

    [key: string]:
        unknown;
}


type BookingServiceWithCategory =
    BookingService & {
        category_name?: string | null;
    };

const formatPhone = (
    value: string
) => {
    let digits =
        value.replace(
            /\D/g,
            ''
        );

    if (
        digits.startsWith('8')
    ) {
        digits =
            '7' +
            digits.slice(1);
    }

    if (
        !digits.startsWith('7')
    ) {
        digits =
            '7' +
            digits;
    }

    digits =
        digits.slice(
            0,
            11
        );

    const number =
        digits.slice(1);

    let result = '+7';

    if (
        number.length > 0
    ) {
        result +=
            ` ${number.slice(0, 3)}`;
    }

    if (
        number.length > 3
    ) {
        result +=
            ` ${number.slice(3, 6)}`;
    }

    if (
        number.length > 6
    ) {
        result +=
            ` ${number.slice(6, 8)}`;
    }

    if (
        number.length > 8
    ) {
        result +=
            ` ${number.slice(8, 10)}`;
    }

    return result;
};

const getServiceCategoryName = (
    service: BookingService
) => {

    const categoryName =
        (
            service as
                BookingServiceWithCategory
        )
            .category_name
            ?.trim();


    return (
        categoryName ||
        'Другие услуги'
    );
};


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';


const formatMoney = (
    value: string | number
) => {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {
        return '0 ₸';
    }


    return new Intl.NumberFormat(
        'ru-RU'
    ).format(
        number
    ) + ' ₸';
};


const getLocalDate = (
    date = new Date()
) => {

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


    return `${year}-${month}-${day}`;
};


const parseLocalDate = (
    value: string
) => {

    const [
        year,
        month,
        day
    ] =
        value
            .split('-')
            .map(
                Number
            );


    return new Date(
        year,
        month - 1,
        day
    );
};


const formatDayNumber = (
    value: string
) => {

    return parseLocalDate(
        value
    ).toLocaleDateString(
        'ru-RU',
        {
            day:
                'numeric'
        }
    );
};


const formatMonth = (
    value: string
) => {

    return parseLocalDate(
        value
    ).toLocaleDateString(
        'ru-RU',
        {
            month:
                'short'
        }
    );
};


const formatWeekday = (
    value: string
) => {

    return parseLocalDate(
        value
    ).toLocaleDateString(
        'ru-RU',
        {
            weekday:
                'short'
        }
    );
};


const formatFullDate = (
    value: string
) => {

    if (
        !value
    ) {
        return 'Не выбрано';
    }


    return parseLocalDate(
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
    startAt: string
) => {

    if (
        !startAt
    ) {
        return '';
    }


    return new Date(
        startAt
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


const getHour = (
    startAt: string
) => {

    return new Date(
        startAt
    ).getHours();
};


const getPhotoUrl = (
    photo?: string | null
): string | null => {

    if (
        !photo
    ) {
        return null;
    }


    if (
        photo.startsWith(
            'http://'
        ) ||
        photo.startsWith(
            'https://'
        )
    ) {
        return photo;
    }


    if (
        photo.startsWith(
            '/'
        )
    ) {
        return `${BACKEND_URL}${photo}`;
    }


    return `${BACKEND_URL}/${photo}`;
};


const getInitials = (
    firstName: string,
    lastName: string
) => {

    return (
        `${
            firstName
                ?.charAt(
                    0
                ) ??
            ''
        }${
            lastName
                ?.charAt(
                    0
                ) ??
            ''
        }`
    )
        .toUpperCase();
};


const getApiErrorMessage = (
    error: unknown
) => {

    const axiosError =
        error as AxiosError<ApiErrorData>;


    if (
        axiosError.response
            ?.status ===
        401
    ) {
        return 'Для записи необходимо войти в аккаунт.';
    }


    const data =
        axiosError.response
            ?.data;


    if (
        data?.message
    ) {
        return data.message;
    }


    if (
        data?.detail
    ) {
        return data.detail;
    }


    if (
        Array.isArray(
            data?.non_field_errors
        )
    ) {
        return data
            .non_field_errors
            .join(
                ' '
            );
    }


    if (
        data &&
        typeof data ===
            'object'
    ) {

        for (
            const value
            of Object.values(
                data
            )
        ) {

            if (
                Array.isArray(
                    value
                ) &&
                value.length > 0
            ) {
                return String(
                    value[0]
                );
            }


            if (
                typeof value ===
                    'string'
            ) {
                return value;
            }
        }
    }


    return 'Не удалось создать запись. Попробуйте ещё раз.';
};


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function BookingControl() {

    const navigate =
        useNavigate();


    const {
        businessId:
            businessIdParam
    } =
        useParams<{
            businessId: string;
        }>();


    const businessId =
        Number(
            businessIdParam
        );


    const validBusinessId =
        Number.isInteger(
            businessId
        ) &&
        businessId > 0;


    /*
     * ========================================================
     * STATE
     * ========================================================
     */

    const [
        selectedServiceId,
        setSelectedServiceId
    ] =
        useState<
            number | null
        >(
            null
        );


    /*
     * ========================================================
     * SERVICE PICKER
     * ========================================================
     */

    const [
        serviceSearch,
        setServiceSearch
    ] =
        useState(
            ''
        );


    const [
        selectedServiceCategory,
        setSelectedServiceCategory
    ] =
        useState(
            'all'
        );


    const [
        isServicePickerOpen,
        setIsServicePickerOpen
    ] =
        useState(
            true
        );


    const [
        visibleServicesCount,
        setVisibleServicesCount
    ] =
        useState(
            4
        );


    const [
        selectedMasterId,
        setSelectedMasterId
    ] =
        useState<
            number | null
        >(
            null
        );


    const [
        selectedAddonIds,
        setSelectedAddonIds
    ] =
        useState<number[]>(
            []
        );


    const [
        isAddonsExpanded,
        setIsAddonsExpanded
    ] =
        useState(
            false
        );


    const [
        selectedDate,
        setSelectedDate
    ] =
        useState(
            ''
        );


    const [
        selectedStartAt,
        setSelectedStartAt
    ] =
        useState(
            ''
        );


    const [
        firstName,
        setFirstName
    ] =
        useState(
            ''
        );


    const [
        lastName,
        setLastName
    ] =
        useState(
            ''
        );


    const [
        phone,
        setPhone
    ] =
        useState(
            ''
        );


    const [
        comment,
        setComment
    ] =
        useState(
            ''
        );


    const [
        errorMessage,
        setErrorMessage
    ] =
        useState(
            ''
        );


    const [
        createdAppointmentId,
        setCreatedAppointmentId
    ] =
        useState<
            number | null
        >(
            null
        );


    /*
     * ========================================================
     * TODAY
     * ========================================================
     */

    const today =
        useMemo(
            () =>
                getLocalDate(),
            []
        );


    /*
     * ========================================================
     * BUSINESS
     * ========================================================
     */

    const {
        data:
            business,

        isLoading:
            isBusinessLoading,

        isError:
            isBusinessError
    } =
        useQuery({

            queryKey: [
                'booking-business',
                businessId
            ],

            queryFn: () =>
                getBookingBusiness(
                    businessId
                ),

            enabled:
                validBusinessId,

            retry:
                false
        });


    /*
     * ========================================================
     * SERVICES
     * ========================================================
     */

    const {
        data:
            services = [],

        isLoading:
            isServicesLoading,

        isError:
            isServicesError
    } =
        useQuery({

            queryKey: [
                'booking-services',
                businessId
            ],

            queryFn: () =>
                getBookingServices(
                    businessId
                ),

            enabled:
                validBusinessId,

            retry:
                false
        });


    /*
     * ========================================================
     * SERVICE PICKER DATA
     * ========================================================
     */

    const serviceCategories =
        useMemo(
            () => {

                const categories:
                    string[] =
                    services.map(
                        service =>
                            getServiceCategoryName(
                                service
                            )
                    );


                return Array.from(
                    new Set(
                        categories
                    )
                ).sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second,
                            'ru'
                        )
                );
            },
            [
                services
            ]
        );


    const filteredServices =
        useMemo(
            () => {

                const normalizedSearch =
                    serviceSearch
                        .trim()
                        .toLowerCase();


                return services.filter(
                    service => {

                        const categoryName =
                            getServiceCategoryName(
                                service
                            );


                        const matchesCategory =
                            selectedServiceCategory ===
                                'all' ||
                            categoryName ===
                                selectedServiceCategory;


                        if (
                            !matchesCategory
                        ) {
                            return false;
                        }


                        if (
                            !normalizedSearch
                        ) {
                            return true;
                        }


                        const haystack = [
                            service.name,
                            service.description ??
                                '',
                            categoryName
                        ]
                            .join(
                                ' '
                            )
                            .toLowerCase();


                        return haystack.includes(
                            normalizedSearch
                        );
                    }
                );
            },
            [
                services,
                serviceSearch,
                selectedServiceCategory
            ]
        );


    const visibleServices =
        useMemo(
            () =>
                filteredServices.slice(
                    0,
                    visibleServicesCount
                ),
            [
                filteredServices,
                visibleServicesCount
            ]
        );


    const remainingServicesCount =
        Math.max(
            filteredServices.length -
                visibleServices.length,
            0
        );


    /*
     * ========================================================
     * STAFF
     * ========================================================
     */

    const {
        data:
            masters = [],

        isLoading:
            isMastersLoading,

        isError:
            isMastersError
    } =
        useQuery({

            queryKey: [
                'booking-staff',
                businessId,
                selectedServiceId
            ],

            queryFn: () =>
                getBookingStaff(
                    businessId,
                    selectedServiceId!
                ),

            enabled:
                validBusinessId &&
                selectedServiceId !==
                    null,

            retry:
                false
        });


    /*
     * ========================================================
     * DATES
     * ========================================================
     */

    const bookingDaysAhead =
        business
            ?.booking_days_ahead ??
        30;


    const {
        data:
            datesResponse,

        isLoading:
            isDatesLoading,

        isError:
            isDatesError
    } =
        useQuery({

            queryKey: [
                'booking-dates',
                selectedMasterId,
                selectedServiceId,
                selectedAddonIds,
                today,
                bookingDaysAhead
            ],

            queryFn: () =>
                getAvailabilityDates(
                    selectedMasterId!,
                    selectedServiceId!,
                    today,
                    bookingDaysAhead,
                    selectedAddonIds
                ),

            enabled:
                selectedMasterId !==
                    null &&
                selectedServiceId !==
                    null,

            retry:
                false
        });


    const availableDates =
        useMemo(
            () => {

                const dates:
                    AvailabilityDate[] =
                    datesResponse
                        ?.data ??
                    [];


                return dates.filter(
                    item =>
                        item.is_available &&
                        item
                            .available_slots_count >
                            0
                );

            },
            [
                datesResponse
            ]
        );


    /*
     * ========================================================
     * SLOTS
     * ========================================================
     */

    const {
        data:
            dayResponse,

        isLoading:
            isSlotsLoading,

        isError:
            isSlotsError
    } =
        useQuery({

            queryKey: [
                'booking-slots',
                selectedMasterId,
                selectedServiceId,
                selectedAddonIds,
                selectedDate
            ],

            queryFn: () =>
                getDayAvailability(
                    selectedMasterId!,
                    selectedServiceId!,
                    selectedDate,
                    selectedAddonIds
                ),

            enabled:
                selectedMasterId !==
                    null &&
                selectedServiceId !==
                    null &&
                Boolean(
                    selectedDate
                ),

            retry:
                false
        });


    const slots:
        AvailabilitySlot[] =
        dayResponse
            ?.data
            ?.slots ??
        [];


    /*
     * ========================================================
     * SELECTED OBJECTS
     * ========================================================
     */

    const selectedService =
        useMemo<
            BookingService | undefined
        >(
            () =>
                services.find(
                    service =>
                        service.id ===
                        selectedServiceId
                ),
            [
                services,
                selectedServiceId
            ]
        );


    const selectedAddons =
        useMemo(
            () => {

                if (
                    !selectedService
                ) {
                    return [];
                }


                return (
                    selectedService
                        .addons ??
                    []
                ).filter(
                    addon =>
                        addon.is_active &&
                        selectedAddonIds.includes(
                            addon.id
                        )
                );
            },
            [
                selectedService,
                selectedAddonIds
            ]
        );


    const availableAddons =
        useMemo(
            () => {

                if (
                    !selectedService
                ) {
                    return [];
                }


                return (
                    selectedService
                        .addons ??
                    []
                ).filter(
                    addon =>
                        addon.is_active
                );
            },
            [
                selectedService
            ]
        );


    /*
     * ========================================================
     * COMPACT ADDONS
     * ========================================================
     *
     * В свернутом состоянии показываем максимум 4 позиции,
     * но уже выбранные дополнения всегда оставляем видимыми.
     */

    const visibleAddons =
        useMemo(
            () => {

                if (
                    isAddonsExpanded
                ) {
                    return availableAddons;
                }


                const selected =
                    availableAddons.filter(
                        addon =>
                            selectedAddonIds.includes(
                                addon.id
                            )
                    );


                const unselected =
                    availableAddons.filter(
                        addon =>
                            !selectedAddonIds.includes(
                                addon.id
                            )
                    );


                const freePlaces =
                    Math.max(
                        4 -
                            selected.length,
                        0
                    );


                return [
                    ...selected,
                    ...unselected.slice(
                        0,
                        freePlaces
                    )
                ];
            },
            [
                availableAddons,
                selectedAddonIds,
                isAddonsExpanded
            ]
        );


    const hiddenAddonsCount =
        Math.max(
            availableAddons.length -
                visibleAddons.length,
            0
        );


    const addonsTotalPrice =
        useMemo(
            () =>
                selectedAddons.reduce(
                    (
                        total,
                        addon
                    ) =>
                        total +
                        Number(
                            addon.price
                        ),
                    0
                ),
            [
                selectedAddons
            ]
        );


    const addonsTotalDuration =
        useMemo(
            () =>
                selectedAddons.reduce(
                    (
                        total,
                        addon
                    ) =>
                        total +
                        addon.duration_minutes,
                    0
                ),
            [
                selectedAddons
            ]
        );


    const totalPrice =
        (
            selectedService
                ? Number(
                    selectedService.price
                )
                : 0
        ) +
        addonsTotalPrice;


    const totalDuration =
        (
            selectedService
                ?.duration_minutes ??
            0
        ) +
        addonsTotalDuration;


    const selectedMaster =
        useMemo<
            BookingStaff | undefined
        >(
            () =>
                masters.find(
                    master =>
                        master.id ===
                        selectedMasterId
                ),
            [
                masters,
                selectedMasterId
            ]
        );


    /*
     * ========================================================
     * SLOT GROUPS
     * ========================================================
     */

    const morningSlots =
        useMemo(
            () =>
                slots.filter(
                    slot =>
                        getHour(
                            slot.start_at
                        ) <
                        12
                ),
            [
                slots
            ]
        );


    const daySlots =
        useMemo(
            () =>
                slots.filter(
                    slot =>
                        getHour(
                            slot.start_at
                        ) >=
                            12 &&
                        getHour(
                            slot.start_at
                        ) <
                            18
                ),
            [
                slots
            ]
        );


    const eveningSlots =
        useMemo(
            () =>
                slots.filter(
                    slot =>
                        getHour(
                            slot.start_at
                        ) >=
                        18
                ),
            [
                slots
            ]
        );


    /*
     * ========================================================
     * SELECT SERVICE
     * ========================================================
     */

    const handleSelectService =
        (
            serviceId: number
        ) => {

            setSelectedServiceId(
                serviceId
            );


            setSelectedAddonIds(
                []
            );


            setIsAddonsExpanded(
                false
            );


            setSelectedMasterId(
                null
            );


            setSelectedDate(
                ''
            );


            setSelectedStartAt(
                ''
            );


            setErrorMessage(
                ''
            );


            setIsServicePickerOpen(
                false
            );
        };


    /*
     * ========================================================
     * TOGGLE ADDON
     * ========================================================
     */

    const handleToggleAddon =
        (
            addonId: number
        ) => {

            setSelectedAddonIds(
                current => {

                    if (
                        current.includes(
                            addonId
                        )
                    ) {

                        return current.filter(
                            id =>
                                id !== addonId
                        );
                    }


                    return [
                        ...current,
                        addonId
                    ];
                }
            );


            setSelectedDate(
                ''
            );


            setSelectedStartAt(
                ''
            );


            setErrorMessage(
                ''
            );
        };


    /*
     * ========================================================
     * SELECT MASTER
     * ========================================================
     */

    const handleSelectMaster =
        (
            masterId: number
        ) => {

            setSelectedMasterId(
                masterId
            );


            setSelectedDate(
                ''
            );


            setSelectedStartAt(
                ''
            );


            setErrorMessage(
                ''
            );
        };


    /*
     * ========================================================
     * SELECT DATE
     * ========================================================
     */

    const handleSelectDate =
        (
            date: string
        ) => {

            setSelectedDate(
                date
            );


            setSelectedStartAt(
                ''
            );


            setErrorMessage(
                ''
            );
        };


    /*
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    const canSubmit =
        Boolean(
            business &&
            selectedService &&
            selectedMaster &&
            selectedDate &&
            selectedStartAt &&
            firstName.trim() &&
            lastName.trim() &&
            phone.trim()
        );


    /*
     * ========================================================
     * CREATE
     * ========================================================
     */

    const createMutation =
        useMutation({

            mutationFn:
                async () => {

                    if (
                        !selectedService ||
                        !selectedMaster ||
                        !selectedStartAt ||
                        !firstName.trim() ||
                        !lastName.trim() ||
                        !phone.trim()
                    ) {
                        throw new Error(
                            'Заполните обязательные данные записи.'
                        );
                    }


                    return createBooking({
                        business:
                            businessId,

                        staff:
                            selectedMaster.id,

                        service:
                            selectedService.id,

                        addon_ids:
                            selectedAddonIds,

                        /*
                         * start_at приходит от backend
                         * уже с timezone.
                         *
                         * Не преобразуем через
                         * toISOString().
                         */
                        start_at:
                            selectedStartAt,

                        client_first_name:
                            firstName.trim(),

                        client_last_name:
                            lastName.trim(),

                        client_phone:
                            phone.trim(),

                        comment:
                            comment.trim()
                    });
                },


            onMutate: () => {

                setErrorMessage(
                    ''
                );
            },


            onSuccess: (
                response
            ) => {

                setCreatedAppointmentId(
                    response.data.id
                );
            },


            onError: (
                error
            ) => {

                setErrorMessage(
                    getApiErrorMessage(
                        error
                    )
                );
            }
        });



    /*
     * ========================================================
     * SUBMIT
     * ========================================================
     */

    const handleSubmit =
        () => {

            if (
                !canSubmit ||
                createMutation.isPending
            ) {
                return;
            }


            createMutation.mutate();
        };


    /*
     * ========================================================
     * INVALID BUSINESS
     * ========================================================
     */

    if (
        !validBusinessId
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[600px]
                    items-center
                    justify-center
                    px-4
                "
            >
                <div
                    className="
                        rounded-2xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        px-8
                        py-7
                        text-center
                        shadow-sm
                    "
                >
                    <p
                        className="
                            text-lg
                            font-semibold
                            text-slate-900
                        "
                    >
                        Бизнес не найден
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/catalog'
                            )
                        }
                        className="
                            mt-5
                            cursor-pointer
                            rounded-xl
                            bg-[#4F46E5]
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        Вернуться в каталог
                    </button>
                </div>
            </div>
        );
    }


    /*
     * ========================================================
     * BUSINESS LOADING
     * ========================================================
     */

    if (
        isBusinessLoading
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[600px]
                    items-center
                    justify-center
                    text-sm
                    text-slate-500
                "
            >
                Загрузка...
            </div>
        );
    }


    /*
     * ========================================================
     * BUSINESS ERROR
     * ========================================================
     */

    if (
        isBusinessError ||
        !business
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[600px]
                    items-center
                    justify-center
                    px-4
                "
            >
                <div
                    className="
                        rounded-2xl
                        border
                        border-red-200
                        bg-white
                        px-8
                        py-7
                        text-center
                    "
                >
                    <p
                        className="
                            font-semibold
                            text-red-600
                        "
                    >
                        Не удалось загрузить бизнес.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/catalog'
                            )
                        }
                        className="
                            mt-5
                            cursor-pointer
                            text-sm
                            font-semibold
                            text-[#4F46E5]
                        "
                    >
                        Вернуться в каталог
                    </button>
                </div>
            </div>
        );
    }


    /*
     * ========================================================
     * SUCCESS
     * ========================================================
     */

    if (
        createdAppointmentId !==
        null
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[650px]
                    items-center
                    justify-center
                    px-4
                "
            >
                <div
                    className="
                        w-full
                        max-w-[520px]
                        rounded-3xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        p-8
                        text-center
                        shadow-sm
                    "
                >
                    <div
                        className="
                            mx-auto
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-green-50
                            text-green-600
                        "
                    >
                        <Check
                            size={
                                30
                            }
                        />
                    </div>

                    <h1
                        className="
                            mt-5
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        Запись создана
                    </h1>

                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        Ваша запись успешно отправлена.
                        Номер записи: #{createdAppointmentId}
                    </p>

                    <div
                        className="
                            mt-6
                            rounded-2xl
                            bg-[#F7F8FD]
                            p-5
                            text-left
                        "
                    >
                        <SummaryLine
                            label="Бизнес"
                            value={
                                business.name
                            }
                        />

                        <SummaryLine
                            label="Услуга"
                            value={
                                selectedService
                                    ?.name ??
                                '—'
                            }
                        />

                        {selectedAddons.length > 0 && (

                            <SummaryLine
                                label="Дополнительно"
                                value={
                                    selectedAddons
                                        .map(
                                            addon =>
                                                addon.name
                                        )
                                        .join(
                                            ', '
                                        )
                                }
                            />

                        )}


                        <SummaryLine
                            label="Стоимость"
                            value={
                                formatMoney(
                                    totalPrice
                                )
                            }
                        />


                        <SummaryLine
                            label="Длительность"
                            value={
                                `${totalDuration} мин`
                            }
                        />

                        <SummaryLine
                            label="Мастер"
                            value={
                                selectedMaster
                                    ? `${
                                          selectedMaster.first_name
                                      } ${
                                          selectedMaster.last_name
                                      }`
                                    : '—'
                            }
                        />

                        <SummaryLine
                            label="Дата"
                            value={
                                formatFullDate(
                                    selectedDate
                                )
                            }
                        />

                        <SummaryLine
                            label="Время"
                            value={
                                formatTime(
                                    selectedStartAt
                                )
                            }
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/catalog'
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
                        Вернуться в каталог
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
        <div
            className="
                mx-auto
                w-full
                max-w-[1500px]
                px-4
                py-8
                md:px-6
                lg:py-10
            "
        >

            {/* HEADER */}

            <div
                className="
                    mb-7
                    flex
                    items-center
                    gap-4
                "
            >
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/catalog'
                        )
                    }
                    className="
                        flex
                        h-10
                        w-10
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        text-slate-600
                        transition
                        hover:text-[#4F46E5]
                    "
                >
                    <ArrowLeft
                        size={
                            19
                        }
                    />
                </button>

                <div>
                    <h1
                        className="
                            text-2xl
                            font-bold
                            text-slate-900
                            md:text-3xl
                        "
                    >
                        Онлайн-запись
                    </h1>

                    <div
                        className="
                            mt-1
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

                        <span>
                            {business.name}

                            {business.address
                                ? ` · ${business.address}`
                                : ''}
                        </span>
                    </div>
                </div>
            </div>


            <div
                className="
                    grid
                    grid-cols-1
                    items-start
                    gap-6
                    xl:grid-cols-[minmax(0,1fr)_380px]
                "
            >

                {/* LEFT */}

                <div
                    className="
                        flex
                        min-w-0
                        flex-col
                        gap-6
                    "
                >

                    {/* SERVICES */}

                    <BookingSection
                        number={
                            1
                        }
                        title={
                            selectedService
                                ? 'Услуга'
                                : 'Выберите услугу'
                        }
                    >

                        {isServicesLoading ? (

                            <LoadingText
                                text="Загрузка услуг..."
                            />

                        ) : isServicesError ? (

                            <ErrorText
                                text="Не удалось загрузить услуги."
                            />

                        ) : services.length ===
                          0 ? (

                            <EmptyText
                                text="У бизнеса пока нет доступных услуг."
                            />

                        ) : selectedService &&
                          !isServicePickerOpen ? (

                            /*
                             * После выбора скрываем большой список
                             * и оставляем только компактное резюме.
                             */

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-[#CFCBF8]
                                    bg-[#F7F7FF]
                                    p-3.5
                                    sm:p-4
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
                                        rounded-full
                                        bg-[#4F46E5]
                                        text-white
                                    "
                                >
                                    <Check
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
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-slate-900
                                            sm:text-[15px]
                                        "
                                    >
                                        {
                                            selectedService.name
                                        }
                                    </div>


                                    <div
                                        className="
                                            mt-1
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-x-3
                                            gap-y-1
                                            text-xs
                                            text-slate-500
                                        "
                                    >

                                        <span
                                            className="
                                                flex
                                                items-center
                                                gap-1
                                            "
                                        >
                                            <Clock3
                                                size={
                                                    13
                                                }
                                            />

                                            {
                                                selectedService
                                                    .duration_minutes
                                            }{' '}
                                            мин
                                        </span>


                                        <span
                                            className="
                                                font-semibold
                                                text-[#4F46E5]
                                            "
                                        >
                                            {formatMoney(
                                                selectedService.price
                                            )}
                                        </span>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={() => {

                                        setIsServicePickerOpen(
                                            true
                                        );

                                        setVisibleServicesCount(
                                            4
                                        );
                                    }}
                                    className="
                                        shrink-0
                                        cursor-pointer
                                        rounded-lg
                                        px-2.5
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-[#4F46E5]
                                        transition
                                        hover:bg-[#ECEBFF]
                                        sm:px-3
                                        sm:text-sm
                                    "
                                >
                                    Изменить
                                </button>

                            </div>

                        ) : (

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                "
                            >

                                {/* SEARCH */}

                                <div
                                    className="
                                        relative
                                    "
                                >

                                    <Search
                                        size={
                                            17
                                        }
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-slate-400
                                        "
                                    />


                                    <input
                                        type="search"
                                        value={
                                            serviceSearch
                                        }
                                        onChange={
                                            event => {

                                                setServiceSearch(
                                                    event.target.value
                                                );

                                                setVisibleServicesCount(
                                                    4
                                                );
                                            }
                                        }
                                        placeholder="Найти услугу"
                                        className="
                                            h-11
                                            w-full
                                            rounded-xl
                                            border
                                            border-[#D9DDEC]
                                            bg-white
                                            pl-10
                                            pr-4
                                            text-sm
                                            text-slate-900
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-[#4F46E5]
                                            focus:ring-2
                                            focus:ring-[#4F46E5]/10
                                        "
                                    />

                                </div>


                                {/* CATEGORIES */}

                                {serviceCategories.length >
                                    1 && (

                                    <div
                                        className="
                                            -mx-1
                                            flex
                                            gap-2
                                            overflow-x-auto
                                            px-1
                                            pb-1
                                        "
                                    >

                                        <button
                                            type="button"
                                            onClick={() => {

                                                setSelectedServiceCategory(
                                                    'all'
                                                );

                                                setVisibleServicesCount(
                                                    4
                                                );
                                            }}
                                            className={`
                                                shrink-0
                                                cursor-pointer
                                                rounded-full
                                                border
                                                px-3.5
                                                py-2
                                                text-xs
                                                font-semibold
                                                transition

                                                ${
                                                    selectedServiceCategory ===
                                                    'all'
                                                        ? `
                                                            border-[#4F46E5]
                                                            bg-[#4F46E5]
                                                            text-white
                                                        `
                                                        : `
                                                            border-[#D9DDEC]
                                                            bg-white
                                                            text-slate-600
                                                            hover:border-[#A5A0ED]
                                                            hover:text-[#4F46E5]
                                                        `
                                                }
                                            `}
                                        >
                                            Все
                                        </button>


                                        {serviceCategories.map(
                                            category => (

                                                <button
                                                    key={
                                                        category
                                                    }
                                                    type="button"
                                                    onClick={() => {

                                                        setSelectedServiceCategory(
                                                            category
                                                        );

                                                        setVisibleServicesCount(
                                                            4
                                                        );
                                                    }}
                                                    className={`
                                                        shrink-0
                                                        cursor-pointer
                                                        rounded-full
                                                        border
                                                        px-3.5
                                                        py-2
                                                        text-xs
                                                        font-semibold
                                                        transition

                                                        ${
                                                            selectedServiceCategory ===
                                                            category
                                                                ? `
                                                                    border-[#4F46E5]
                                                                    bg-[#4F46E5]
                                                                    text-white
                                                                `
                                                                : `
                                                                    border-[#D9DDEC]
                                                                    bg-white
                                                                    text-slate-600
                                                                    hover:border-[#A5A0ED]
                                                                    hover:text-[#4F46E5]
                                                                `
                                                        }
                                                    `}
                                                >
                                                    {
                                                        category
                                                    }
                                                </button>

                                            )
                                        )}

                                    </div>

                                )}


                                {/* SERVICES LIST */}

                                {filteredServices.length ===
                                    0 ? (

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-dashed
                                            border-[#D9DDEC]
                                            bg-slate-50
                                            px-4
                                            py-6
                                            text-center
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        По вашему запросу услуг не найдено.
                                    </div>

                                ) : (

                                    <>
                                        <div
                                            className="
                                                grid
                                                grid-cols-1
                                                gap-2
                                                md:grid-cols-2
                                                md:gap-3
                                            "
                                        >

                                            {visibleServices.map(
                                                service => {

                                                    const selected =
                                                        selectedServiceId ===
                                                        service.id;


                                                    return (
                                                        <button
                                                            key={
                                                                service.id
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectService(
                                                                    service.id
                                                                )
                                                            }
                                                            className={`
                                                                group
                                                                relative
                                                                flex
                                                                min-w-0
                                                                cursor-pointer
                                                                items-center
                                                                gap-3
                                                                rounded-xl
                                                                border
                                                                px-3.5
                                                                py-3
                                                                text-left
                                                                transition
                                                                sm:px-4
                                                                sm:py-3.5

                                                                ${
                                                                    selected
                                                                        ? `
                                                                            border-[#4F46E5]
                                                                            bg-[#F5F5FF]
                                                                            ring-1
                                                                            ring-[#4F46E5]
                                                                        `
                                                                        : `
                                                                            border-[#D9DDEC]
                                                                            bg-white
                                                                            hover:border-[#A5A0ED]
                                                                            hover:bg-[#FAFAFF]
                                                                        `
                                                                }
                                                            `}
                                                        >

                                                            <div
                                                                className={`
                                                                    flex
                                                                    h-7
                                                                    w-7
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-full
                                                                    border
                                                                    transition

                                                                    ${
                                                                        selected
                                                                            ? `
                                                                                border-[#4F46E5]
                                                                                bg-[#4F46E5]
                                                                                text-white
                                                                            `
                                                                            : `
                                                                                border-[#D9DDEC]
                                                                                bg-white
                                                                                text-transparent
                                                                                group-hover:border-[#A5A0ED]
                                                                            `
                                                                    }
                                                                `}
                                                            >
                                                                <Check
                                                                    size={
                                                                        14
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
                                                                        flex
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
                                                                            className="
                                                                                line-clamp-2
                                                                                text-sm
                                                                                font-semibold
                                                                                leading-5
                                                                                text-slate-900
                                                                            "
                                                                        >
                                                                            {
                                                                                service.name
                                                                            }
                                                                        </div>


                                                                        {service.description && (

                                                                            <div
                                                                                className="
                                                                                    mt-1
                                                                                    hidden
                                                                                    line-clamp-1
                                                                                    text-xs
                                                                                    leading-5
                                                                                    text-slate-500
                                                                                    md:block
                                                                                "
                                                                            >
                                                                                {
                                                                                    service.description
                                                                                }
                                                                            </div>

                                                                        )}

                                                                    </div>


                                                                    <div
                                                                        className="
                                                                            shrink-0
                                                                            whitespace-nowrap
                                                                            text-sm
                                                                            font-bold
                                                                            text-[#4F46E5]
                                                                        "
                                                                    >
                                                                        {formatMoney(
                                                                            service.price
                                                                        )}
                                                                    </div>

                                                                </div>


                                                                <div
                                                                    className="
                                                                        mt-1.5
                                                                        flex
                                                                        items-center
                                                                        gap-1.5
                                                                        text-[11px]
                                                                        text-slate-500
                                                                        sm:text-xs
                                                                    "
                                                                >
                                                                    <Clock3
                                                                        size={
                                                                            13
                                                                        }
                                                                    />

                                                                    {
                                                                        service
                                                                            .duration_minutes
                                                                    }{' '}
                                                                    мин
                                                                </div>

                                                            </div>

                                                        </button>
                                                    );
                                                }
                                            )}

                                        </div>


                                        {filteredServices.length >
                                            4 && (

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        remainingServicesCount >
                                                        0
                                                    ) {
                                                        setVisibleServicesCount(
                                                            current =>
                                                                current +
                                                                4
                                                        );
                                                    } else {
                                                        setVisibleServicesCount(
                                                            4
                                                        );
                                                    }
                                                }}
                                                className="
                                                    w-full
                                                    cursor-pointer
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
                                                    hover:border-[#A5A0ED]
                                                    hover:bg-[#FAFAFF]
                                                "
                                            >
                                                {remainingServicesCount >
                                                0 ? (
                                                    <>
                                                        Показать ещё{' '}
                                                        {Math.min(
                                                            remainingServicesCount,
                                                            4
                                                        )}
                                                    </>
                                                ) : (
                                                    'Скрыть'
                                                )}
                                            </button>

                                        )}

                                    </>

                                )}

                            </div>

                        )}
                    </BookingSection>


                    {/* ADDONS */}

                    <BookingSection
                        number={
                            2
                        }
                        title={
                            selectedAddonIds.length > 0
                                ? `Дополнительные услуги (${selectedAddonIds.length})`
                                : 'Дополнительные услуги'
                        }
                        disabled={
                            !selectedServiceId
                        }
                    >

                        {!selectedService ? (

                            <EmptyText
                                text="Сначала выберите основную услугу."
                            />

                        ) : availableAddons.length ===
                          0 ? (

                            <EmptyText
                                text="Для этой услуги дополнительных опций нет."
                            />

                        ) : (

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                    "
                                >
                                    <p
                                        className="
                                            text-xs
                                            leading-5
                                            text-slate-500
                                        "
                                    >
                                        Необязательно — можно выбрать несколько или пропустить.
                                    </p>

                                    {selectedAddonIds.length > 0 && (

                                        <span
                                            className="
                                                shrink-0
                                                rounded-full
                                                bg-[#EEF2FF]
                                                px-2.5
                                                py-1
                                                text-[11px]
                                                font-semibold
                                                text-[#4F46E5]
                                            "
                                        >
                                            Выбрано {selectedAddonIds.length}
                                        </span>

                                    )}
                                </div>


                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        gap-2
                                        md:grid-cols-2
                                        md:gap-3
                                    "
                                >

                                    {visibleAddons.map(
                                        addon => {

                                            const selected =
                                                selectedAddonIds.includes(
                                                    addon.id
                                                );


                                            return (
                                                <button
                                                    key={
                                                        addon.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleAddon(
                                                            addon.id
                                                        )
                                                    }
                                                    className={`
                                                        group
                                                        flex
                                                        min-w-0
                                                        cursor-pointer
                                                        items-center
                                                        gap-3
                                                        rounded-xl
                                                        border
                                                        px-3.5
                                                        py-3
                                                        text-left
                                                        transition
                                                        sm:px-4

                                                        ${
                                                            selected
                                                                ? `
                                                                    border-[#4F46E5]
                                                                    bg-[#F5F5FF]
                                                                    ring-1
                                                                    ring-[#4F46E5]
                                                                `
                                                                : `
                                                                    border-[#D9DDEC]
                                                                    bg-white
                                                                    hover:border-[#A5A0ED]
                                                                    hover:bg-[#FAFAFF]
                                                                `
                                                        }
                                                    `}
                                                >

                                                    <div
                                                        className={`
                                                            flex
                                                            h-7
                                                            w-7
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            border
                                                            transition

                                                            ${
                                                                selected
                                                                    ? `
                                                                        border-[#4F46E5]
                                                                        bg-[#4F46E5]
                                                                        text-white
                                                                    `
                                                                    : `
                                                                        border-[#D9DDEC]
                                                                        bg-white
                                                                        text-transparent
                                                                        group-hover:border-[#A5A0ED]
                                                                    `
                                                            }
                                                        `}
                                                    >
                                                        <Check
                                                            size={
                                                                14
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
                                                                line-clamp-2
                                                                text-sm
                                                                font-semibold
                                                                leading-5
                                                                text-slate-900
                                                            "
                                                        >
                                                            {
                                                                addon.name
                                                            }
                                                        </div>


                                                        {addon.description && (

                                                            <div
                                                                className="
                                                                    mt-0.5
                                                                    hidden
                                                                    line-clamp-1
                                                                    text-xs
                                                                    text-slate-500
                                                                    md:block
                                                                "
                                                            >
                                                                {
                                                                    addon.description
                                                                }
                                                            </div>

                                                        )}

                                                    </div>


                                                    <div
                                                        className="
                                                            flex
                                                            shrink-0
                                                            flex-col
                                                            items-end
                                                            gap-1
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                whitespace-nowrap
                                                                text-sm
                                                                font-bold
                                                                text-[#4F46E5]
                                                            "
                                                        >
                                                            +{
                                                                formatMoney(
                                                                    addon.price
                                                                )
                                                            }
                                                        </div>


                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1
                                                                whitespace-nowrap
                                                                text-[11px]
                                                                text-slate-500
                                                            "
                                                        >
                                                            <Clock3
                                                                size={
                                                                    12
                                                                }
                                                            />

                                                            +{
                                                                addon.duration_minutes
                                                            } мин
                                                        </div>

                                                    </div>

                                                </button>
                                            );
                                        }
                                    )}

                                </div>


                                {availableAddons.length >
                                    4 && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsAddonsExpanded(
                                                current =>
                                                    !current
                                            )
                                        }
                                        className="
                                            w-full
                                            cursor-pointer
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
                                            hover:border-[#A5A0ED]
                                            hover:bg-[#FAFAFF]
                                        "
                                    >
                                        {isAddonsExpanded
                                            ? 'Скрыть'
                                            : `Показать ещё ${hiddenAddonsCount}`}
                                    </button>

                                )}

                            </div>
                        )}


                        {selectedAddons.length > 0 && (

                            <div
                                className="
                                    mt-4
                                    rounded-xl
                                    border
                                    border-[#D9DDEC]
                                    bg-[#F7F8FD]
                                    px-4
                                    py-3
                                "
                            >

                                <div
                                    className="
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    С учётом выбранных дополнений
                                </div>


                                <div
                                    className="
                                        mt-1
                                        flex
                                        flex-wrap
                                        gap-x-6
                                        gap-y-1
                                        text-sm
                                        font-semibold
                                        text-slate-800
                                    "
                                >

                                    <span>
                                        {
                                            totalDuration
                                        } мин
                                    </span>

                                    <span>
                                        {
                                            formatMoney(
                                                totalPrice
                                            )
                                        }
                                    </span>

                                </div>

                            </div>
                        )}

                    </BookingSection>


                    {/* STAFF */}

                    <BookingSection
                        number={
                            3
                        }
                        title="Выберите мастера"
                        disabled={
                            !selectedServiceId
                        }
                    >

                        {!selectedServiceId ? (

                            <EmptyText
                                text="Сначала выберите услугу."
                            />

                        ) : isMastersLoading ? (

                            <LoadingText
                                text="Загрузка мастеров..."
                            />

                        ) : isMastersError ? (

                            <ErrorText
                                text="Не удалось загрузить мастеров."
                            />

                        ) : masters.length ===
                          0 ? (

                            <EmptyText
                                text="Для этой услуги пока нет доступных мастеров."
                            />

                        ) : (

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-3
                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                "
                            >
                                {masters.map(
                                    master => {

                                        const selected =
                                            selectedMasterId ===
                                            master.id;


                                        const photo =
                                            getPhotoUrl(
                                                master.photo
                                            );


                                        return (
                                            <button
                                                key={
                                                    master.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSelectMaster(
                                                        master.id
                                                    )
                                                }
                                                className={`
                                                    relative
                                                    cursor-pointer
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    text-left
                                                    transition

                                                    ${
                                                        selected
                                                            ? `
                                                                border-[#4F46E5]
                                                                bg-[#F5F5FF]
                                                                ring-1
                                                                ring-[#4F46E5]
                                                            `
                                                            : `
                                                                border-[#D9DDEC]
                                                                bg-white
                                                                hover:border-[#A5A0ED]
                                                            `
                                                    }
                                                `}
                                            >
                                                {selected && (
                                                    <div
                                                        className="
                                                            absolute
                                                            right-3
                                                            top-3
                                                            flex
                                                            h-6
                                                            w-6
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            bg-[#4F46E5]
                                                            text-white
                                                        "
                                                    >
                                                        <Check
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    "
                                                >
                                                    {photo ? (

                                                        <img
                                                            src={
                                                                photo
                                                            }
                                                            alt=""
                                                            className="
                                                                h-14
                                                                w-14
                                                                shrink-0
                                                                rounded-full
                                                                object-cover
                                                            "
                                                        />

                                                    ) : (

                                                        <div
                                                            className="
                                                                flex
                                                                h-14
                                                                w-14
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-[#EEF2FF]
                                                                text-sm
                                                                font-bold
                                                                text-[#4F46E5]
                                                            "
                                                        >
                                                            {getInitials(
                                                                master.first_name,
                                                                master.last_name
                                                            )}
                                                        </div>
                                                    )}

                                                    <div
                                                        className="
                                                            min-w-0
                                                            pr-6
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                truncate
                                                                text-sm
                                                                font-semibold
                                                                text-slate-900
                                                            "
                                                        >
                                                            {
                                                                master.first_name
                                                            }{' '}
                                                            {
                                                                master.last_name
                                                            }
                                                        </div>

                                                        <div
                                                            className="
                                                                mt-1
                                                                truncate
                                                                text-xs
                                                                text-slate-500
                                                            "
                                                        >
                                                            {
                                                                master.position ||
                                                                'Специалист'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </BookingSection>


                    {/* DATES */}

                    <BookingSection
                        number={
                            4
                        }
                        title="Выберите день"
                        disabled={
                            !selectedMasterId
                        }
                    >

                        {!selectedMasterId ? (

                            <EmptyText
                                text="Сначала выберите мастера."
                            />

                        ) : isDatesLoading ? (

                            <LoadingText
                                text="Проверяем доступные даты..."
                            />

                        ) : isDatesError ? (

                            <ErrorText
                                text="Не удалось получить доступные даты."
                            />

                        ) : availableDates.length ===
                          0 ? (

                            <EmptyText
                                text="У мастера пока нет свободных дат."
                            />

                        ) : (

                            <div
                                className="
                                    flex
                                    gap-2.5
                                    overflow-x-auto
                                    pb-2
                                "
                            >
                                {availableDates.map(
                                    item => {

                                        const selected =
                                            selectedDate ===
                                            item.date;


                                        return (
                                            <button
                                                key={
                                                    item.date
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSelectDate(
                                                        item.date
                                                    )
                                                }
                                                className={`
                                                    flex
                                                    min-w-[84px]
                                                    cursor-pointer
                                                    flex-col
                                                    items-center
                                                    rounded-2xl
                                                    border
                                                    px-3
                                                    py-4
                                                    transition

                                                    ${
                                                        selected
                                                            ? `
                                                                border-[#4F46E5]
                                                                bg-[#4F46E5]
                                                                text-white
                                                            `
                                                            : `
                                                                border-[#D9DDEC]
                                                                bg-white
                                                                text-slate-700
                                                                hover:border-[#A5A0ED]
                                                            `
                                                    }
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        text-xs
                                                        capitalize

                                                        ${
                                                            selected
                                                                ? 'text-white/80'
                                                                : 'text-slate-400'
                                                        }
                                                    `}
                                                >
                                                    {formatWeekday(
                                                        item.date
                                                    )}
                                                </span>

                                                <span
                                                    className="
                                                        mt-1
                                                        text-xl
                                                        font-bold
                                                    "
                                                >
                                                    {formatDayNumber(
                                                        item.date
                                                    )}
                                                </span>

                                                <span
                                                    className={`
                                                        mt-0.5
                                                        text-xs
                                                        capitalize

                                                        ${
                                                            selected
                                                                ? 'text-white/80'
                                                                : 'text-slate-500'
                                                        }
                                                    `}
                                                >
                                                    {formatMonth(
                                                        item.date
                                                    )}
                                                </span>

                                                <span
                                                    className={`
                                                        mt-2
                                                        text-[10px]

                                                        ${
                                                            selected
                                                                ? 'text-white/80'
                                                                : 'text-green-600'
                                                        }
                                                    `}
                                                >
                                                    {
                                                        item.available_slots_count
                                                    }{' '}
                                                    свободно
                                                </span>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </BookingSection>


                    {/* TIME */}

                    <BookingSection
                        number={
                            5
                        }
                        title="Выберите доступное время"
                        disabled={
                            !selectedDate
                        }
                    >

                        {!selectedDate ? (

                            <EmptyText
                                text="Сначала выберите дату."
                            />

                        ) : isSlotsLoading ? (

                            <LoadingText
                                text="Загрузка свободного времени..."
                            />

                        ) : isSlotsError ? (

                            <ErrorText
                                text="Не удалось получить свободное время."
                            />

                        ) : slots.length ===
                          0 ? (

                            <EmptyText
                                text="На эту дату свободного времени нет."
                            />

                        ) : (

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-6
                                "
                            >
                                <TimeGroup
                                    title="Утро"
                                    slots={
                                        morningSlots
                                    }
                                    selectedStartAt={
                                        selectedStartAt
                                    }
                                    onSelect={
                                        setSelectedStartAt
                                    }
                                />

                                <TimeGroup
                                    title="День"
                                    slots={
                                        daySlots
                                    }
                                    selectedStartAt={
                                        selectedStartAt
                                    }
                                    onSelect={
                                        setSelectedStartAt
                                    }
                                />

                                <TimeGroup
                                    title="Вечер"
                                    slots={
                                        eveningSlots
                                    }
                                    selectedStartAt={
                                        selectedStartAt
                                    }
                                    onSelect={
                                        setSelectedStartAt
                                    }
                                />
                            </div>
                        )}
                    </BookingSection>


                    {/* CLIENT */}

                    <BookingSection
                        number={
                            6
                        }
                        title="Ваши данные"
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                            "
                        >
                            <div>
                                <label
                                    className="
                                        mb-1.5
                                        block
                                        text-xs
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Имя *
                                </label>

                                <div
                                    className="
                                        relative
                                    "
                                >
                                    <UserRound
                                        size={
                                            17
                                        }
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-slate-400
                                        "
                                    />

                                    <input
                                        type="text"
                                        value={
                                            firstName
                                        }
                                        placeholder="Иван"
                                        onChange={
                                            event =>
                                                setFirstName(
                                                    event.target.value
                                                )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-[#D9DDEC]
                                            bg-[#FAFBFF]
                                            py-3
                                            pl-10
                                            pr-4
                                            text-sm
                                            text-slate-900
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-[#4F46E5]
                                            focus:ring-1
                                            focus:ring-[#4F46E5]
                                        "
                                    />
                                </div>
                            </div>


                            <div>
                                <label
                                    className="
                                        mb-1.5
                                        block
                                        text-xs
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Фамилия
                                </label>

                                <div
                                    className="
                                        relative
                                    "
                                >
                                    <UserRound
                                        size={
                                            17
                                        }
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-slate-400
                                        "
                                    />

                                    <input
                                        type="text"
                                        value={
                                            lastName
                                        }
                                        placeholder="Иванов"
                                        onChange={
                                            event =>
                                                setLastName(
                                                    event.target.value
                                                )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-[#D9DDEC]
                                            bg-[#FAFBFF]
                                            py-3
                                            pl-10
                                            pr-4
                                            text-sm
                                            text-slate-900
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-[#4F46E5]
                                            focus:ring-1
                                            focus:ring-[#4F46E5]
                                        "
                                    />
                                </div>
                            </div>


                            <div>
                                <label
                                    className="
                                        mb-1.5
                                        block
                                        text-xs
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Телефон *
                                </label>

                                <div
                                    className="
                                        relative
                                    "
                                >
                                    <Phone
                                        size={17}
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-slate-400
                                        "
                                    />

                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={phone}
                                        placeholder="+7 777 000 00 00"
                                        maxLength={16}
                                        onChange={
                                            event =>
                                                setPhone(
                                                    formatPhone(
                                                        event.target.value
                                                    )
                                                )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-[#D9DDEC]
                                            bg-[#FAFBFF]
                                            py-3
                                            pl-10
                                            pr-4
                                            text-sm
                                            text-slate-900
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-[#4F46E5]
                                            focus:ring-1
                                            focus:ring-[#4F46E5]
                                        "
                                    />
                                </div>
                            </div>


                            <div
                                className="
                                    md:col-span-2
                                "
                            >
                                <label
                                    className="
                                        mb-1.5
                                        block
                                        text-xs
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Комментарий
                                </label>

                                <textarea
                                    rows={
                                        4
                                    }
                                    value={
                                        comment
                                    }
                                    placeholder="Комментарий к записи..."
                                    onChange={
                                        event =>
                                            setComment(
                                                event.target.value
                                            )
                                    }
                                    className="
                                        w-full
                                        resize-none
                                        rounded-xl
                                        border
                                        border-[#D9DDEC]
                                        bg-[#FAFBFF]
                                        px-4
                                        py-3
                                        text-sm
                                        text-slate-900
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-[#4F46E5]
                                        focus:ring-1
                                        focus:ring-[#4F46E5]
                                    "
                                />
                            </div>
                        </div>
                    </BookingSection>

                </div>


                {/* SUMMARY */}

                <aside
                    className="
                        xl:sticky
                        xl:top-6
                    "
                >
                    <div
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
                                border-b
                                border-[#EAECF0]
                                px-6
                                py-5
                            "
                        >
                            <h2
                                className="
                                    text-lg
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Ваша запись
                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Проверьте данные перед подтверждением
                            </p>
                        </div>


                        <div
                            className="
                                flex
                                flex-col
                                gap-5
                                p-6
                            "
                        >
                            <SummaryItem
                                icon={
                                    MapPin
                                }
                                title="Бизнес"
                                value={
                                    business.name
                                }
                                subValue={
                                    business.address ||
                                    undefined
                                }
                            />

                            <SummaryItem
                                icon={
                                    Scissors
                                }
                                title="Услуга"
                                value={
                                    selectedService
                                        ?.name ??
                                    'Не выбрана'
                                }
                                subValue={
                                    selectedService
                                        ? `${
                                              selectedService.duration_minutes
                                          } мин`
                                        : undefined
                                }
                            />

                            {selectedAddons.length > 0 && (

                                <SummaryItem
                                    icon={
                                        Scissors
                                    }
                                    title="Дополнительно"
                                    value={
                                        selectedAddons
                                            .map(
                                                addon =>
                                                    addon.name
                                            )
                                            .join(
                                                ', '
                                            )
                                    }
                                    subValue={
                                        `+${
                                            addonsTotalDuration
                                        } мин · +${
                                            formatMoney(
                                                addonsTotalPrice
                                            )
                                        }`
                                    }
                                />

                            )}

                            <SummaryItem
                                icon={
                                    UserRound
                                }
                                title="Мастер"
                                value={
                                    selectedMaster
                                        ? `${
                                              selectedMaster.first_name
                                          } ${
                                              selectedMaster.last_name
                                          }`
                                        : 'Не выбран'
                                }
                                subValue={
                                    selectedMaster
                                        ?.position ??
                                    undefined
                                }
                            />

                            <SummaryItem
                                icon={
                                    CalendarDays
                                }
                                title="Дата и время"
                                value={
                                    selectedDate
                                        ? formatFullDate(
                                              selectedDate
                                          )
                                        : 'Не выбрано'
                                }
                                subValue={
                                    selectedStartAt
                                        ? formatTime(
                                              selectedStartAt
                                          )
                                        : undefined
                                }
                            />


                            <div
                                className="
                                    border-t
                                    border-[#EAECF0]
                                    pt-5
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >
                                    <span
                                        className="
                                            text-sm
                                            font-medium
                                            text-slate-600
                                        "
                                    >
                                        Итого
                                    </span>

                                    <span
                                        className="
                                            text-xl
                                            font-bold
                                            text-slate-900
                                        "
                                    >
                                        {selectedService
                                            ? formatMoney(
                                                  totalPrice
                                              )
                                            : '—'}
                                    </span>
                                </div>
                            </div>


                            {(firstName || lastName) && (
                                <div
                                    className="
                                        rounded-xl
                                        bg-[#F7F8FD]
                                        px-4
                                        py-3
                                    "
                                >
                                    <div
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        Клиент
                                    </div>

                                    <div
                                        className="
                                            mt-1
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        {`${firstName} ${lastName}`.trim()}
                                    </div>

                                    {phone && (
                                        <div
                                            className="
                                                mt-0.5
                                                text-xs
                                                text-slate-500
                                            "
                                        >
                                            {
                                                phone
                                            }
                                        </div>
                                    )}
                                </div>
                            )}


                            {errorMessage && (
                                <div
                                    className="
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
                                    {
                                        errorMessage
                                    }

                                    {errorMessage.includes(
                                        'войти'
                                    ) && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    '/auth/login'
                                                )
                                            }
                                            className="
                                                ml-1
                                                cursor-pointer
                                                font-semibold
                                                underline
                                            "
                                        >
                                            Войти
                                        </button>
                                    )}
                                </div>
                            )}


                            <button
                                type="button"
                                disabled={
                                    !canSubmit ||
                                    createMutation
                                        .isPending
                                }
                                onClick={
                                    handleSubmit
                                }
                                className="
                                    mt-1
                                    flex
                                    w-full
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#4F46E5]
                                    px-5
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-[#4338CA]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                {createMutation
                                    .isPending
                                    ? 'Создаём запись...'
                                    : 'Подтвердить запись'}
                            </button>


                            <p
                                className="
                                    text-center
                                    text-[11px]
                                    leading-4
                                    text-slate-400
                                "
                            >
                                Нажимая кнопку, вы подтверждаете
                                выбранные дату, время и услугу.
                            </p>
                        </div>
                    </div>
                </aside>

            </div>

            <div
                className="
                    mt-12
                    border-t
                    border-[#EAECF0]
                    pt-10
                "
            >
                <BusinessReviews
                    businessId={
                        businessId
                    }
                />
            </div>
        </div>
    );
}


/*
 * ============================================================
 * BOOKING SECTION
 * ============================================================
 */

interface BookingSectionProps {
    number: number;

    title: string;

    disabled?: boolean;

    children:
        React.ReactNode;
}


function BookingSection({
    number,
    title,
    disabled = false,
    children
}: BookingSectionProps) {

    return (
        <section
            className={`
                rounded-3xl
                border
                border-[#D9DDEC]
                bg-white
                p-5
                shadow-sm
                md:p-6

                ${
                    disabled
                        ? 'opacity-70'
                        : ''
                }
            `}
        >
            <div
                className="
                    mb-5
                    flex
                    items-center
                    gap-3
                "
            >
                <div
                    className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#EEF2FF]
                        text-sm
                        font-bold
                        text-[#4F46E5]
                    "
                >
                    {
                        number
                    }
                </div>

                <h2
                    className="
                        text-lg
                        font-bold
                        text-slate-900
                    "
                >
                    {
                        title
                    }
                </h2>
            </div>

            {
                children
            }
        </section>
    );
}


/*
 * ============================================================
 * TIME GROUP
 * ============================================================
 */

interface TimeGroupProps {
    title: string;

    slots:
        AvailabilitySlot[];

    selectedStartAt:
        string;

    onSelect:
        (
            startAt: string
        ) => void;
}


function TimeGroup({
    title,
    slots,
    selectedStartAt,
    onSelect
}: TimeGroupProps) {

    if (
        slots.length ===
        0
    ) {
        return null;
    }


    return (
        <div>
            <div
                className="
                    mb-2.5
                    flex
                    items-center
                    gap-2
                "
            >
                <Clock3
                    size={
                        15
                    }
                    className="
                        text-slate-400
                    "
                />

                <span
                    className="
                        text-xs
                        font-semibold
                        text-slate-500
                    "
                >
                    {
                        title
                    }
                </span>
            </div>

            <div
                className="
                    grid
                    grid-cols-3
                    gap-2
                    sm:grid-cols-4
                    md:grid-cols-5
                    lg:grid-cols-6
                "
            >
                {slots.map(
                    slot => {

                        const selected =
                            selectedStartAt ===
                            slot.start_at;


                        return (
                            <button
                                key={
                                    slot.start_at
                                }
                                type="button"
                                disabled={
                                    !slot.is_available
                                }
                                onClick={() =>
                                    onSelect(
                                        slot.start_at
                                    )
                                }
                                className={`
                                    rounded-xl
                                    border
                                    px-3
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    transition

                                    ${
                                        selected
                                            ? `
                                                cursor-pointer
                                                border-[#4F46E5]
                                                bg-[#4F46E5]
                                                text-white
                                            `
                                            : slot.is_available
                                                ? `
                                                    cursor-pointer
                                                    border-[#D9DDEC]
                                                    bg-white
                                                    text-slate-700
                                                    hover:border-[#4F46E5]
                                                    hover:bg-[#F5F5FF]
                                                `
                                                : `
                                                    cursor-not-allowed
                                                    border-slate-100
                                                    bg-slate-100
                                                    text-slate-300
                                                    line-through
                                                `
                                    }
                                `}
                            >
                                {formatTime(
                                    slot.start_at
                                )}
                            </button>
                            
                        );
                    }
                )}
            </div>
        </div>
    );
}


/*
 * ============================================================
 * SUMMARY ITEM
 * ============================================================
 */

interface SummaryItemProps {
    icon:
        React.ComponentType<{
            size?: number;
            className?: string;
        }>;

    title: string;

    value: string;

    subValue?: string;
}


function SummaryItem({
    icon: Icon,
    title,
    value,
    subValue
}: SummaryItemProps) {

    return (
        <div
            className="
                flex
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
                    rounded-xl
                    bg-[#EEF2FF]
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
                        text-[11px]
                        text-slate-400
                    "
                >
                    {
                        title
                    }
                </div>

                <div
                    className="
                        mt-0.5
                        text-sm
                        font-semibold
                        text-slate-800
                    "
                >
                    {
                        value
                    }
                </div>

                {subValue && (
                    <div
                        className="
                            mt-0.5
                            text-xs
                            text-slate-500
                        "
                    >
                        {
                            subValue
                        }
                    </div>
                )}
            </div>
        </div>
    );
}


/*
 * ============================================================
 * SUMMARY LINE
 * ============================================================
 */

function SummaryLine({
    label,
    value
}: {
    label: string;
    value: string;
}) {

    return (
        <div
            className="
                flex
                items-start
                justify-between
                gap-5
                border-b
                border-[#EAECF0]
                py-3
                last:border-b-0
            "
        >
            <span
                className="
                    text-xs
                    text-slate-500
                "
            >
                {
                    label
                }
            </span>

            <span
                className="
                    text-right
                    text-sm
                    font-semibold
                    text-slate-800
                "
            >
                {
                    value
                }
            </span>
        </div>
    );
}


/*
 * ============================================================
 * STATES
 * ============================================================
 */

function LoadingText({
    text
}: {
    text: string;
}) {

    return (
        <div
            className="
                rounded-xl
                bg-[#F7F8FD]
                px-4
                py-5
                text-sm
                text-slate-500
            "
        >
            {
                text
            }
        </div>
    );
}


function EmptyText({
    text
}: {
    text: string;
}) {

    return (
        <div
            className="
                rounded-xl
                border
                border-dashed
                border-[#D9DDEC]
                bg-[#FAFBFF]
                px-4
                py-5
                text-sm
                text-slate-500
            "
        >
            {
                text
            }
        </div>
    );
}


function ErrorText({
    text
}: {
    text: string;
}) {

    return (
        <div
            className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-5
                text-sm
                text-red-600
            "
        >
            {
                text
            }
        </div>
    );
}
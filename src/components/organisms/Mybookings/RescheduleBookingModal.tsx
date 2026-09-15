import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    CalendarDays,
    Check,
    Clock3,
    X
} from 'lucide-react';

import {
    getAvailabilityDates,
    getDayAvailability
} from '../../../api/scheduling';

import type {
    MyBooking
} from '../../../api/myBookings';


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


interface RescheduleBookingModalProps {
    booking: MyBooking;
    onClose: () => void;
    onSubmit: (startAt: string) => void;
    isPending: boolean;
    errorMessage?: string;
}


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


const formatDate = (
    value: string
) => {

    return parseLocalDate(
        value
    ).toLocaleDateString(
        'ru-RU',
        {
            day: 'numeric',
            month: 'short',
            weekday: 'short'
        }
    );
};


const formatFullDate = (
    value: string
) => {

    return parseLocalDate(
        value
    ).toLocaleDateString(
        'ru-RU',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
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
            hour: '2-digit',
            minute: '2-digit'
        }
    );
};


export default function RescheduleBookingModal({
    booking,
    onClose,
    onSubmit,
    isPending,
    errorMessage = ''
}: RescheduleBookingModalProps) {

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

    const today =
        useMemo(
            () =>
                getLocalDate(),
            []
        );


    const currentDate =
        new Date(
            booking.start_at
        );

    const currentDateText =
        currentDate.toLocaleDateString(
            'ru-RU',
            {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
        );

    const currentTimeText =
        currentDate.toLocaleTimeString(
            'ru-RU',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );


    const {
        data: datesResponse,
        isLoading: isDatesLoading,
        isError: isDatesError
    } =
        useQuery({

            queryKey: [
                'my-booking-reschedule-dates',
                booking.id,
                booking.staff,
                booking.service,
                today
            ],

            queryFn: () =>
                getAvailabilityDates(
                    Number(
                        booking.staff
                    ),
                    Number(
                        booking.service
                    ),
                    today
                ),

            enabled:
                Number(
                    booking.staff
                ) > 0 &&
                Number(
                    booking.service
                ) > 0,

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
                        item.available_slots_count >
                            0
                );

            },
            [
                datesResponse
            ]
        );


    const {
        data: dayResponse,
        isLoading: isSlotsLoading,
        isError: isSlotsError
    } =
        useQuery({

            queryKey: [
                'my-booking-reschedule-slots',
                booking.id,
                booking.staff,
                booking.service,
                selectedDate
            ],

            queryFn: () =>
                getDayAvailability(
                    Number(
                        booking.staff
                    ),
                    Number(
                        booking.service
                    ),
                    selectedDate
                ),

            enabled:
                Number(
                    booking.staff
                ) > 0 &&
                Number(
                    booking.service
                ) > 0 &&
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


    useEffect(
        () => {

            setSelectedStartAt(
                ''
            );

        },
        [
            selectedDate
        ]
    );


    const handleSubmit =
        () => {

            if (
                !selectedStartAt ||
                isPending
            ) {
                return;
            }

            onSubmit(
                selectedStartAt
            );
        };


    return (
        <div
            className="
                fixed
                inset-0
                z-[9999]
                flex
                items-center
                justify-center
                bg-slate-900/40
                px-4
                py-6
                backdrop-blur-[2px]
            "
            onClick={() => {

                if (
                    !isPending
                ) {
                    onClose();
                }

            }}
        >

            <div
                className="
                    max-h-[90vh]
                    w-full
                    max-w-[560px]
                    overflow-y-auto
                    rounded-3xl
                    border
                    border-[#D9DDEC]
                    bg-white
                    shadow-2xl
                "
                onClick={
                    event =>
                        event.stopPropagation()
                }
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[#EAECF0]
                        px-5
                        py-5
                        sm:px-6
                    "
                >

                    <div>

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-slate-900
                            "
                        >
                            Перенести запись
                        </h2>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-500
                            "
                        >
                            Выберите новую дату и время
                        </p>

                    </div>


                    <button
                        type="button"
                        disabled={
                            isPending
                        }
                        onClick={
                            onClose
                        }
                        className="
                            flex
                            h-9
                            w-9
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-xl
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <X
                            size={
                                20
                            }
                        />
                    </button>

                </div>


                <div
                    className="
                        p-5
                        sm:p-6
                    "
                >

                    <div
                        className="
                            rounded-2xl
                            border
                            border-[#D9DDEC]
                            bg-[#F7F8FD]
                            p-4
                        "
                    >

                        <div
                            className="
                                text-xs
                                font-medium
                                text-slate-400
                            "
                        >
                            Текущая запись
                        </div>


                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                <CalendarDays
                                    size={
                                        17
                                    }
                                    className="
                                        text-[#4F46E5]
                                    "
                                />

                                {currentDateText}
                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                <Clock3
                                    size={
                                        17
                                    }
                                    className="
                                        text-[#4F46E5]
                                    "
                                />

                                {currentTimeText}
                            </div>

                        </div>

                    </div>


                    <div
                        className="
                            mt-6
                        "
                    >

                        <div
                            className="
                                mb-3
                                text-sm
                                font-semibold
                                text-slate-800
                            "
                        >
                            Новая дата
                        </div>


                        {isDatesLoading ? (

                            <div
                                className="
                                    rounded-xl
                                    bg-[#F7F8FD]
                                    px-4
                                    py-5
                                    text-center
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Загружаем доступные даты...
                            </div>

                        ) : isDatesError ? (

                            <div
                                className="
                                    rounded-xl
                                    bg-red-50
                                    px-4
                                    py-4
                                    text-sm
                                    text-red-600
                                "
                            >
                                Не удалось загрузить даты.
                            </div>

                        ) : availableDates.length ===
                          0 ? (

                            <div
                                className="
                                    rounded-xl
                                    bg-[#F7F8FD]
                                    px-4
                                    py-5
                                    text-center
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Доступных дат пока нет.
                            </div>

                        ) : (

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-2
                                    sm:grid-cols-3
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
                                                    setSelectedDate(
                                                        item.date
                                                    )
                                                }
                                                className={`
                                                    cursor-pointer
                                                    rounded-xl
                                                    border
                                                    px-3
                                                    py-3
                                                    text-left
                                                    transition

                                                    ${
                                                        selected
                                                            ? `
                                                                border-[#4F46E5]
                                                                bg-[#EEF2FF]
                                                                text-[#4F46E5]
                                                            `
                                                            : `
                                                                border-[#D9DDEC]
                                                                bg-white
                                                                text-slate-700
                                                                hover:border-[#4F46E5]
                                                            `
                                                    }
                                                `}
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-2
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            text-sm
                                                            font-semibold
                                                            capitalize
                                                        "
                                                    >
                                                        {formatDate(
                                                            item.date
                                                        )}
                                                    </div>

                                                    {selected && (
                                                        <Check
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    )}

                                                </div>


                                                <div
                                                    className="
                                                        mt-1
                                                        text-[11px]
                                                        text-slate-400
                                                    "
                                                >
                                                    {
                                                        item
                                                            .available_slots_count
                                                    } свободных
                                                </div>

                                            </button>
                                        );
                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {selectedDate && (

                        <div
                            className="
                                mt-6
                            "
                        >

                            <div
                                className="
                                    mb-1
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                "
                            >
                                Новое время
                            </div>

                            <div
                                className="
                                    mb-3
                                    text-xs
                                    text-slate-400
                                "
                            >
                                {formatFullDate(
                                    selectedDate
                                )}
                            </div>


                            {isSlotsLoading ? (

                                <div
                                    className="
                                        rounded-xl
                                        bg-[#F7F8FD]
                                        px-4
                                        py-5
                                        text-center
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Загружаем время...
                                </div>

                            ) : isSlotsError ? (

                                <div
                                    className="
                                        rounded-xl
                                        bg-red-50
                                        px-4
                                        py-4
                                        text-sm
                                        text-red-600
                                    "
                                >
                                    Не удалось загрузить время.
                                </div>

                            ) : slots.length ===
                              0 ? (

                                <div
                                    className="
                                        rounded-xl
                                        bg-[#F7F8FD]
                                        px-4
                                        py-5
                                        text-center
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    На эту дату свободного времени нет.
                                </div>

                            ) : (

                                <div
                                    className="
                                        grid
                                        grid-cols-3
                                        gap-2
                                        sm:grid-cols-4
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
                                                        setSelectedStartAt(
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
                                                            !slot.is_available
                                                                ? `
                                                                    cursor-not-allowed
                                                                    border-slate-200
                                                                    bg-slate-100
                                                                    text-slate-300
                                                                `
                                                                : selected
                                                                    ? `
                                                                        cursor-pointer
                                                                        border-[#4F46E5]
                                                                        bg-[#4F46E5]
                                                                        text-white
                                                                    `
                                                                    : `
                                                                        cursor-pointer
                                                                        border-[#D9DDEC]
                                                                        bg-white
                                                                        text-slate-700
                                                                        hover:border-[#4F46E5]
                                                                        hover:text-[#4F46E5]
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

                            )}

                        </div>

                    )}


                    {errorMessage && (

                        <div
                            className="
                                mt-5
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
                            {errorMessage}
                        </div>

                    )}


                    <div
                        className="
                            mt-7
                            flex
                            flex-col-reverse
                            gap-3
                            sm:flex-row
                            sm:justify-end
                        "
                    >

                        <button
                            type="button"
                            disabled={
                                isPending
                            }
                            onClick={
                                onClose
                            }
                            className="
                                cursor-pointer
                                rounded-xl
                                border
                                border-[#D9DDEC]
                                bg-white
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-600
                                transition
                                hover:bg-[#F7F8FD]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Отмена
                        </button>


                        <button
                            type="button"
                            disabled={
                                !selectedStartAt ||
                                isPending
                            }
                            onClick={
                                handleSubmit
                            }
                            className="
                                cursor-pointer
                                rounded-xl
                                bg-[#4F46E5]
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#4338CA]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {isPending
                                ? 'Переносим...'
                                : 'Перенести запись'}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

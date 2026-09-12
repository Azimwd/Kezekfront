import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    CalendarClock,
    ChevronDown,
    X
} from 'lucide-react';

import {
    getAvailabilityDates,
    getDayAvailability,
    type AvailabilityDate,
    type AvailabilitySlot
} from '../../../../api/scheduling';


interface RescheduleModalProps {
    currentStartAt: string;

    staffId: number;

    serviceId: number;

    onClose: () => void;

    onSubmit: (
        startAt: string
    ) => void;

    isPending: boolean;
}


export default function RescheduleModal({
    currentStartAt,
    staffId,
    serviceId,
    onClose,
    onSubmit,
    isPending
}: RescheduleModalProps) {

    const [
        selectedDate,
        setSelectedDate
    ] = useState('');


    const [
        selectedStartAt,
        setSelectedStartAt
    ] = useState('');


    /*
     * ========================================================
     * ТЕКУЩАЯ ЗАПИСЬ
     * ========================================================
     */

    const currentDate =
        new Date(
            currentStartAt
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


    /*
     * ========================================================
     * СЕГОДНЯШНЯЯ ДАТА
     * ========================================================
     */

    const today =
        useMemo(
            () => {

                const now =
                    new Date();


                const year =
                    now.getFullYear();


                const month =
                    String(
                        now.getMonth() + 1
                    ).padStart(
                        2,
                        '0'
                    );


                const day =
                    String(
                        now.getDate()
                    ).padStart(
                        2,
                        '0'
                    );


                return `${year}-${month}-${day}`;

            },
            []
        );


    /*
     * ========================================================
     * ПОЛУЧАЕМ ДАТЫ
     * ========================================================
     */

    const {
        data: datesResponse,
        isLoading: isLoadingDates,
        isError: isDatesError
    } = useQuery({
        queryKey: [
            'availability-dates',
            staffId,
            serviceId,
            today
        ],

        queryFn: () =>
            getAvailabilityDates(
                staffId,
                serviceId,
                today
            ),

        enabled:
            staffId > 0 &&
            serviceId > 0,

        retry: false
    });

    const allDates: AvailabilityDate[] =
        datesResponse?.data ?? [];


    /*
     * ========================================================
     * ПОЛУЧАЕМ СЛОТЫ ВЫБРАННОГО ДНЯ
     * ========================================================
     */

    const {
        data: dayResponse,
        isLoading: isLoadingSlots,
        isError: isSlotsError
    } = useQuery({

        queryKey: [
            'availability-day',
            staffId,
            serviceId,
            selectedDate
        ],

        queryFn: () =>
            getDayAvailability(
                staffId,
                serviceId,
                selectedDate
            ),

        enabled:
            staffId > 0 &&
            serviceId > 0 &&
            !!selectedDate,

        retry: false
    });


    const slots: AvailabilitySlot[] =
        dayResponse?.data?.slots ?? [];


    /*
     * При выборе другой даты
     * сбрасываем выбранное время.
     */

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


    /*
     * ========================================================
     * ПЕРЕНОС
     * ========================================================
     */

    const handleSubmit = () => {

        if (
            !selectedStartAt
        ) {
            return;
        }


        /*
         * Backend уже возвращает:
         *
         * 2026-09-18T13:00:00+05:00
         *
         * Поэтому отправляем start_at
         * без дополнительного преобразования.
         */

        onSubmit(
            selectedStartAt
        );
    };


    /*
     * ========================================================
     * ФОРМАТ ДАТЫ
     * ========================================================
     */

    const formatAvailableDate = (
        dateString: string
    ) => {

        const [
            year,
            month,
            day
        ] =
            dateString
                .split('-')
                .map(
                    Number
                );


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        return date.toLocaleDateString(
            'ru-RU',
            {
                day: 'numeric',
                month: 'long',
                weekday: 'short'
            }
        );
    };


    /*
     * ========================================================
     * ТЕКСТ СОСТОЯНИЯ ДАТЫ
     * ========================================================
     */

    const getDateStatus = (
        item: AvailabilityDate
    ) => {

        if (
            item.reason ===
            'not_working_day'
        ) {
            return 'нерабочий день';
        }


        if (
            !item.is_available ||
            item.available_slots_count === 0
        ) {
            return 'нет свободного времени';
        }


        return `${item.available_slots_count} свободных`;
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
                    w-full
                    max-w-[430px]
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    shadow-2xl
                "
                onClick={(
                    event
                ) =>
                    event.stopPropagation()
                }
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[#E2E8F0]
                        px-6
                        py-5
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-semibold
                            text-[#0F172A]
                        "
                    >
                        Перенести запись
                    </h2>


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
                            h-8
                            w-8
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-800
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


                {/* BODY */}

                <div
                    className="
                        flex
                        flex-col
                        gap-5
                        px-6
                        py-5
                    "
                >

                    {/* ТЕКУЩАЯ ЗАПИСЬ */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-indigo-100
                            bg-indigo-50
                            p-4
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
                                rounded-full
                                bg-[#4F46E5]
                            "
                        >

                            <CalendarClock
                                size={
                                    19
                                }
                                className="
                                    text-white
                                "
                            />

                        </div>


                        <div>

                            <div
                                className="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Текущее время
                            </div>


                            <div
                                className="
                                    mt-0.5
                                    text-sm
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                {currentDateText}
                                {', '}
                                {currentTimeText}
                            </div>

                        </div>

                    </div>


                    {/* ВЫБОР ДАТЫ */}

                    <div>

                        <label
                            className="
                                mb-2
                                block
                                text-xs
                                font-medium
                                text-slate-600
                            "
                        >
                            Выберите новую дату
                        </label>


                        <div
                            className="
                                relative
                            "
                        >

                            <select
                                value={
                                    selectedDate
                                }
                                disabled={
                                    isLoadingDates ||
                                    isPending
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedDate(
                                        event.target.value
                                    )
                                }
                                className="
                                    h-12
                                    w-full
                                    cursor-pointer
                                    appearance-none
                                    rounded-xl
                                    border
                                    border-[#c7c4d8]
                                    bg-white
                                    px-4
                                    pr-10
                                    text-sm
                                    font-medium
                                    text-slate-800
                                    outline-none
                                    transition
                                    focus:border-[#4F46E5]
                                    focus:ring-1
                                    focus:ring-[#4F46E5]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <option value="">
                                    {isLoadingDates
                                        ? 'Загрузка дат...'
                                        : 'Выберите дату'
                                    }
                                </option>


                                {allDates.map(
                                    (
                                        item:
                                            AvailabilityDate
                                    ) => {

                                        const disabled =
                                            !item.is_available ||
                                            item.available_slots_count === 0;


                                        return (
                                            <option
                                                key={
                                                    item.date
                                                }
                                                value={
                                                    item.date
                                                }
                                                disabled={
                                                    disabled
                                                }
                                            >
                                                {
                                                    formatAvailableDate(
                                                        item.date
                                                    )
                                                }

                                                {' — '}

                                                {
                                                    getDateStatus(
                                                        item
                                                    )
                                                }

                                            </option>
                                        );
                                    }
                                )}

                            </select>


                            <ChevronDown
                                size={
                                    17
                                }
                                className="
                                    pointer-events-none
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                        </div>


                        {isDatesError && (

                            <div
                                className="
                                    mt-2
                                    text-xs
                                    text-red-500
                                "
                            >
                                Не удалось получить доступные даты.
                            </div>

                        )}

                    {!isLoadingDates &&
                        !isDatesError &&
                        allDates.length === 0 && (

                            <div
                                className="
                                    mt-2
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Нет доступных дат для записи.
                            </div>

                        )}

                    </div>


                    {/* ВРЕМЯ */}

                    {selectedDate && (

                        <div>

                            <div
                                className="
                                    mb-3
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span
                                    className="
                                        text-xs
                                        font-medium
                                        text-slate-600
                                    "
                                >
                                    Доступное время
                                </span>


                                <span
                                    className="
                                        text-xs
                                        font-medium
                                        text-[#4F46E5]
                                    "
                                >
                                    {
                                        formatAvailableDate(
                                            selectedDate
                                        )
                                    }
                                </span>

                            </div>


                            {isLoadingSlots ? (

                                <div
                                    className="
                                        rounded-xl
                                        bg-slate-50
                                        py-6
                                        text-center
                                        text-sm
                                        text-slate-400
                                    "
                                >
                                    Загрузка времени...
                                </div>

                            ) : isSlotsError ? (

                                <div
                                    className="
                                        rounded-xl
                                        bg-red-50
                                        py-5
                                        text-center
                                        text-sm
                                        text-red-500
                                    "
                                >
                                    Не удалось получить доступное время.
                                </div>

                            ) : slots.length === 0 ? (

                                <div
                                    className="
                                        rounded-xl
                                        bg-slate-50
                                        py-6
                                        text-center
                                        text-sm
                                        text-slate-400
                                    "
                                >
                                    На эту дату нет времени.
                                </div>

                            ) : (

                                <div
                                    className="
                                        grid
                                        grid-cols-3
                                        gap-2
                                    "
                                >

                                    {slots.map(
                                        (
                                            slot:
                                                AvailabilitySlot
                                        ) => {

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
                                                        !slot.is_available ||
                                                        isPending
                                                    }
                                                    onClick={() =>
                                                        setSelectedStartAt(
                                                            slot.start_at
                                                        )
                                                    }
                                                    className={`
                                                        rounded-lg
                                                        border
                                                        px-3
                                                        py-2.5
                                                        text-sm
                                                        font-medium
                                                        transition

                                                        ${
                                                            selected
                                                                ? `
                                                                    border-[#4F46E5]
                                                                    bg-[#4F46E5]
                                                                    text-white
                                                                `
                                                                : slot.is_available
                                                                    ? `
                                                                        cursor-pointer
                                                                        border-slate-200
                                                                        bg-slate-50
                                                                        text-slate-700
                                                                        hover:border-[#4F46E5]
                                                                        hover:bg-indigo-50
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
                                                    {
                                                        slot.time
                                                    }
                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </div>

                    )}

                </div>


                {/* FOOTER */}

                <div
                    className="
                        flex
                        items-center
                        justify-end
                        gap-3
                        border-t
                        border-[#E2E8F0]
                        px-6
                        py-4
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
                            px-5
                            py-2.5
                            text-sm
                            font-medium
                            text-[#4F46E5]
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
                            min-w-[110px]
                            cursor-pointer
                            rounded-xl
                            bg-[#4F46E5]
                            px-5
                            py-2.5
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-[#4338CA]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {isPending
                            ? 'Перенос...'
                            : 'Перенести'
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}
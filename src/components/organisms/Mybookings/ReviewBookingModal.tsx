import {
    useState
} from 'react';

import {
    CalendarDays,
    Star,
    UserRound,
    X
} from 'lucide-react';

import type {
    MyBooking
} from '../../../api/myBookings';


interface ReviewBookingModalProps {
    booking:
        MyBooking;

    isPending:
        boolean;

    errorMessage:
        string;

    onClose:
        () => void;

    onSubmit:
        (
            rating: number,
            text: string
        ) => void;
}


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const getBusinessName =
    (
        booking:
            MyBooking
    ) => {

        return (
            booking.business_name ??
            `Бизнес #${booking.business}`
        );
    };


const getServiceName =
    (
        booking:
            MyBooking
    ) => {

        return (
            booking.service_name ??
            `Услуга #${booking.service}`
        );
    };


const getStaffName =
    (
        booking:
            MyBooking
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


const formatDate =
    (
        value:
            string
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


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ReviewBookingModal({
    booking,
    isPending,
    errorMessage,
    onClose,
    onSubmit
}: ReviewBookingModalProps) {

    const [
        rating,
        setRating
    ] =
        useState<number>(
            0
        );


    const [
        hoverRating,
        setHoverRating
    ] =
        useState<number>(
            0
        );


    const [
        text,
        setText
    ] =
        useState<string>(
            ''
        );


    const activeRating =
        hoverRating ||
        rating;


    const handleSubmit =
        () => {

            if (
                rating <
                1 ||
                rating >
                5 ||
                isPending
            ) {
                return;
            }


            onSubmit(
                rating,
                text.trim()
            );
        };


    return (
        <div
            className="
                fixed
                inset-0
                z-[10000]
                flex
                items-center
                justify-center
                bg-slate-950/45
                px-4
                py-6
                backdrop-blur-[2px]
            "
            onMouseDown={
                event => {

                    if (
                        event.target ===
                            event.currentTarget &&
                        !isPending
                    ) {
                        onClose();
                    }
                }
            }
        >

            <div
                className="
                    max-h-[calc(100vh-48px)]
                    w-full
                    max-w-[540px]
                    overflow-y-auto
                    rounded-3xl
                    border
                    border-[#D9DDEC]
                    bg-white
                    p-5
                    shadow-2xl
                    sm:p-7
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
                    "
                >

                    <div
                        className="
                            min-w-0
                        "
                    >

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-[#111115]
                            "
                        >
                            Оставить отзыв
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                leading-6
                                text-[#667085]
                            "
                        >
                            Оцените завершённую запись и поделитесь впечатлением.
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
                            shrink-0
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
                                19
                            }
                        />
                    </button>

                </div>


                {/* =================================================
                    BOOKING INFO
                ================================================= */}

                <div
                    className="
                        mt-5
                        rounded-2xl
                        border
                        border-[#E7E9F2]
                        bg-[#F7F8FD]
                        p-4
                    "
                >

                    <div
                        className="
                            text-base
                            font-bold
                            text-slate-900
                        "
                    >
                        {getServiceName(
                            booking
                        )}
                    </div>


                    <div
                        className="
                            mt-1
                            text-sm
                            font-medium
                            text-[#4F46E5]
                        "
                    >
                        {getBusinessName(
                            booking
                        )}
                    </div>


                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-2
                            sm:grid-cols-2
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-[#667085]
                            "
                        >
                            <CalendarDays
                                size={
                                    15
                                }
                                className="
                                    shrink-0
                                    text-[#4F46E5]
                                "
                            />

                            <span>
                                {formatDate(
                                    booking.start_at
                                )}
                            </span>
                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-[#667085]
                            "
                        >
                            <UserRound
                                size={
                                    15
                                }
                                className="
                                    shrink-0
                                    text-[#4F46E5]
                                "
                            />

                            <span
                                className="
                                    truncate
                                "
                            >
                                {getStaffName(
                                    booking
                                )}
                            </span>
                        </div>

                    </div>

                </div>


                {/* =================================================
                    RATING
                ================================================= */}

                <div
                    className="
                        mt-6
                    "
                >

                    <div
                        className="
                            text-sm
                            font-semibold
                            text-[#344054]
                        "
                    >
                        Ваша оценка
                    </div>


                    <div
                        className="
                            mt-3
                            flex
                            items-center
                            gap-2
                        "
                        onMouseLeave={() =>
                            setHoverRating(
                                0
                            )
                        }
                    >

                        {[
                            1,
                            2,
                            3,
                            4,
                            5
                        ].map(
                            value => {

                                const active =
                                    value <=
                                    activeRating;


                                return (
                                    <button
                                        key={
                                            value
                                        }
                                        type="button"
                                        aria-label={
                                            `${value} из 5`
                                        }
                                        disabled={
                                            isPending
                                        }
                                        onMouseEnter={() =>
                                            setHoverRating(
                                                value
                                            )
                                        }
                                        onFocus={() =>
                                            setHoverRating(
                                                value
                                            )
                                        }
                                        onBlur={() =>
                                            setHoverRating(
                                                0
                                            )
                                        }
                                        onClick={() =>
                                            setRating(
                                                value
                                            )
                                        }
                                        className="
                                            cursor-pointer
                                            rounded-lg
                                            p-1
                                            transition
                                            hover:scale-110

                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    >
                                        <Star
                                            size={
                                                34
                                            }
                                            className={
                                                active
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300'
                                            }
                                        />
                                    </button>
                                );
                            }
                        )}

                    </div>


                    <div
                        className="
                            mt-2
                            min-h-5
                            text-xs
                            text-[#858585]
                        "
                    >
                        {rating ===
                            0
                            ? 'Выберите оценку от 1 до 5.'
                            : `Вы выбрали: ${rating} из 5`}
                    </div>

                </div>


                {/* =================================================
                    COMMENT
                ================================================= */}

                <div
                    className="
                        mt-5
                    "
                >

                    <label
                        htmlFor="review-text"
                        className="
                            text-sm
                            font-semibold
                            text-[#344054]
                        "
                    >
                        Комментарий
                    </label>


                    <textarea
                        id="review-text"
                        value={
                            text
                        }
                        disabled={
                            isPending
                        }
                        onChange={
                            event =>
                                setText(
                                    event.target.value
                                )
                        }
                        placeholder="Расскажите, что вам понравилось или что можно улучшить"
                        rows={
                            5
                        }
                        className="
                            mt-2
                            w-full
                            resize-none
                            rounded-xl
                            border
                            border-[#D9DDEC]
                            bg-white
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-[#111115]
                            outline-none
                            transition

                            placeholder:font-normal
                            placeholder:text-[#858585]

                            focus:border-[#4F46E5]
                            focus:ring-2
                            focus:ring-[#4F46E5]/10

                            disabled:cursor-not-allowed
                            disabled:bg-slate-50
                        "
                    />

                    <div
                        className="
                            mt-1
                            text-xs
                            text-[#98A2B3]
                        "
                    >
                        Комментарий можно оставить пустым.
                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {errorMessage && (

                    <div
                        className="
                            mt-4
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-red-600
                        "
                    >
                        {errorMessage}
                    </div>

                )}


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div
                    className="
                        mt-6
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
                            py-3
                            text-sm
                            font-semibold
                            text-[#344054]
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
                            isPending ||
                            rating ===
                                0
                        }
                        onClick={
                            handleSubmit
                        }
                        className="
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

                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {isPending
                            ? 'Отправляем...'
                            : 'Отправить отзыв'}
                    </button>

                </div>

            </div>

        </div>
    );
}

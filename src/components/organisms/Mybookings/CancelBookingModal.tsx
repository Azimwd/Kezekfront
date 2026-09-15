import {
    AlertTriangle,
    CalendarDays,
    Clock3,
    X
} from 'lucide-react';

import type {
    MyBooking
} from '../../../api/myBookings';


interface CancelBookingModalProps {
    booking: MyBooking;

    onClose: () => void;

    onConfirm: () => void;

    isPending: boolean;

    errorMessage?: string;
}


const formatDate = (
    value: string
) => {

    return new Date(
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


const getServiceName = (
    booking: MyBooking
) => {

    return (
        booking.service_name ??
        `Услуга #${booking.service}`
    );
};


export default function CancelBookingModal({
    booking,
    onClose,
    onConfirm,
    isPending,
    errorMessage = ''
}: CancelBookingModalProps) {

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
                    max-w-[460px]
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#D9DDEC]
                    bg-white
                    shadow-2xl
                "
                onClick={event =>
                    event.stopPropagation()
                }
            >

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
                        px-6
                        pb-4
                        pt-6
                    "
                >

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-red-50
                            text-red-600
                        "
                    >
                        <AlertTriangle
                            size={24}
                        />
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
                            ml-auto
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
                            size={20}
                        />
                    </button>

                </div>


                <div
                    className="
                        px-6
                        pb-6
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-bold
                            text-slate-900
                        "
                    >
                        Отменить запись?
                    </h2>


                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        После отмены запись перейдёт в историю.
                        Если понадобится, вы сможете записаться снова.
                    </p>


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
                                text-sm
                                font-semibold
                                text-slate-900
                            "
                        >
                            {getServiceName(
                                booking
                            )}
                        </div>


                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                gap-x-5
                                gap-y-2
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-slate-500
                                "
                            >
                                <CalendarDays
                                    size={16}
                                    className="text-[#4F46E5]"
                                />

                                {formatDate(
                                    booking.start_at
                                )}
                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-slate-500
                                "
                            >
                                <Clock3
                                    size={16}
                                    className="text-[#4F46E5]"
                                />

                                {formatTime(
                                    booking.start_at
                                )}
                            </div>

                        </div>

                    </div>


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
                                text-red-600
                            "
                        >
                            {errorMessage}
                        </div>

                    )}


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
                            Оставить запись
                        </button>


                        <button
                            type="button"
                            disabled={
                                isPending
                            }
                            onClick={
                                onConfirm
                            }
                            className="
                                cursor-pointer
                                rounded-xl
                                bg-red-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-red-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {isPending
                                ? 'Отменяем...'
                                : 'Да, отменить'}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

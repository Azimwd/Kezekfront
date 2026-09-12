import {
    CalendarClock,
    Check,
    CircleCheck,
    X
} from 'lucide-react';

import Button from '../../../../atoms/Button';
import Icon from '../../../../atoms/Icon';
import Typography from '../../../../atoms/Typography';


interface ManageAppoinmentProps {
    status: string;

    isPending: boolean;

    onConfirm: () => void;

    onComplete: () => void;

    onCancel: () => void;

    onReschedule: () => void;
}


export default function ManageAppoinment({
    status,
    isPending,
    onConfirm,
    onComplete,
    onCancel,
    onReschedule
}: ManageAppoinmentProps) {

    /*
     * BACKEND STATUSES:
     *
     * pending
     * confirmed
     * completed
     * cancelled_by_client
     * cancelled_by_business
     */

    const isCancelled =
        status ===
            'cancelled_by_client' ||
        status ===
            'cancelled_by_business';


    const isCompleted =
        status ===
        'completed';


    return (
        <div
            className="
                w-full
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-white
                px-6
                py-5
            "
        >

            <Typography
                text="УПРАВЛЕНИЕ ЗАПИСЬЮ"
                className="
                    text-xs
                    font-medium
                    uppercase
                    text-[#111827]
                "
            />


            {/* ACTIVE APPOINTMENT */}

            {!isCompleted &&
                !isCancelled && (

                    <div
                        className="
                            mt-5
                            flex
                            flex-col
                            gap-3
                        "
                    >

                        {/* CONFIRM */}

                        {status ===
                            'pending' && (

                            <Button
                                type="button"
                                disabled={
                                    isPending
                                }
                                onClick={
                                    onConfirm
                                }
                                className="
                                    flex
                                    w-full
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#4F46E5]
                                    px-4
                                    py-3
                                    text-white
                                    transition
                                    hover:bg-[#4338CA]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <Icon
                                    icon={
                                        Check
                                    }
                                    size={
                                        18
                                    }
                                />

                                <span>
                                    {isPending
                                        ? 'Подтверждение...'
                                        : 'Подтвердить запись'
                                    }
                                </span>

                            </Button>

                        )}


                        {/* COMPLETE */}

                        {status ===
                            'confirmed' && (

                            <Button
                                type="button"
                                disabled={
                                    isPending
                                }
                                onClick={
                                    onComplete
                                }
                                className="
                                    flex
                                    w-full
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-emerald-600
                                    px-4
                                    py-3
                                    text-white
                                    transition
                                    hover:bg-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <Icon
                                    icon={
                                        CircleCheck
                                    }
                                    size={
                                        18
                                    }
                                />

                                <span>
                                    {isPending
                                        ? 'Завершение...'
                                        : 'Завершить запись'
                                    }
                                </span>

                            </Button>

                        )}


                        {/* RESCHEDULE */}

                        <Button
                            type="button"
                            disabled={
                                isPending
                            }
                            onClick={
                                onReschedule
                            }
                            className="
                                flex
                                w-full
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#EEF2FF]
                                px-4
                                py-3
                                text-[#4F46E5]
                                transition
                                hover:bg-[#E0E7FF]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <Icon
                                icon={
                                    CalendarClock
                                }
                                size={
                                    18
                                }
                            />

                            <span>
                                Перенести запись
                            </span>

                        </Button>


                        {/* CANCEL */}

                        <Button
                            type="button"
                            disabled={
                                isPending
                            }
                            onClick={
                                onCancel
                            }
                            className="
                                flex
                                w-full
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-red-50
                                px-4
                                py-3
                                text-red-600
                                transition
                                hover:bg-red-100
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <Icon
                                icon={
                                    X
                                }
                                size={
                                    18
                                }
                            />

                            <span>
                                Отменить запись
                            </span>

                        </Button>

                    </div>

                )}


            {/* COMPLETED */}

            {isCompleted && (

                <div
                    className="
                        mt-5
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        bg-emerald-50
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-emerald-700
                    "
                >

                    <CircleCheck
                        size={
                            18
                        }
                    />

                    Запись завершена

                </div>

            )}


            {/* CANCELLED */}

            {isCancelled && (

                <div
                    className="
                        mt-5
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-red-600
                    "
                >

                    <X
                        size={
                            18
                        }
                    />

                    {status ===
                    'cancelled_by_client'
                        ? 'Запись отменена клиентом'
                        : 'Запись отменена бизнесом'
                    }

                </div>

            )}

        </div>
    );
}
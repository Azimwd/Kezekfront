import {
    CalendarClock,
    Check,
    CircleCheck,
    X
} from 'lucide-react';

import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';


interface AppointmentManagementProps {
    status: string;

    isPending: boolean;

    onConfirm: () => void;

    onComplete: () => void;

    onCancel: () => void;

    onReschedule: () => void;
}


export default function AppointmentManagement({
    status,
    isPending,
    onConfirm,
    onComplete,
    onCancel,
    onReschedule
}: AppointmentManagementProps) {

    const isFinished =
        status === 'completed' ||
        status === 'cancelled_by_client' ||
        status === 'cancelled_by_business';


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
                    text-slate-700
                "
            />


            {!isFinished && (
                <div
                    className="
                        mt-5
                        flex
                        flex-wrap
                        gap-3
                    "
                >

                    {status === 'pending' && (

                        <Button
                            type="button"
                            disabled={isPending}
                            onClick={onConfirm}
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-[#4F46E5]
                                px-5
                                py-3
                                text-white
                            "
                        >
                            <Icon
                                icon={Check}
                                size={17}
                            />

                            Подтвердить
                        </Button>

                    )}


                    {status === 'confirmed' && (

                        <Button
                            type="button"
                            disabled={isPending}
                            onClick={onComplete}
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-emerald-600
                                px-5
                                py-3
                                text-white
                            "
                        >
                            <Icon
                                icon={CircleCheck}
                                size={17}
                            />

                            Завершить
                        </Button>

                    )}


                    <Button
                        type="button"
                        disabled={isPending}
                        onClick={onReschedule}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#EDEBFF]
                            px-5
                            py-3
                            text-[#4F46E5]
                        "
                    >
                        <Icon
                            icon={CalendarClock}
                            size={17}
                        />

                        Перенести
                    </Button>


                    <Button
                        type="button"
                        disabled={isPending}
                        onClick={onCancel}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-red-50
                            px-5
                            py-3
                            text-red-600
                        "
                    >
                        <Icon
                            icon={X}
                            size={17}
                        />

                        Отменить
                    </Button>

                </div>
            )}


            {isFinished && (

                <Typography
                    text={
                        status === 'completed'
                            ? 'Запись завершена'
                            : 'Запись отменена'
                    }
                    className="
                        mt-4
                        text-sm
                        font-medium
                        text-slate-500
                    "
                />

            )}

        </div>
    );
}
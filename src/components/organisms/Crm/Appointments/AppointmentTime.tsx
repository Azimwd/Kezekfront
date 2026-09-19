import {
    CalendarDays,
    Clock3
} from 'lucide-react';

import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';


interface AppointmentTimeProps {
    date: string;
    timeFrom: string;
    timeTo: string;
}


export default function AppointmentTime({
    date,
    timeFrom,
    timeTo
}: AppointmentTimeProps) {

    return (
        <div
            className="
                h-full
                w-full
                rounded-2xl
                border
                border-[#E3E6ED]
                bg-white
                p-5
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
            "
        >

            <Typography
                text="ВРЕМЯ"
                className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-600
                "
            />


            <div
                className="
                    mt-5
                    flex
                    items-center
                    gap-3
                "
            >
                <Icon
                    icon={CalendarDays}
                    size={20}
                    className="text-[#4F46E5]"
                />

                <Typography
                    text={date}
                    className="
                        text-lg
                        font-semibold
                        text-[#111827]
                    "
                />
            </div>


            <div
                className="
                    mt-3
                    flex
                    items-center
                    gap-3
                "
            >
                <Icon
                    icon={Clock3}
                    size={20}
                    className="text-[#4F46E5]"
                />

                <Typography
                    text={`${timeFrom} - ${timeTo}`}
                    className="
                        text-lg
                        font-semibold
                        text-[#4F46E5]
                    "
                />
            </div>

        </div>
    );
}
import {
    User
} from 'lucide-react';

import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';


interface AppointmentStaffProps {
    firstName: string | null;
    lastName: string | null;
    position: string | null;
}


export default function AppointmentStaff({
    firstName,
    lastName,
    position
}: AppointmentStaffProps) {

    const fullName =
        `${firstName || ''} ${lastName || ''}`.trim();


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
                text="МАСТЕР"
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
                    gap-4
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
                        rounded-full
                        bg-[#EEF2FF]
                    "
                >
                    <Icon
                        icon={User}
                        size={21}
                        className="text-[#4F46E5]"
                    />
                </div>


                <div className="min-w-0">

                    <Typography
                        text={
                            fullName ||
                            'Мастер не назначен'
                        }
                        className="
                            truncate
                            text-base
                            font-semibold
                            text-[#111827]
                        "
                    />


                    <Typography
                        text={
                            position ||
                            'Должность не указана'
                        }
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                        "
                    />

                </div>

            </div>

        </div>
    );
}
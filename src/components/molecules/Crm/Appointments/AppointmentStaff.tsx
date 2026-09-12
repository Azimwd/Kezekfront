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
        `${firstName || ''} ${lastName || ''}`
            .trim();


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
                text="МАСТЕР"
                className="
                    text-xs
                    font-medium
                    uppercase
                    text-slate-700
                "
            />


            <div
                className="
                    mt-4
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
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-50
                    "
                >
                    <Icon
                        icon={User}
                        size={22}
                        className="text-[#4F46E5]"
                    />
                </div>


                <div>

                    <Typography
                        text={
                            fullName ||
                            'Мастер не назначен'
                        }
                        className="
                            text-base
                            font-medium
                            text-[#111827]
                        "
                    />


                    {position && (
                        <Typography
                            text={position}
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                            "
                        />
                    )}

                </div>

            </div>

        </div>
    );
}
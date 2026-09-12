import {
    CalendarDays,
    CalendarPlus,
    UserPlus
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';


export default function QuickActions() {

    const navigate =
        useNavigate();


    return (
        <div
            className="
                rounded-2xl
                border
                border-[#D9DDED]
                bg-white
                p-4
                shadow-sm
            "
        >

            <h2
                className="
                    mb-4
                    text-lg
                    font-semibold
                    text-[#0F172A]
                "
            >
                Быстрые действия
            </h2>


            <div
                className="
                    flex
                    flex-col
                    gap-2
                "
            >

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/appointments/create'
                        )
                    }
                    className="
                        flex
                        h-11
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        border
                        border-[#C7C4D8]
                        px-3
                        text-left
                        text-xs
                        font-medium
                        text-slate-700
                        transition
                        hover:bg-slate-50
                    "
                >

                    <span
                        className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            bg-[#4F46E5]
                            text-white
                        "
                    >
                        <CalendarPlus
                            size={15}
                        />
                    </span>

                    Создать запись

                </button>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/schedule'
                        )
                    }
                    className="
                        flex
                        h-11
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        border
                        border-[#C7C4D8]
                        px-3
                        text-left
                        text-xs
                        font-medium
                        text-slate-700
                        transition
                        hover:bg-slate-50
                    "
                >

                    <span
                        className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                        "
                    >
                        <CalendarDays
                            size={15}
                        />
                    </span>

                    Управление расписанием

                </button>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/staff'
                        )
                    }
                    className="
                        flex
                        h-11
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        border
                        border-[#C7C4D8]
                        px-3
                        text-left
                        text-xs
                        font-medium
                        text-slate-700
                        transition
                        hover:bg-slate-50
                    "
                >

                    <span
                        className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                        "
                    >
                        <UserPlus
                            size={15}
                        />
                    </span>

                    Добавить мастера

                </button>

            </div>

        </div>
    );
}
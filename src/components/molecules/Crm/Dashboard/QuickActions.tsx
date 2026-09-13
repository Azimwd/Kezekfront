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
                border-[#D9DDEC]
                bg-white
                p-5
                shadow-sm
            "
        >

            {/* TITLE */}

            <h2
                className="
                    mb-4
                    text-[18px]
                    font-semibold
                    text-[#101828]
                "
            >
                Быстрые действия
            </h2>


            {/* ACTIONS */}

            <div
                className="
                    flex
                    flex-col
                    gap-3
                "
            >

                {/* CREATE APPOINTMENT */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/appointments/create'
                        )
                    }
                    className="
                        group
                        flex
                        min-h-[52px]
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[#C7C4D8]
                        bg-white
                        px-3.5
                        text-left
                        transition
                        hover:border-[#AAA5CA]
                        hover:bg-[#F9FAFB]
                    "
                >

                    <span
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#4F46E5]
                            text-white
                            transition
                            group-hover:bg-[#4338CA]
                        "
                    >
                        <CalendarPlus
                            size={17}
                        />
                    </span>


                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <div
                            className="
                                text-[13px]
                                font-medium
                                text-[#344054]
                            "
                        >
                            Создать запись
                        </div>

                        <div
                            className="
                                mt-0.5
                                text-[10px]
                                text-[#98A2B3]
                            "
                        >
                            Добавить новую запись клиента
                        </div>

                    </div>

                </button>


                {/* SCHEDULE */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/schedule'
                        )
                    }
                    className="
                        group
                        flex
                        min-h-[52px]
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[#C7C4D8]
                        bg-white
                        px-3.5
                        text-left
                        transition
                        hover:border-[#AAA5CA]
                        hover:bg-[#F9FAFB]
                    "
                >

                    <span
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                            transition
                            group-hover:bg-[#E0E7FF]
                        "
                    >
                        <CalendarDays
                            size={17}
                        />
                    </span>


                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <div
                            className="
                                text-[13px]
                                font-medium
                                text-[#344054]
                            "
                        >
                            Управление расписанием
                        </div>

                        <div
                            className="
                                mt-0.5
                                text-[10px]
                                text-[#98A2B3]
                            "
                        >
                            Настроить рабочее время мастеров
                        </div>

                    </div>

                </button>


                {/* STAFF */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/staff'
                        )
                    }
                    className="
                        group
                        flex
                        min-h-[52px]
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[#C7C4D8]
                        bg-white
                        px-3.5
                        text-left
                        transition
                        hover:border-[#AAA5CA]
                        hover:bg-[#F9FAFB]
                    "
                >

                    <span
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                            transition
                            group-hover:bg-[#E0E7FF]
                        "
                    >
                        <UserPlus
                            size={17}
                        />
                    </span>


                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <div
                            className="
                                text-[13px]
                                font-medium
                                text-[#344054]
                            "
                        >
                            Добавить мастера
                        </div>

                        <div
                            className="
                                mt-0.5
                                text-[10px]
                                text-[#98A2B3]
                            "
                        >
                            Управление сотрудниками бизнеса
                        </div>

                    </div>

                </button>

            </div>

        </div>
    );
}
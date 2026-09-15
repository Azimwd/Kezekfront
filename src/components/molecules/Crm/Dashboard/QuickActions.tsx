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
                w-full
                min-w-0
                rounded-2xl
                border
                border-[#D9DDEC]
                bg-white
                p-4
                shadow-sm

                sm:p-5
            "
        >
            <h2
                className="
                    mb-4
                    text-[17px]
                    font-semibold
                    text-[#101828]

                    sm:text-[18px]
                "
            >
                Быстрые действия
            </h2>


            <div
                className="
                    flex
                    w-full
                    min-w-0
                    flex-col
                    gap-3
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
                        group
                        flex
                        min-h-[58px]
                        w-full
                        min-w-0
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[#C7C4D8]
                        bg-white
                        px-3
                        py-3
                        text-left
                        transition
                        hover:border-[#AAA5CA]
                        hover:bg-[#F9FAFB]

                        sm:min-h-[52px]
                        sm:px-3.5
                    "
                >
                    <span
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#4F46E5]
                            text-white
                            transition
                            group-hover:bg-[#4338CA]

                            sm:h-9
                            sm:w-9
                        "
                    >
                        <CalendarPlus
                            size={18}
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
                                leading-5
                                text-[#344054]
                            "
                        >
                            Создать запись
                        </div>


                        <div
                            className="
                                mt-0.5
                                break-words
                                text-[11px]
                                leading-4
                                text-[#98A2B3]

                                sm:text-[10px]
                            "
                        >
                            Добавить новую запись клиента
                        </div>
                    </div>
                </button>


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
                        min-h-[58px]
                        w-full
                        min-w-0
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[#C7C4D8]
                        bg-white
                        px-3
                        py-3
                        text-left
                        transition
                        hover:border-[#AAA5CA]
                        hover:bg-[#F9FAFB]

                        sm:min-h-[52px]
                        sm:px-3.5
                    "
                >
                    <span
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                            transition
                            group-hover:bg-[#E0E7FF]

                            sm:h-9
                            sm:w-9
                        "
                    >
                        <CalendarDays
                            size={18}
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
                                break-words
                                text-[13px]
                                font-medium
                                leading-5
                                text-[#344054]
                            "
                        >
                            Управление расписанием
                        </div>


                        <div
                            className="
                                mt-0.5
                                break-words
                                text-[11px]
                                leading-4
                                text-[#98A2B3]

                                sm:text-[10px]
                            "
                        >
                            Настроить рабочее время мастеров
                        </div>
                    </div>
                </button>


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
                        min-h-[58px]
                        w-full
                        min-w-0
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[#C7C4D8]
                        bg-white
                        px-3
                        py-3
                        text-left
                        transition
                        hover:border-[#AAA5CA]
                        hover:bg-[#F9FAFB]

                        sm:min-h-[52px]
                        sm:px-3.5
                    "
                >
                    <span
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                            transition
                            group-hover:bg-[#E0E7FF]

                            sm:h-9
                            sm:w-9
                        "
                    >
                        <UserPlus
                            size={18}
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
                                leading-5
                                text-[#344054]
                            "
                        >
                            Добавить мастера
                        </div>


                        <div
                            className="
                                mt-0.5
                                break-words
                                text-[11px]
                                leading-4
                                text-[#98A2B3]

                                sm:text-[10px]
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

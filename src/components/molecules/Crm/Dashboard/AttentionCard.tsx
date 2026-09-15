import {
    AlertCircle,
    ChevronRight
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';


interface AttentionCardProps {
    pendingCount: number;
}


export default function AttentionCard({
    pendingCount
}: AttentionCardProps) {
    const navigate =
        useNavigate();


    return (
        <div
            className="
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-[#F2D79A]
                bg-white
                shadow-sm
            "
        >
            <div
                className="
                    flex
                    min-w-0
                    items-center
                    gap-2
                    bg-[#FFF4DA]
                    px-3.5
                    py-3
                    text-[13px]
                    font-semibold
                    text-[#F79009]

                    sm:px-4
                "
            >
                <AlertCircle
                    size={17}
                    className="shrink-0"
                />

                <span
                    className="
                        min-w-0
                        break-words
                    "
                >
                    Требуют внимания
                </span>
            </div>


            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/crm/appointments?status=pending'
                    )
                }
                className="
                    flex
                    min-h-[72px]
                    w-full
                    min-w-0
                    cursor-pointer
                    items-center
                    gap-3
                    border-b
                    border-[#EAECF0]
                    px-3.5
                    py-4
                    text-left
                    transition
                    hover:bg-[#F9FAFB]

                    sm:px-4
                "
            >
                <div
                    className="
                        min-w-0
                        flex-1
                    "
                >
                    <div
                        className="
                            flex
                            min-w-0
                            flex-wrap
                            items-center
                            gap-2
                        "
                    >
                        <span
                            className="
                                min-w-0
                                break-words
                                text-[13px]
                                font-medium
                                leading-5
                                text-[#344054]
                            "
                        >
                            Неподтвержденные записи
                        </span>


                        {pendingCount > 0 && (
                            <span
                                className="
                                    flex
                                    min-w-[22px]
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#FFF7ED]
                                    px-1.5
                                    py-0.5
                                    text-[10px]
                                    font-semibold
                                    text-[#F79009]
                                "
                            >
                                {pendingCount}
                            </span>
                        )}
                    </div>


                    <div
                        className="
                            mt-1
                            break-words
                            text-[11px]
                            leading-4
                            text-[#98A2B3]
                        "
                    >
                        {
                            pendingCount > 0
                                ? 'Записи ожидают подтверждения'
                                : 'Все записи обработаны'
                        }
                    </div>
                </div>


                <ChevronRight
                    size={18}
                    className="
                        shrink-0
                        text-[#98A2B3]
                    "
                />
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
                    min-h-[72px]
                    w-full
                    min-w-0
                    cursor-pointer
                    items-center
                    gap-3
                    px-3.5
                    py-4
                    text-left
                    transition
                    hover:bg-[#F9FAFB]

                    sm:px-4
                "
            >
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
                        Расписание мастеров
                    </div>


                    <div
                        className="
                            mt-1
                            break-words
                            text-[11px]
                            leading-4
                            text-[#98A2B3]
                        "
                    >
                        Проверьте рабочий график сотрудников
                    </div>
                </div>


                <ChevronRight
                    size={18}
                    className="
                        shrink-0
                        text-[#98A2B3]
                    "
                />
            </button>
        </div>
    );
}

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
                overflow-hidden
                rounded-2xl
                border
                border-[#F2D79A]
                bg-white
                shadow-sm
            "
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    items-center
                    gap-2
                    bg-[#FFF4DA]
                    px-4
                    py-3
                    text-[13px]
                    font-semibold
                    text-[#F79009]
                "
            >

                <AlertCircle
                    size={17}
                />

                Требуют внимания

            </div>


            {/* PENDING APPOINTMENTS */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/crm/appointments?status=pending'
                    )
                }
                className="
                    flex
                    w-full
                    items-center
                    gap-3
                    border-b
                    border-[#EAECF0]
                    px-4
                    py-4
                    text-left
                    transition
                    hover:bg-[#F9FAFB]
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
                            items-center
                            gap-2
                        "
                    >

                        <span
                            className="
                                text-[13px]
                                font-medium
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
                            text-[11px]
                            leading-4
                            text-[#98A2B3]
                        "
                    >
                        {pendingCount > 0
                            ? 'Записи ожидают подтверждения'
                            : 'Все записи обработаны'
                        }
                    </div>

                </div>


                <ChevronRight
                    size={17}
                    className="
                        shrink-0
                        text-[#98A2B3]
                    "
                />

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
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-4
                    text-left
                    transition
                    hover:bg-[#F9FAFB]
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
                            text-[13px]
                            font-medium
                            text-[#344054]
                        "
                    >
                        Расписание мастеров
                    </div>


                    <div
                        className="
                            mt-1
                            text-[11px]
                            leading-4
                            text-[#98A2B3]
                        "
                    >
                        Проверьте рабочий график сотрудников
                    </div>

                </div>


                <ChevronRight
                    size={17}
                    className="
                        shrink-0
                        text-[#98A2B3]
                    "
                />

            </button>

        </div>
    );
}
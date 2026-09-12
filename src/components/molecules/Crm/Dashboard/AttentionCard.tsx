import {
    AlertCircle
} from 'lucide-react';


export default function AttentionCard() {

    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[#F0D99B]
                bg-white
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-2
                    bg-[#FFF5DB]
                    px-4
                    py-3
                    text-xs
                    font-medium
                    text-orange-600
                "
            >
                <AlertCircle
                    size={14}
                />

                Требуют внимания
            </div>


            <div
                className="
                    divide-y
                    divide-slate-100
                "
            >

                <div
                    className="
                        px-4
                        py-3
                    "
                >
                    <div
                        className="
                            text-xs
                            font-medium
                            text-slate-800
                        "
                    >
                        Неподтвержденные записи (3)
                    </div>

                    <div
                        className="
                            mt-1
                            text-[10px]
                            text-slate-400
                        "
                    >
                        Свяжитесь с клиентами
                        для подтверждения
                    </div>
                </div>


                <div
                    className="
                        px-4
                        py-3
                    "
                >
                    <div
                        className="
                            text-xs
                            font-medium
                            text-slate-800
                        "
                    >
                        Расписание не заполнено
                    </div>

                    <div
                        className="
                            mt-1
                            text-[10px]
                            text-slate-400
                        "
                    >
                        У мастера “Тимур”
                        нет графика на след. неделю
                    </div>
                </div>

            </div>

        </div>
    );
}
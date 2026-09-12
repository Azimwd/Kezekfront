import {
    MessageSquare,
    Star
} from 'lucide-react';


interface ReviewStatsProps {
    averageRating: number;
    totalReviews: number;
}


export default function ReviewStats({
    averageRating,
    totalReviews
}: ReviewStatsProps) {
    return (
        <div
            className="
                flex
                flex-wrap
                justify-end
                gap-3
            "
        >

            <div
                className="
                    flex
                    min-w-[170px]
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-5
                    py-4
                "
            >
                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-amber-50
                    "
                >
                    <Star
                        size={19}
                        className="
                            fill-amber-400
                            text-amber-400
                        "
                    />
                </div>

                <div>
                    <div className="text-2xl font-bold text-slate-950">
                        {averageRating}
                    </div>

                    <div
                        className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-500
                        "
                    >
                        Средний рейтинг
                    </div>
                </div>
            </div>


            <div
                className="
                    flex
                    min-w-[170px]
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-5
                    py-4
                "
            >
                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-100
                    "
                >
                    <MessageSquare
                        size={19}
                        className="text-[#4F46E5]"
                    />
                </div>

                <div>
                    <div className="text-2xl font-bold text-slate-950">
                        {totalReviews}
                    </div>

                    <div
                        className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-500
                        "
                    >
                        Всего отзывов
                    </div>
                </div>
            </div>

        </div>
    );
}
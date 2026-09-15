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
                grid
                w-full
                min-w-0
                grid-cols-1
                gap-3

                sm:grid-cols-2

                lg:w-auto
            "
        >

            {/* AVERAGE RATING */}

            <div
                className="
                    flex
                    w-full
                    min-w-0
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-4
                    py-4

                    sm:min-w-[170px]
                    sm:px-5

                    lg:w-auto
                "
            >
                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
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


                <div
                    className="
                        min-w-0
                        flex-1
                    "
                >
                    <div
                        className="
                            text-xl
                            font-bold
                            leading-none
                            text-slate-950

                            sm:text-2xl
                        "
                    >
                        {averageRating}
                    </div>


                    <div
                        className="
                            mt-1
                            text-[9px]
                            font-semibold
                            uppercase
                            leading-4
                            tracking-wider
                            text-slate-500
                        "
                    >
                        Средний рейтинг
                    </div>
                </div>
            </div>


            {/* TOTAL REVIEWS */}

            <div
                className="
                    flex
                    w-full
                    min-w-0
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-4
                    py-4

                    sm:min-w-[170px]
                    sm:px-5

                    lg:w-auto
                "
            >
                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-100
                    "
                >
                    <MessageSquare
                        size={19}
                        className="
                            text-[#4F46E5]
                        "
                    />
                </div>


                <div
                    className="
                        min-w-0
                        flex-1
                    "
                >
                    <div
                        className="
                            text-xl
                            font-bold
                            leading-none
                            text-slate-950

                            sm:text-2xl
                        "
                    >
                        {totalReviews}
                    </div>


                    <div
                        className="
                            mt-1
                            text-[9px]
                            font-semibold
                            uppercase
                            leading-4
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
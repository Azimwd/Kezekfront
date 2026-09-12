import {
    Filter
} from 'lucide-react';

import type {
    ReplyFilter,
    ReviewStaffOption
} from '../../../organisms/Crm/Reviews/ReviewsControl';


interface ReviewFiltersProps {

    rating:
        number |
        'all';

    onRatingChange: (
        value:
            number |
            'all'
    ) => void;


    staffId:
        number |
        'all';

    onStaffChange: (
        value:
            number |
            'all'
    ) => void;


    replyFilter:
        ReplyFilter;

    onReplyFilterChange: (
        value:
            ReplyFilter
    ) => void;


    staffOptions:
        ReviewStaffOption[];
}


export default function ReviewFilters({
    rating,
    onRatingChange,

    staffId,
    onStaffChange,

    replyFilter,
    onReplyFilterChange,

    staffOptions
}: ReviewFiltersProps) {

    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-4
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-white
                p-4
                lg:flex-row
                lg:items-center
            "
        >

            <div
                className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-slate-700
                "
            >

                <Filter
                    size={
                        16
                    }
                    className="
                        text-slate-500
                    "
                />

                <span>
                    Фильтры:
                </span>

            </div>


            <div
                className="
                    flex
                    w-full
                    flex-wrap
                    items-center
                    gap-3
                "
            >

                {/* RATING */}

                <select
                    value={
                        rating
                    }
                    onChange={(
                        event
                    ) => {

                        const value =
                            event
                                .target
                                .value;


                        onRatingChange(
                            value === 'all'
                                ? 'all'
                                : Number(
                                    value
                                )
                        );
                    }}
                    className="
                        h-10
                        min-w-[150px]
                        rounded-xl
                        border
                        border-[#c7c4d8]
                        bg-white
                        px-4
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition
                        focus:border-[#4F46E5]
                    "
                >

                    <option value="all">
                        Все оценки
                    </option>

                    <option value="5">
                        5 звёзд
                    </option>

                    <option value="4">
                        4 звезды
                    </option>

                    <option value="3">
                        3 звезды
                    </option>

                    <option value="2">
                        2 звезды
                    </option>

                    <option value="1">
                        1 звезда
                    </option>

                </select>


                {/* STAFF */}

                <select
                    value={
                        staffId
                    }
                    onChange={(
                        event
                    ) => {

                        const value =
                            event
                                .target
                                .value;


                        onStaffChange(
                            value === 'all'
                                ? 'all'
                                : Number(
                                    value
                                )
                        );
                    }}
                    className="
                        h-10
                        min-w-[180px]
                        rounded-xl
                        border
                        border-[#c7c4d8]
                        bg-white
                        px-4
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition
                        focus:border-[#4F46E5]
                    "
                >

                    <option value="all">
                        Все мастера
                    </option>


                    {staffOptions.map(
                        staff => (

                            <option
                                key={
                                    staff.id
                                }
                                value={
                                    staff.id
                                }
                            >
                                {
                                    staff.name
                                }
                            </option>

                        )
                    )}

                </select>


                {/* REPLY STATUS */}

                <div
                    className="
                        flex
                        overflow-hidden
                        rounded-xl
                        border
                        border-[#c7c4d8]
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            onReplyFilterChange(
                                'all'
                            )
                        }
                        className={`
                            px-4
                            py-2
                            text-sm
                            font-medium
                            transition

                            ${
                                replyFilter ===
                                'all'
                                    ? 'bg-[#4F46E5] text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }
                        `}
                    >
                        Все
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onReplyFilterChange(
                                'replied'
                            )
                        }
                        className={`
                            border-l
                            border-[#c7c4d8]
                            px-4
                            py-2
                            text-sm
                            font-medium
                            transition

                            ${
                                replyFilter ===
                                'replied'
                                    ? 'bg-[#4F46E5] text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }
                        `}
                    >
                        С ответом
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onReplyFilterChange(
                                'unreplied'
                            )
                        }
                        className={`
                            border-l
                            border-[#c7c4d8]
                            px-4
                            py-2
                            text-sm
                            font-medium
                            transition

                            ${
                                replyFilter ===
                                'unreplied'
                                    ? 'bg-[#4F46E5] text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }
                        `}
                    >
                        Без ответа
                    </button>

                </div>

            </div>

        </div>
    );
}
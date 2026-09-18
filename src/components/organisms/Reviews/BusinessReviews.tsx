import {
    useMemo,
    useState
} from 'react';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import {
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    MessageCircle,
    RefreshCw,
    Send,
    Star,
    UserRound
} from 'lucide-react';

import {
    getBusinessReviews,
    replyToReview,
    type ReviewItem,
    type ReviewFilters
} from '../../../api/reviews';


interface BusinessReviewsProps {
    businessId: number;

    /*
     * false -> публичный просмотр отзывов.
     * true  -> владелец бизнеса может отвечать.
     */
    allowReply?: boolean;
}


const formatDate = (
    value: string | null
) => {

    if (
        !value
    ) {
        return '';
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return '';
    }


    return date.toLocaleDateString(
        'ru-RU',
        {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }
    );
};


function RatingStars({
    rating,
    size = 17
}: {
    rating: number;
    size?: number;
}) {

    const safeRating =
        Math.max(
            0,
            Math.min(
                5,
                Number(
                    rating
                ) || 0
            )
        );


    return (
        <div
            className="
                flex
                items-center
                gap-0.5
            "
            aria-label={`Оценка ${safeRating} из 5`}
        >
            {
                Array.from(
                    {
                        length: 5
                    },
                    (
                        _,
                        index
                    ) => {

                        const active =
                            index <
                            safeRating;


                        return (
                            <Star
                                key={
                                    index
                                }
                                size={
                                    size
                                }
                                className={
                                    active
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200'
                                }
                            />
                        );
                    }
                )
            }
        </div>
    );
}


function ReviewCard({
    review,
    allowReply,
    isReplyOpen,
    replyText,
    replyError,
    isReplyPending,
    onOpenReply,
    onCancelReply,
    onReplyTextChange,
    onSubmitReply
}: {
    review: ReviewItem;
    allowReply: boolean;
    isReplyOpen: boolean;
    replyText: string;
    replyError: string;
    isReplyPending: boolean;
    onOpenReply: () => void;
    onCancelReply: () => void;
    onReplyTextChange: (value: string) => void;
    onSubmitReply: () => void;
}) {

    return (
        <article
            className="
                rounded-2xl
                border
                border-[#E2E5EF]
                bg-white
                p-5
                shadow-sm
                sm:p-6
            "
        >

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                "
            >

                <div
                    className="
                        flex
                        min-w-0
                        items-start
                        gap-3
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
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                        "
                    >
                        <UserRound
                            size={18}
                        />
                    </div>


                    <div
                        className="
                            min-w-0
                        "
                    >

                        <div
                            className="
                                truncate
                                text-sm
                                font-semibold
                                text-slate-900
                            "
                        >
                            {
                                review.client_name ||
                                'Клиент'
                            }
                        </div>


                        <div
                            className="
                                mt-1
                                flex
                                flex-wrap
                                items-center
                                gap-x-3
                                gap-y-1
                                text-xs
                                text-slate-500
                            "
                        >

                            {
                                review.service_name &&
                                (
                                    <span>
                                        {
                                            review.service_name
                                        }
                                    </span>
                                )
                            }


                            {
                                review.staff_name &&
                                (
                                    <>
                                        <span
                                            className="
                                                hidden
                                                sm:inline
                                            "
                                        >
                                            •
                                        </span>

                                        <span>
                                            Мастер:{' '}
                                            {
                                                review.staff_name
                                            }
                                        </span>
                                    </>
                                )
                            }

                        </div>

                    </div>

                </div>


                <div
                    className="
                        flex
                        shrink-0
                        flex-col
                        items-start
                        gap-1
                        sm:items-end
                    "
                >

                    <RatingStars
                        rating={
                            review.rating
                        }
                    />


                    <span
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        {
                            formatDate(
                                review.created_at
                            )
                        }
                    </span>

                </div>

            </div>


            {
                review.text?.trim() &&
                (
                    <p
                        className="
                            mt-4
                            whitespace-pre-line
                            text-sm
                            leading-6
                            text-slate-700
                        "
                    >
                        {
                            review.text
                        }
                    </p>
                )
            }


            {
                review.is_replied &&
                review.reply_text?.trim() &&
                (
                    <div
                        className="
                            mt-5
                            rounded-2xl
                            border
                            border-[#DCDCF8]
                            bg-[#F7F7FF]
                            px-4
                            py-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                font-semibold
                                text-[#4F46E5]
                            "
                        >

                            <MessageCircle
                                size={15}
                            />

                            Ответ бизнеса

                        </div>


                        <p
                            className="
                                mt-2
                                whitespace-pre-line
                                text-sm
                                leading-6
                                text-slate-700
                            "
                        >
                            {
                                review.reply_text
                            }
                        </p>


                        {
                            review.replied_at &&
                                (
                                    <div
                                        className="
                                            mt-2
                                            text-[11px]
                                            text-slate-400
                                        "
                                    >
                                        {
                                            formatDate(
                                                review.replied_at
                                            )
                                        }
                                    </div>
                                )
                        }

                    </div>
                )
            }


            {
                allowReply &&
                !review.is_replied &&
                (
                    <div
                        className="
                            mt-5
                        "
                    >

                        {
                            !isReplyOpen
                                ? (
                                    <button
                                        type="button"
                                        onClick={
                                            onOpenReply
                                        }
                                        className="
                                            inline-flex
                                            cursor-pointer
                                            items-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-[#CFCBF8]
                                            bg-white
                                            px-4
                                            py-2.5
                                            text-sm
                                            font-semibold
                                            text-[#4F46E5]
                                            transition
                                            hover:bg-[#F7F7FF]
                                        "
                                    >
                                        <MessageCircle
                                            size={16}
                                        />

                                        Ответить
                                    </button>
                                )
                                : (
                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-[#D9DDEC]
                                            bg-[#FAFBFF]
                                            p-4
                                        "
                                    >

                                        <label
                                            className="
                                                mb-2
                                                block
                                                text-sm
                                                font-semibold
                                                text-slate-800
                                            "
                                        >
                                            Ответ бизнеса
                                        </label>


                                        <textarea
                                            rows={4}
                                            value={
                                                replyText
                                            }
                                            onChange={
                                                event =>
                                                    onReplyTextChange(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Напишите ответ клиенту..."
                                            disabled={
                                                isReplyPending
                                            }
                                            className="
                                                w-full
                                                resize-none
                                                rounded-xl
                                                border
                                                border-[#D9DDEC]
                                                bg-white
                                                px-4
                                                py-3
                                                text-sm
                                                text-slate-900
                                                outline-none
                                                transition
                                                placeholder:text-slate-400
                                                focus:border-[#4F46E5]
                                                focus:ring-2
                                                focus:ring-[#4F46E5]/10
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        />


                                        {
                                            replyError &&
                                                (
                                                    <div
                                                        className="
                                                            mt-3
                                                            flex
                                                            items-start
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            border-red-200
                                                            bg-red-50
                                                            px-3
                                                            py-2.5
                                                            text-sm
                                                            text-red-700
                                                        "
                                                    >
                                                        <CircleAlert
                                                            size={17}
                                                            className="
                                                                mt-0.5
                                                                shrink-0
                                                            "
                                                        />

                                                        <span>
                                                            {
                                                                replyError
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                        }


                                        <div
                                            className="
                                                mt-3
                                                flex
                                                flex-wrap
                                                justify-end
                                                gap-2
                                            "
                                        >

                                            <button
                                                type="button"
                                                onClick={
                                                    onCancelReply
                                                }
                                                disabled={
                                                    isReplyPending
                                                }
                                                className="
                                                    cursor-pointer
                                                    rounded-xl
                                                    border
                                                    border-[#D9DDEC]
                                                    bg-white
                                                    px-4
                                                    py-2.5
                                                    text-sm
                                                    font-semibold
                                                    text-slate-600
                                                    transition
                                                    hover:bg-slate-50
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >
                                                Отмена
                                            </button>


                                            <button
                                                type="button"
                                                onClick={
                                                    onSubmitReply
                                                }
                                                disabled={
                                                    isReplyPending ||
                                                    !replyText.trim()
                                                }
                                                className="
                                                    inline-flex
                                                    cursor-pointer
                                                    items-center
                                                    gap-2
                                                    rounded-xl
                                                    bg-[#4F46E5]
                                                    px-4
                                                    py-2.5
                                                    text-sm
                                                    font-semibold
                                                    text-white
                                                    transition
                                                    hover:bg-[#4338CA]
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >

                                                <Send
                                                    size={15}
                                                />

                                                {
                                                    isReplyPending
                                                        ? 'Отправляем...'
                                                        : 'Отправить ответ'
                                                }

                                            </button>

                                        </div>

                                    </div>
                                )
                        }

                    </div>
                )
            }

        </article>
    );
}


export default function BusinessReviews({
    businessId,
    allowReply = false
}: BusinessReviewsProps) {

    const queryClient =
        useQueryClient();


    const [
        page,
        setPage
    ] = useState(
        1
    );


    const [
        rating,
        setRating
    ] = useState<
        number |
        undefined
    >(
        undefined
    );


    const [
        replyStatus,
        setReplyStatus
    ] = useState<
        'all' |
        'replied' |
        'unreplied'
    >(
        'all'
    );


    const [
        activeReplyId,
        setActiveReplyId
    ] = useState<
        number |
        null
    >(
        null
    );


    const [
        replyText,
        setReplyText
    ] = useState(
        ''
    );


    const [
        replyError,
        setReplyError
    ] = useState(
        ''
    );


    const filters =
        useMemo<
            ReviewFilters
        >(
            () => {

                const next:
                    ReviewFilters = {
                        page
                    };


                if (
                    rating !==
                    undefined
                ) {
                    next.rating =
                        rating;
                }


                if (
                    allowReply
                ) {
                    next.reply_status =
                        replyStatus;
                }


                return next;
            },
            [
                page,
                rating,
                replyStatus,
                allowReply
            ]
        );


    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch
    } = useQuery({

        queryKey: [
            'business-reviews',
            businessId,
            filters
        ],

        queryFn: () =>
            getBusinessReviews(
                businessId,
                filters
            ),

        enabled:
            Number.isInteger(
                businessId
            ) &&
            businessId > 0,

        retry:
            false
    });


    const replyMutation =
        useMutation({

            mutationFn:
                replyToReview,


            onMutate: () => {

                setReplyError(
                    ''
                );
            },


            onSuccess:
                async () => {

                    setActiveReplyId(
                        null
                    );


                    setReplyText(
                        ''
                    );


                    setReplyError(
                        ''
                    );


                    await queryClient.invalidateQueries({
                        queryKey: [
                            'business-reviews',
                            businessId
                        ]
                    });
                },


            onError: (
                error: any
            ) => {

                const message =
                    error?.response
                        ?.data
                        ?.reply_text?.[0] ??
                    error?.response
                        ?.data
                        ?.detail ??
                    error?.response
                        ?.data
                        ?.message ??
                    'Не удалось отправить ответ. Попробуйте ещё раз.';


                setReplyError(
                    String(
                        message
                    )
                );
            }
        });


    const reviews =
        data?.data ??
        [];


    const summary =
        data?.summary;


    const pagination =
        data?.pagination;


    const totalPages =
        pagination
            ?.total_pages ??
        1;


    const currentPage =
        pagination
            ?.current_page ??
        page;


    const handleRatingChange = (
        value:
            number |
            undefined
    ) => {

        setRating(
            value
        );


        setPage(
            1
        );
    };


    const handleReplyStatusChange = (
        value:
            'all' |
            'replied' |
            'unreplied'
    ) => {

        setReplyStatus(
            value
        );


        setPage(
            1
        );
    };


    const openReply = (
        reviewId: number
    ) => {

        setActiveReplyId(
            reviewId
        );


        setReplyText(
            ''
        );


        setReplyError(
            ''
        );
    };


    const closeReply = () => {

        if (
            replyMutation.isPending
        ) {
            return;
        }


        setActiveReplyId(
            null
        );


        setReplyText(
            ''
        );


        setReplyError(
            ''
        );
    };


    const submitReply = (
        reviewId: number
    ) => {

        const prepared =
            replyText.trim();


        if (
            !prepared ||
            replyMutation.isPending
        ) {
            return;
        }


        replyMutation.mutate({
            reviewId,
            reply_text:
                prepared
        });
    };


    if (
        !Number.isInteger(
            businessId
        ) ||
        businessId <= 0
    ) {

        return null;
    }


    return (
        <section
            className="
                w-full
            "
        >

            <div
                className="
                    mb-5
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-end
                    lg:justify-between
                "
            >

                <div>

                    <h2
                        className="
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        Отзывы
                    </h2>


                    <p
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                        "
                    >
                        Отзывы клиентов и ответы бизнеса
                    </p>

                </div>


                {
                    summary &&
                        (
                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-[#E2E5EF]
                                        bg-white
                                        px-4
                                        py-2.5
                                    "
                                >

                                    <Star
                                        size={18}
                                        className="
                                            fill-amber-400
                                            text-amber-400
                                        "
                                    />

                                    <span
                                        className="
                                            text-sm
                                            font-bold
                                            text-slate-900
                                        "
                                    >
                                        {
                                            Number(
                                                summary.average_rating
                                            ).toFixed(
                                                1
                                            )
                                        }
                                    </span>

                                </div>


                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-[#E2E5EF]
                                        bg-white
                                        px-4
                                        py-2.5
                                        text-sm
                                        text-slate-600
                                    "
                                >
                                    {
                                        summary.total_reviews
                                    }{' '}
                                    отзывов
                                </div>


                                {
                                    allowReply &&
                                        (
                                            <div
                                                className="
                                                    rounded-xl
                                                    border
                                                    border-[#E2E5EF]
                                                    bg-white
                                                    px-4
                                                    py-2.5
                                                    text-sm
                                                    text-slate-600
                                                "
                                            >
                                                Без ответа:{' '}
                                                <span
                                                    className="
                                                        font-semibold
                                                        text-slate-900
                                                    "
                                                >
                                                    {
                                                        summary.unreplied_count
                                                    }
                                                </span>
                                            </div>
                                        )
                                }

                            </div>
                        )
                }

            </div>


            <div
                className="
                    mb-5
                    flex
                    flex-col
                    gap-3
                    rounded-2xl
                    border
                    border-[#E2E5EF]
                    bg-[#FAFBFF]
                    p-4
                    md:flex-row
                    md:items-center
                    md:justify-between
                "
            >

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    "
                >

                    <button
                        type="button"
                        onClick={
                            () =>
                                handleRatingChange(
                                    undefined
                                )
                        }
                        className={`
                            cursor-pointer
                            rounded-full
                            border
                            px-3.5
                            py-2
                            text-xs
                            font-semibold
                            transition

                            ${
                                rating ===
                                undefined
                                    ? `
                                        border-[#4F46E5]
                                        bg-[#4F46E5]
                                        text-white
                                    `
                                    : `
                                        border-[#D9DDEC]
                                        bg-white
                                        text-slate-600
                                        hover:border-[#A5A0ED]
                                    `
                            }
                        `}
                    >
                        Все оценки
                    </button>


                    {
                        [
                            5,
                            4,
                            3,
                            2,
                            1
                        ].map(
                            value => (

                                <button
                                    key={
                                        value
                                    }
                                    type="button"
                                    onClick={
                                        () =>
                                            handleRatingChange(
                                                value
                                            )
                                    }
                                    className={`
                                        flex
                                        cursor-pointer
                                        items-center
                                        gap-1
                                        rounded-full
                                        border
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        transition

                                        ${
                                            rating ===
                                            value
                                                ? `
                                                    border-[#4F46E5]
                                                    bg-[#EEF2FF]
                                                    text-[#4F46E5]
                                                `
                                                : `
                                                    border-[#D9DDEC]
                                                    bg-white
                                                    text-slate-600
                                                    hover:border-[#A5A0ED]
                                                `
                                        }
                                    `}
                                >

                                    {
                                        value
                                    }

                                    <Star
                                        size={13}
                                        className="
                                            fill-amber-400
                                            text-amber-400
                                        "
                                    />

                                </button>

                            )
                        )
                    }

                </div>


                {
                    allowReply &&
                        (
                            <select
                                value={
                                    replyStatus
                                }
                                onChange={
                                    event =>
                                        handleReplyStatusChange(
                                            event.target.value as
                                                | 'all'
                                                | 'replied'
                                                | 'unreplied'
                                        )
                                }
                                className="
                                    cursor-pointer
                                    rounded-xl
                                    border
                                    border-[#D9DDEC]
                                    bg-white
                                    px-3.5
                                    py-2.5
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    focus:border-[#4F46E5]
                                "
                            >
                                <option
                                    value="all"
                                >
                                    Все отзывы
                                </option>

                                <option
                                    value="unreplied"
                                >
                                    Без ответа
                                </option>

                                <option
                                    value="replied"
                                >
                                    С ответом
                                </option>
                            </select>
                        )
                }

            </div>


            {
                isLoading
                    ? (
                        <div
                            className="
                                rounded-2xl
                                border
                                border-[#E2E5EF]
                                bg-white
                                px-5
                                py-10
                                text-center
                                text-sm
                                text-slate-500
                            "
                        >
                            Загрузка отзывов...
                        </div>
                    )
                    : isError
                        ? (
                            <div
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-5
                                    py-8
                                    text-center
                                "
                            >

                                <CircleAlert
                                    size={25}
                                    className="
                                        text-red-500
                                    "
                                />


                                <div
                                    className="
                                        text-sm
                                        text-red-700
                                    "
                                >
                                    Не удалось загрузить отзывы.
                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            refetch()
                                    }
                                    className="
                                        inline-flex
                                        cursor-pointer
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-white
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-red-600
                                        shadow-sm
                                    "
                                >
                                    <RefreshCw
                                        size={15}
                                    />

                                    Повторить
                                </button>

                            </div>
                        )
                        : reviews.length ===
                            0
                            ? (
                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-[#D9DDEC]
                                        bg-[#FAFBFF]
                                        px-5
                                        py-10
                                        text-center
                                    "
                                >
                                    <div
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-700
                                        "
                                    >
                                        Отзывов пока нет
                                    </div>

                                    <div
                                        className="
                                            mt-1
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        Здесь появятся отзывы клиентов после завершённых записей.
                                    </div>
                                </div>
                            )
                            : (
                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-4
                                    "
                                >

                                    {
                                        reviews.map(
                                            review => (

                                                <ReviewCard
                                                    key={
                                                        review.id
                                                    }
                                                    review={
                                                        review
                                                    }
                                                    allowReply={
                                                        allowReply
                                                    }
                                                    isReplyOpen={
                                                        activeReplyId ===
                                                        review.id
                                                    }
                                                    replyText={
                                                        activeReplyId ===
                                                        review.id
                                                            ? replyText
                                                            : ''
                                                    }
                                                    replyError={
                                                        activeReplyId ===
                                                        review.id
                                                            ? replyError
                                                            : ''
                                                    }
                                                    isReplyPending={
                                                        replyMutation.isPending &&
                                                        activeReplyId ===
                                                            review.id
                                                    }
                                                    onOpenReply={
                                                        () =>
                                                            openReply(
                                                                review.id
                                                            )
                                                    }
                                                    onCancelReply={
                                                        closeReply
                                                    }
                                                    onReplyTextChange={
                                                        setReplyText
                                                    }
                                                    onSubmitReply={
                                                        () =>
                                                            submitReply(
                                                                review.id
                                                            )
                                                    }
                                                />

                                            )
                                        )
                                    }

                                </div>
                            )
            }


            {
                totalPages >
                    1 &&
                (
                    <div
                        className="
                            mt-6
                            flex
                            flex-wrap
                            items-center
                            justify-between
                            gap-3
                        "
                    >

                        <div
                            className="
                                text-xs
                                text-slate-500
                            "
                        >
                            Страница{' '}
                            {
                                currentPage
                            }{' '}
                            из{' '}
                            {
                                totalPages
                            }

                            {
                                isFetching &&
                                    ' · обновление...'
                            }
                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <button
                                type="button"
                                disabled={
                                    currentPage <=
                                    1 ||
                                    isFetching
                                }
                                onClick={
                                    () =>
                                        setPage(
                                            current =>
                                                Math.max(
                                                    1,
                                                    current -
                                                        1
                                                )
                                        )
                                }
                                className="
                                    flex
                                    h-10
                                    w-10
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-[#D9DDEC]
                                    bg-white
                                    text-slate-600
                                    transition
                                    hover:border-[#A5A0ED]
                                    hover:text-[#4F46E5]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <ChevronLeft
                                    size={18}
                                />
                            </button>


                            <button
                                type="button"
                                disabled={
                                    currentPage >=
                                    totalPages ||
                                    isFetching
                                }
                                onClick={
                                    () =>
                                        setPage(
                                            current =>
                                                Math.min(
                                                    totalPages,
                                                    current +
                                                        1
                                                )
                                        )
                                }
                                className="
                                    flex
                                    h-10
                                    w-10
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-[#D9DDEC]
                                    bg-white
                                    text-slate-600
                                    transition
                                    hover:border-[#A5A0ED]
                                    hover:text-[#4F46E5]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <ChevronRight
                                    size={18}
                                />
                            </button>

                        </div>

                    </div>
                )
            }

        </section>
    );
}

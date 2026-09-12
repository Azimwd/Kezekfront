import {
    Reply,
    Star
} from 'lucide-react';

import {
    useState
} from 'react';

import type {
    ReviewItem
} from '../../../../api/reviews';


interface ReviewCardProps {
    review: ReviewItem;

    onReply: (
        reviewId: number,
        replyText: string
    ) => Promise<void>;

    isReplyPending:
        boolean;
}


const formatDate = (
    value: string
) => {

    const date =
        new Date(
            value
        );


    return date.toLocaleDateString(
        'ru-RU',
        {
            day:
                'numeric',

            month:
                'long',

            year:
                'numeric'
        }
    );
};


export default function ReviewCard({
    review,
    onReply,
    isReplyPending
}: ReviewCardProps) {

    const [
        isReplyOpen,
        setIsReplyOpen
    ] = useState(false);


    const [
        reply,
        setReply
    ] = useState(
        review.reply_text ?? ''
    );


    const [
        error,
        setError
    ] = useState('');


    const handleSubmit = async () => {

        const value =
            reply.trim();


        if (!value) {

            setError(
                'Введите текст ответа.'
            );

            return;
        }


        try {

            setError(
                ''
            );


            await onReply(
                review.id,
                value
            );


            setIsReplyOpen(
                false
            );

        } catch (
            error
        ) {

            console.error(
                error
            );


            setError(
                'Не удалось отправить ответ.'
            );
        }
    };


    return (
        <div
            className={`
                flex
                min-h-[320px]
                flex-col
                rounded-3xl
                border
                bg-white
                p-5
                transition

                ${
                    isReplyOpen
                        ? 'border-[#4F46E5] ring-1 ring-[#4F46E5]'
                        : 'border-[#c7c4d8]'
                }
            `}
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <div
                        className="
                            text-sm
                            font-bold
                            text-slate-950
                        "
                    >
                        {
                            review.client_name
                        }
                    </div>


                    <div
                        className="
                            mt-1
                            text-xs
                            text-slate-500
                        "
                    >
                        {
                            formatDate(
                                review.created_at
                            )
                        }
                    </div>

                </div>


                {/* STARS */}

                <div
                    className="
                        flex
                        items-center
                        gap-0.5
                    "
                >

                    {Array.from({
                        length: 5
                    }).map(
                        (
                            _,
                            index
                        ) => (

                            <Star
                                key={
                                    index
                                }
                                size={
                                    17
                                }
                                className={
                                    index <
                                    review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200'
                                }
                            />

                        )
                    )}

                </div>

            </div>


            {/* SERVICE + STAFF */}

            <div
                className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                "
            >

                <div
                    className="
                        rounded-lg
                        border
                        border-[#c7c4d8]
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-slate-700
                    "
                >
                    {
                        review.service_name ??
                        'Услуга'
                    }
                </div>


                {review.staff_name && (

                    <div
                        className="
                            rounded-lg
                            border
                            border-[#c7c4d8]
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-slate-700
                        "
                    >
                        {
                            review.staff_name
                        }
                    </div>

                )}

            </div>


            {/* REVIEW TEXT */}

            <p
                className="
                    mt-4
                    text-sm
                    leading-6
                    text-slate-800
                "
            >
                {
                    review.text ||
                    'Клиент не оставил комментарий.'
                }
            </p>


            {/* EXISTING REPLY */}

            {review.is_replied &&
                !isReplyOpen && (

                    <div
                        className="
                            mt-5
                            rounded-2xl
                            border
                            border-indigo-100
                            bg-indigo-50/50
                            p-4
                        "
                    >

                        <div
                            className="
                                text-xs
                                font-semibold
                                text-[#4F46E5]
                            "
                        >
                            Ваш ответ
                        </div>


                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-slate-700
                            "
                        >
                            {
                                review.reply_text
                            }
                        </p>

                    </div>

                )}


            {/* REPLY FORM */}

            {isReplyOpen && (

                <div
                    className="
                        mt-5
                        rounded-2xl
                        border
                        border-[#c7c4d8]
                        bg-slate-50
                        p-4
                    "
                >

                    <textarea
                        value={
                            reply
                        }
                        onChange={(
                            event
                        ) => {

                            setReply(
                                event
                                    .target
                                    .value
                            );

                            setError(
                                ''
                            );
                        }}
                        placeholder="Введите ответ клиенту..."
                        rows={
                            4
                        }
                        className="
                            w-full
                            resize-none
                            rounded-xl
                            border
                            border-[#c7c4d8]
                            bg-white
                            p-3
                            text-sm
                            outline-none
                            focus:border-[#4F46E5]
                        "
                    />


                    {error && (

                        <div
                            className="
                                mt-2
                                text-xs
                                text-red-500
                            "
                        >
                            {
                                error
                            }
                        </div>

                    )}


                    <div
                        className="
                            mt-3
                            flex
                            justify-end
                            gap-3
                        "
                    >

                        <button
                            type="button"
                            disabled={
                                isReplyPending
                            }
                            onClick={() =>
                                setIsReplyOpen(
                                    false
                                )
                            }
                            className="
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-slate-600
                                disabled:opacity-50
                            "
                        >
                            Отмена
                        </button>


                        <button
                            type="button"
                            disabled={
                                isReplyPending
                            }
                            onClick={
                                handleSubmit
                            }
                            className="
                                min-w-[110px]
                                rounded-xl
                                bg-[#4F46E5]
                                px-5
                                py-2
                                text-sm
                                font-medium
                                text-white
                                hover:bg-[#4338CA]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {isReplyPending
                                ? 'Отправка...'
                                : review.is_replied
                                    ? 'Сохранить'
                                    : 'Ответить'
                            }
                        </button>

                    </div>

                </div>

            )}


            {/* BUTTON */}

            {!isReplyOpen && (

                <div
                    className="
                        mt-auto
                        flex
                        justify-end
                        border-t
                        border-[#e2e4f0]
                        pt-4
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            setIsReplyOpen(
                                true
                            )
                        }
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#4F46E5]
                            px-5
                            py-2.5
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-[#4338CA]
                        "
                    >

                        <Reply
                            size={
                                15
                            }
                        />


                        {review.is_replied
                            ? 'Изменить ответ'
                            : 'Ответить'
                        }

                    </button>

                </div>

            )}

        </div>
    );
}
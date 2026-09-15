import {
    useEffect,
    useState
} from 'react';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import ReviewStats from '../../../molecules/Crm/Reviews/ReviewStats';
import ReviewFilters from '../../../molecules/Crm/Reviews/ReviewFilters';
import ReviewCard from '../../../molecules/Crm/Reviews/ReviewCard';

import Pagination from '../../../molecules/Crm/Staff/Pagination';

import {
    useBusiness
} from '../../../../context/BusinessContext';

import {
    getBusinessReviews,
    replyToReview
} from '../../../../api/reviews';

import {
    getAllMasters
} from '../../../../api/staff';


export type ReplyFilter =
    | 'all'
    | 'replied'
    | 'unreplied';


export interface ReviewStaffOption {
    id: number;
    name: string;
}


export default function ReviewsControl() {

    const {
        selectedBusiness
    } = useBusiness();


    const businessId =
        selectedBusiness
            ? Number(
                selectedBusiness.id
            )
            : null;


    const [
        rating,
        setRating
    ] = useState<
        number | 'all'
    >(
        'all'
    );


    const [
        staffId,
        setStaffId
    ] = useState<
        number | 'all'
    >(
        'all'
    );


    const [
        replyFilter,
        setReplyFilter
    ] = useState<ReplyFilter>(
        'all'
    );


    const [
        page,
        setPage
    ] = useState(1);


    const queryClient =
        useQueryClient();


    /*
     * При смене фильтров
     * возвращаемся на 1 страницу.
     */
    useEffect(() => {

        setPage(1);

    }, [
        businessId,
        rating,
        staffId,
        replyFilter
    ]);


    /*
     * -----------------------------
     * МАСТЕРА БИЗНЕСА
     * -----------------------------
     */

    const {
        data: masters = []
    } = useQuery({

        queryKey: [
            'review-masters',
            businessId
        ],

        queryFn: () =>
            getAllMasters(
                Number(
                    businessId
                )
            ),

        enabled:
            !!businessId,

        retry: false
    });


    const staffOptions:
        ReviewStaffOption[] =
        masters.map(
            (
                staff: any
            ) => ({
                id:
                    staff.id,

                name:
                    `${staff.first_name || ''} ${staff.last_name || ''}`
                        .trim()
            })
        );


    /*
     * -----------------------------
     * ОТЗЫВЫ
     * -----------------------------
     */

    const {
        data: reviewsResponse,
        isLoading,
        isFetching,
        error
    } = useQuery({

        queryKey: [
            'reviews',
            businessId,
            page,
            rating,
            staffId,
            replyFilter
        ],

        queryFn: () => {

            const filters:
                Record<string, unknown> = {
                    page
                };


            if (
                rating !== 'all'
            ) {
                filters.rating =
                    rating;
            }


            if (
                staffId !== 'all'
            ) {
                filters.staff_id =
                    staffId;
            }


            if (
                replyFilter !== 'all'
            ) {
                filters.reply_status =
                    replyFilter;
            }


            return getBusinessReviews(
                Number(
                    businessId
                ),
                filters
            );
        },

        enabled:
            !!businessId,

        retry: false,

        placeholderData:
            previousData =>
                previousData
    });


    /*
     * -----------------------------
     * ОТВЕТ НА ОТЗЫВ
     * -----------------------------
     */

    const replyMutation =
        useMutation({

            mutationFn:
                replyToReview,

            onSuccess: () => {

                queryClient.invalidateQueries({
                    queryKey: [
                        'reviews',
                        businessId
                    ]
                });

            },

            onError: (
                error
            ) => {

                console.error(
                    'Ошибка при отправке ответа:',
                    error
                );
            }
        });


    const handleReply = async (
        reviewId: number,
        replyText: string
    ) => {

        await replyMutation.mutateAsync({
            reviewId,
            reply_text:
                replyText
        });
    };


    /*
     * -----------------------------
     * NO BUSINESS
     * -----------------------------
     */

    if (
        !selectedBusiness
    ) {
        return (
            <div
                className="
                    flex
                    h-64
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    p-5
                "
            >
                <span
                    className="
                        text-lg
                        text-gray-500
                    "
                >
                    Пожалуйста, выберите бизнес в верхнем меню.
                </span>
            </div>
        );
    }


    /*
     * -----------------------------
     * INITIAL LOADING
     * -----------------------------
     */

    if (
        isLoading &&
        !reviewsResponse
    ) {
        return (
            <div
                className="
                    flex
                    h-64
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                "
            >
                <span className="text-gray-500">
                    Загрузка отзывов...
                </span>
            </div>
        );
    }


    /*
     * -----------------------------
     * ERROR
     * -----------------------------
     */

    if (
        error
    ) {
        return (
            <div
                className="
                    flex
                    h-64
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-red-200
                    bg-white
                "
            >
                <span className="text-red-500">
                    Не удалось загрузить отзывы.
                </span>
            </div>
        );
    }


    /*
     * -----------------------------
     * RESPONSE
     * -----------------------------
     */

    const reviews =
        reviewsResponse?.data ??
        [];


    const summary =
        reviewsResponse?.summary;


    const pagination =
        reviewsResponse?.pagination;


    const currentPage =
        pagination?.current_page ??
        page;


    const totalPages =
        pagination?.total_pages ??
        1;


    const totalCount =
        pagination?.count ??
        0;


    const pageSize =
        pagination?.page_size ??
        10;


    const firstItem =
        totalCount === 0
            ? 0
            : (
                currentPage - 1
            ) *
                pageSize +
              1;


    const lastItem =
        totalCount === 0
            ? 0
            : Math.min(
                currentPage *
                    pageSize,
                totalCount
            );


    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-6
            "
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    flex-col
                    gap-5
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                "
            >


                <ReviewStats
                    averageRating={
                        summary
                            ?.average_rating ??
                        0
                    }
                    totalReviews={
                        summary
                            ?.total_reviews ??
                        0
                    }
                />

            </div>


            {/* FILTERS */}

            <ReviewFilters
                rating={
                    rating
                }
                onRatingChange={
                    setRating
                }
                staffId={
                    staffId
                }
                onStaffChange={
                    setStaffId
                }
                replyFilter={
                    replyFilter
                }
                onReplyFilterChange={
                    setReplyFilter
                }
                staffOptions={
                    staffOptions
                }
            />


            {/* FETCHING */}

            {isFetching &&
                !isLoading && (
                    <div
                        className="
                            text-sm
                            text-slate-400
                        "
                    >
                        Обновление...
                    </div>
                )}


            {/* REVIEWS */}

            {reviews.length > 0 ? (

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-5
                        xl:grid-cols-2
                    "
                >

                    {reviews.map(
                        review => (
                            <ReviewCard
                                key={
                                    review.id
                                }
                                review={
                                    review
                                }
                                onReply={
                                    handleReply
                                }
                                isReplyPending={
                                    replyMutation.isPending
                                }
                            />
                        )
                    )}

                </div>

            ) : (

                <div
                    className="
                        rounded-2xl
                        border
                        border-[#c7c4d8]
                        bg-white
                        py-16
                        text-center
                        text-sm
                        text-slate-500
                    "
                >
                    Отзывы по выбранным фильтрам не найдены.
                </div>

            )}


            {/* PAGINATION */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-5
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <div
                    className="
                        text-sm
                        text-slate-500
                    "
                >
                    {totalCount === 0
                        ? 'Отзывов нет'
                        : `Показано ${firstItem}-${lastItem} из ${totalCount} отзывов`
                    }
                </div>


                <Pagination
                    currentPage={
                        currentPage
                    }
                    totalPages={
                        totalPages
                    }
                    onPageChange={
                        setPage
                    }
                    disabled={
                        isFetching
                    }
                />

            </div>

        </div>
    );
}
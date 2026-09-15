import {
    api
} from './api';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface Review {
    id: number;

    client: number;
    client_name: string;

    business: number;

    staff: number | null;
    staff_name: string | null;

    appointment: number;
    service_name: string;

    rating: number;
    text: string;

    reply_text: string;
    replied_at: string | null;
    is_replied: boolean;

    created_at: string;
}


export interface ReviewSummary {
    average_rating: number;
    total_reviews: number;
    replied_count: number;
    unreplied_count: number;
}


export interface ReviewPagination {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;

    next: string | null;
    previous: string | null;
}


export interface BusinessReviewsResponse {
    message: string;

    summary:
        ReviewSummary;

    pagination:
        ReviewPagination;

    data:
        Review[];
}


export interface GetBusinessReviewsFilters {
    page?: number;
    page_size?: number;

    rating?: number;
    staff_id?: number;

    reply_status?:
        | 'all'
        | 'replied'
        | 'unreplied';

    [key: string]:
        unknown;
}


/*
 * ============================================================
 * CREATE REVIEW
 * ============================================================
 */

export interface CreateReviewData {
    appointment: number;
    rating: number;
    text: string;
}


export interface CreateReviewResponse {
    message: string;
    data: Review;
}


/*
 * ============================================================
 * REPLY
 * ============================================================
 */

export interface ReplyToReviewData {
    reviewId: number;
    reply_text: string;
}


export interface ReplyToReviewResponse {
    message: string;
    data: Review;
}


/*
 * ============================================================
 * GET BUSINESS REVIEWS
 * ============================================================
 */

export const getBusinessReviews =
    async (
        businessId: number,
        filters:
            GetBusinessReviewsFilters = {}
    ): Promise<
        BusinessReviewsResponse
    > => {

        const response =
            await api.get<
                BusinessReviewsResponse
            >(
                `/api/reviews/businesses/${businessId}/`,
                {
                    params:
                        filters,

                    withCredentials:
                        true
                }
            );


        return response.data;
    };


/*
 * ============================================================
 * CREATE REVIEW
 * ============================================================
 *
 * Backend сам определяет:
 *
 * - клиента
 * - бизнес
 * - мастера
 *
 * по appointment.
 * ============================================================
 */

export const createReview =
    async (
        data:
            CreateReviewData
    ): Promise<
        CreateReviewResponse
    > => {

        const response =
            await api.post<
                CreateReviewResponse
            >(
                '/api/reviews/',
                data,
                {
                    withCredentials:
                        true
                }
            );


        return response.data;
    };


/*
 * ============================================================
 * REPLY TO REVIEW
 * ============================================================
 */

export const replyToReview =
    async ({
        reviewId,
        reply_text
    }: ReplyToReviewData): Promise<
        ReplyToReviewResponse
    > => {

        const response =
            await api.patch<
                ReplyToReviewResponse
            >(
                `/api/reviews/${reviewId}/reply/`,
                {
                    reply_text
                },
                {
                    withCredentials:
                        true
                }
            );


        return response.data;
    };

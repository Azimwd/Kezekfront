import { api } from './api';


export interface ReviewItem {
    id: number;

    client: number;
    client_name: string;

    business: number;

    staff: number | null;
    staff_name: string | null;

    appointment: number;
    service_name: string | null;

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


export interface ReviewsResponse {
    message: string;

    summary: ReviewSummary;

    pagination: ReviewPagination;

    data: ReviewItem[];
}


export interface ReviewFilters {
    page?: number;

    rating?: number;

    staff_id?: number;

    reply_status?:
        | 'all'
        | 'replied'
        | 'unreplied';
}


export interface ReplyReviewPayload {
    reviewId: number;
    reply_text: string;
}


export interface ReplyReviewResponse {
    message: string;
    data: ReviewItem;
}


export interface CreateReviewPayload {
    appointment: number;
    rating: number;
    text: string;
}


export interface CreateReviewResponse {
    message: string;
    data: ReviewItem;
}


export const getBusinessReviews = async (
    businessId: number,
    filters: ReviewFilters = {}
): Promise<ReviewsResponse> => {

    const response =
        await api.get<ReviewsResponse>(
            `/api/reviews/businesses/${businessId}/`,
            {
                withCredentials: true,
                params: filters
            }
        );

    return response.data;
};


export const replyToReview = async ({
    reviewId,
    reply_text
}: ReplyReviewPayload): Promise<ReplyReviewResponse> => {

    const response =
        await api.patch<ReplyReviewResponse>(
            `/api/reviews/${reviewId}/reply/`,
            {
                reply_text
            },
            {
                withCredentials: true
            }
        );

    return response.data;
};


export const createReview = async ({
    appointment,
    rating,
    text
}: CreateReviewPayload): Promise<CreateReviewResponse> => {

    const response =
        await api.post<CreateReviewResponse>(
            '/api/reviews/',
            {
                appointment,
                rating,
                text
            },
            {
                withCredentials: true
            }
        );

    return response.data;
};
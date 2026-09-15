import { api } from './api';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface CatalogCity {
    id: number;
    name: string;
    slug: string;
}


export interface CatalogCategory {
    id: number;
    name: string;
    slug: string;

    is_active?: boolean;

    created_at?: string;
}


export interface CatalogBusinessImage {
    id: number;

    business?: number;

    image: string;

    is_main: boolean;

    created_at?: string;
}


export interface CatalogService {
    id: number;

    business: number;

    category:
        number | null;

    category_name:
        string | null;

    name: string;

    description:
        string | null;

    price:
        string | number;

    duration_minutes: number;

    buffer_before_minutes: number;

    buffer_after_minutes: number;

    is_active: boolean;

    created_at?: string;

    updated_at?: string;
}


export interface CatalogBusiness {
    id: number;

    owner?: number;

    name: string;

    description:
        string | null;

    phone?:
        string | null;

    email?:
        string | null;

    city?:
        number | null;

    city_name?:
        string | null;

    address?:
        string | null;

    logo?:
        string | null;

    status: string;

    min_price?:
        string |
        number |
        null;

    rating?:
        string |
        number |
        null;

    reviews_count?: number;

    services_count?: number;

    staff_count?: number;

    created_at?: string;

    updated_at?: string;

    images:
        CatalogBusinessImage[];

    services:
        CatalogService[];
}


type CatalogBusinessWithoutServices =
    Omit<
        CatalogBusiness,
        'services'
    >;


/*
 * ============================================================
 * RESPONSE
 * ============================================================
 */

interface PaginationResponse {
    total_pages?: number;
}


interface ListResponse<T> {
    data?: T[];

    results?: T[];

    pagination?:
        PaginationResponse;

    count?: number;
}


/*
 * ============================================================
 * EXTRACT ARRAY
 * ============================================================
 */

const extractArray = <T>(
    payload: unknown
): T[] => {

    /*
     * [
     *     {...},
     *     {...}
     * ]
     */

    if (
        Array.isArray(
            payload
        )
    ) {

        return payload as T[];
    }


    /*
     * {
     *     data: [...]
     * }
     *
     * или
     *
     * {
     *     results: [...]
     * }
     */

    if (
        payload !== null &&
        typeof payload ===
            'object'
    ) {

        const response =
            payload as
                ListResponse<T>;


        if (
            Array.isArray(
                response.data
            )
        ) {

            return response.data;
        }


        if (
            Array.isArray(
                response.results
            )
        ) {

            return response.results;
        }
    }


    return [];
};


/*
 * ============================================================
 * TOTAL PAGES
 * ============================================================
 */

const extractTotalPages = (
    payload: unknown
): number => {

    if (
        payload === null ||
        typeof payload !==
            'object'
    ) {

        return 1;
    }


    const response =
        payload as
            ListResponse<unknown>;


    const totalPages =
        Number(
            response
                .pagination
                ?.total_pages ??
            1
        );


    if (
        !Number.isFinite(
            totalPages
        ) ||
        totalPages < 1
    ) {

        return 1;
    }


    return totalPages;
};


/*
 * ============================================================
 * CITIES
 * ============================================================
 */

export const getCatalogCities =
    async (): Promise<
        CatalogCity[]
    > => {

        const response =
            await api.get(
                '/api/businesses/cities/',
                {
                    withCredentials:
                        true
                }
            );


        return extractArray<
            CatalogCity
        >(
            response.data
        );
    };


/*
 * ============================================================
 * CATEGORIES
 * ============================================================
 */

export const getCatalogCategories =
    async (): Promise<
        CatalogCategory[]
    > => {

        const response =
            await api.get(
                '/api/businesses/categories/',
                {
                    withCredentials:
                        true
                }
            );


        return extractArray<
            CatalogCategory
        >(
            response.data
        )
            .filter(
                (
                    category:
                        CatalogCategory
                ) =>
                    category.is_active !==
                    false
            );
    };


/*
 * ============================================================
 * PUBLIC BUSINESSES
 * ============================================================
 */

export const getPublicBusinesses =
    async (
        search: string = ''
    ): Promise<
        CatalogBusinessWithoutServices[]
    > => {

        let page =
            1;


        const allBusinesses:
            CatalogBusinessWithoutServices[] =
            [];


        const preparedSearch =
            search.trim();


        while (
            true
        ) {

            const response =
                await api.get(
                    '/api/businesses/public/',
                    {
                        params: {

                            page,

                            ...(
                                preparedSearch
                                    ? {
                                          search:
                                              preparedSearch
                                      }
                                    : {}
                            )
                        },

                        withCredentials:
                            true
                    }
                );


            const businesses =
                extractArray<
                    CatalogBusinessWithoutServices
                >(
                    response.data
                );


            allBusinesses.push(
                ...businesses
            );


            const totalPages =
                extractTotalPages(
                    response.data
                );


            if (
                page >=
                totalPages
            ) {

                break;
            }


            page += 1;
        }


        return allBusinesses;
    };


/*
 * ============================================================
 * PUBLIC BUSINESS SERVICES
 * ============================================================
 */

export const getPublicBusinessServices =
    async (
        businessId: number
    ): Promise<
        CatalogService[]
    > => {

        let page =
            1;


        const allServices:
            CatalogService[] =
            [];


        while (
            true
        ) {

            const response =
                await api.get(
                    `/api/businesses/public/${businessId}/services/`,
                    {
                        params: {
                            page
                        },

                        withCredentials:
                            true
                    }
                );


            const services =
                extractArray<
                    CatalogService
                >(
                    response.data
                );


            allServices.push(
                ...services
            );


            const totalPages =
                extractTotalPages(
                    response.data
                );


            if (
                page >=
                totalPages
            ) {

                break;
            }


            page += 1;
        }


        return allServices.filter(
            (
                service:
                    CatalogService
            ) =>
                service.is_active
        );
    };


/*
 * ============================================================
 * FULL CATALOG
 * ============================================================
 */

export const getCatalogData =
    async (
        search: string = ''
    ): Promise<
        CatalogBusiness[]
    > => {

        /*
         * Поиск отправляем в backend.
         */

        const businesses =
            await getPublicBusinesses(
                search
            );


        /*
         * Только активные бизнесы.
         */

        const activeBusinesses =
            businesses.filter(
                (
                    business:
                        CatalogBusinessWithoutServices
                ) =>
                    business.status ===
                    'active'
            );


        /*
         * Получаем услуги каждого бизнеса.
         */

        const catalog:
            CatalogBusiness[] =
            await Promise.all(

                activeBusinesses.map(
                    async (
                        business:
                            CatalogBusinessWithoutServices
                    ): Promise<
                        CatalogBusiness
                    > => {

                        const services =
                            await getPublicBusinessServices(
                                business.id
                            );


                        return {
                            ...business,

                            images:
                                business.images ??
                                [],

                            services
                        };
                    }
                )
            );


        return catalog;
    };
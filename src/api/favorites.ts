import axios from 'axios';

import {
    api
} from './api';

import {
    getCatalogData,
    type CatalogBusiness
} from './catalog';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type FavoriteBusinessRaw =
    Omit<
        CatalogBusiness,
        'services'
    >;


/*
 * ============================================================
 * PAGINATION
 * ============================================================
 */

export interface FavoritesPagination {
    count: number;

    total_pages: number;

    current_page: number;

    page_size: number;

    next: number | null;

    previous: number | null;
}


/*
 * ============================================================
 * RAW RESPONSE
 * ============================================================
 */

export interface FavoritesRawResponse {
    message: string;

    pagination:
        FavoritesPagination;

    data:
        FavoriteBusinessRaw[];
}


/*
 * ============================================================
 * FAVORITES RESPONSE
 * ============================================================
 *
 * Этот тип уже используется
 * непосредственно страницей Избранное.
 *
 * В data находятся полноценные
 * CatalogBusiness:
 *
 * - rating
 * - reviews_count
 * - min_price
 * - services
 * - images
 * - city_name
 *
 * ============================================================
 */

export interface FavoriteBusinessesResponse {
    message: string;

    pagination:
        FavoritesPagination;

    data:
        CatalogBusiness[];
}


/*
 * ============================================================
 * TOGGLE RESPONSE
 * ============================================================
 */

export interface ToggleFavoriteResponse {
    message: string;

    is_favorite: boolean;
}


/*
 * ============================================================
 * EMPTY PAGINATION
 * ============================================================
 */

const createEmptyPagination =
    (): FavoritesPagination => {

        return {
            count:
                0,

            total_pages:
                1,

            current_page:
                1,

            page_size:
                5,

            next:
                null,

            previous:
                null
        };
    };


/*
 * ============================================================
 * GET FAVORITES RAW
 * ============================================================
 *
 * Получаем ОДНУ страницу избранного.
 *
 * Например:
 *
 * GET /api/favorites/?page=1
 *
 * GET /api/favorites/?page=2
 *
 * ============================================================
 */

export const getFavoriteBusinessesRaw =
    async (
        page:
            number = 1
    ): Promise<
        FavoritesRawResponse
    > => {

        const response =
            await api.get<
                FavoritesRawResponse
            >(
                '/api/favorites/',
                {
                    params: {
                        page
                    },

                    withCredentials:
                        true
                }
            );


        /*
         * На случай если backend
         * почему-то не вернул data массивом.
         */

        const businesses:
            FavoriteBusinessRaw[] =
            Array.isArray(
                response.data.data
            )
                ? response.data.data
                : [];


        /*
         * На случай если pagination
         * отсутствует.
         */

        const pagination =
            response.data.pagination ??
            createEmptyPagination();


        return {
            message:
                response.data.message ??
                'Избранные бизнесы.',

            pagination,

            data:
                businesses
        };
    };


/*
 * ============================================================
 * GET ALL FAVORITE IDS
 * ============================================================
 *
 * ВАЖНО:
 *
 * Каталог должен знать ВСЕ ID избранных
 * бизнесов пользователя.
 *
 * Поэтому здесь нельзя загружать только
 * первую страницу.
 *
 * Например:
 *
 * page 1:
 * [1, 2, 3, 4, 5]
 *
 * page 2:
 * [6, 7]
 *
 * Результат:
 *
 * [1, 2, 3, 4, 5, 6, 7]
 *
 * ============================================================
 */

export const getFavoriteBusinessIds =
    async (): Promise<
        number[]
    > => {

        try {

            let page =
                1;


            const ids:
                number[] =
                [];


            while (
                true
            ) {

                const response =
                    await getFavoriteBusinessesRaw(
                        page
                    );


                /*
                 * Добавляем ID
                 * текущей страницы.
                 */

                response.data.forEach(
                    business => {

                        const id =
                            Number(
                                business.id
                            );


                        if (
                            !Number.isNaN(
                                id
                            )
                        ) {

                            ids.push(
                                id
                            );
                        }
                    }
                );


                /*
                 * Если следующей страницы нет,
                 * останавливаем цикл.
                 */

                if (
                    response.pagination.next ===
                    null
                ) {

                    break;
                }


                /*
                 * Backend уже сообщает номер
                 * следующей страницы.
                 */

                page =
                    response.pagination.next;
            }


            /*
             * Убираем возможные дубликаты.
             */

            return [
                ...new Set(
                    ids
                )
            ];

        } catch (
            error
        ) {

            /*
             * Каталог доступен
             * неавторизованным пользователям.
             *
             * Если пользователь не вошёл,
             * избранного просто нет.
             */

            if (
                axios.isAxiosError(
                    error
                ) &&
                (
                    error.response?.status ===
                        401 ||
                    error.response?.status ===
                        403
                )
            ) {

                return [];
            }


            throw error;
        }
    };


/*
 * ============================================================
 * GET FAVORITE BUSINESSES
 * ============================================================
 *
 * Эта функция используется на странице:
 *
 * /favorites
 *
 * Backend отдаёт только 5 избранных
 * бизнесов текущей страницы.
 *
 * После этого мы берём полноценные
 * данные этих бизнесов из каталога.
 *
 * ============================================================
 */

export const getFavoriteBusinesses =
    async (
        page:
            number = 1
    ): Promise<
        FavoriteBusinessesResponse
    > => {

        /*
         * ========================================================
         * FAVORITES PAGE
         * ========================================================
         */

        const favoritesResponse =
            await getFavoriteBusinessesRaw(
                page
            );


        const favoriteBusinesses =
            favoritesResponse.data;


        /*
         * Если на странице ничего нет,
         * catalog загружать не нужно.
         */

        if (
            favoriteBusinesses.length ===
            0
        ) {

            return {
                message:
                    favoritesResponse.message,

                pagination:
                    favoritesResponse.pagination,

                data:
                    []
            };
        }


        /*
         * ========================================================
         * IDS
         * ========================================================
         */

        const favoriteIds =
            favoriteBusinesses.map(
                business =>
                    Number(
                        business.id
                    )
            );


        const favoriteIdsSet =
            new Set<number>(
                favoriteIds
            );


        /*
         * ========================================================
         * FULL CATALOG
         * ========================================================
         *
         * Получаем те же данные,
         * которые используются
         * на основной странице каталога.
         */

        const catalog =
            await getCatalogData(
                ''
            );


        /*
         * ========================================================
         * BUSINESS MAP
         * ========================================================
         *
         * Создаём Map:
         *
         * business.id -> business
         *
         * Это позволит:
         *
         * 1. быстро найти бизнес;
         * 2. сохранить порядок избранного.
         */

        const catalogMap =
            new Map<
                number,
                CatalogBusiness
            >();


        catalog.forEach(
            business => {

                const id =
                    Number(
                        business.id
                    );


                if (
                    favoriteIdsSet.has(
                        id
                    )
                ) {

                    catalogMap.set(
                        id,
                        business
                    );
                }
            }
        );


        /*
         * ========================================================
         * RESULT
         * ========================================================
         *
         * ВАЖНО:
         *
         * Не делаем просто catalog.filter(),
         * потому что тогда порядок будет
         * соответствовать каталогу.
         *
         * Нам нужен порядок именно
         * избранного с backend.
         */

        const favorites =
            favoriteIds
                .map(
                    id =>
                        catalogMap.get(
                            id
                        )
                )
                .filter(
                    (
                        business
                    ):
                        business is
                            CatalogBusiness =>
                        business !==
                        undefined
                );


        return {
            message:
                favoritesResponse.message,

            pagination:
                favoritesResponse.pagination,

            data:
                favorites
        };
    };


/*
 * ============================================================
 * TOGGLE FAVORITE
 * ============================================================
 */

export const toggleFavoriteBusiness =
    async (
        businessId:
            number
    ): Promise<
        ToggleFavoriteResponse
    > => {

        const response =
            await api.post<
                ToggleFavoriteResponse
            >(
                `/api/favorites/businesses/${businessId}/toggle/`,
                {},
                {
                    withCredentials:
                        true
                }
            );


        return response.data;
    };
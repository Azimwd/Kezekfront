import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig
} from 'axios';


/*
 * ============================================================
 * BASE URL
 * ============================================================
 */

const BASE_URL =
    import.meta.env.VITE_API_URL ??
    'http://localhost:8000';


/*
 * ============================================================
 * MAIN API
 * ============================================================
 */

export const api =
    axios.create({

        baseURL:
            BASE_URL,

        timeout:
            10000,

        withCredentials:
            true,

        headers: {
            'Content-Type':
                'application/json'
        }
    });


/*
 * ============================================================
 * REFRESH API
 * ============================================================
 *
 * Отдельный axios instance без interceptor.
 *
 * Это необходимо, чтобы refresh-запрос
 * сам не попал в бесконечный цикл refresh.
 * ============================================================
 */

const refreshApi =
    axios.create({

        baseURL:
            BASE_URL,

        timeout:
            10000,

        withCredentials:
            true,

        headers: {
            'Content-Type':
                'application/json'
        }
    });


/*
 * ============================================================
 * REQUEST TYPE
 * ============================================================
 */

interface RetryRequestConfig
    extends InternalAxiosRequestConfig {

    _retry?:
        boolean;
}


/*
 * ============================================================
 * REFRESH PROMISE
 * ============================================================
 *
 * Если несколько запросов одновременно
 * получают 401, выполняется только
 * один refresh.
 * ============================================================
 */

let refreshPromise:
    Promise<void> | null =
    null;


/*
 * ============================================================
 * REFRESH ACCESS TOKEN
 * ============================================================
 */

const refreshAccessToken =
    async (): Promise<void> => {

        /*
         * Refresh уже выполняется.
         * Остальные запросы ждут его.
         */

        if (
            refreshPromise
        ) {

            return refreshPromise;
        }


        refreshPromise =
            refreshApi
                .post(
                    '/api/users/refresh/',
                    {}
                )
                .then(
                    () => {

                        /*
                         * Ничего с токеном
                         * на frontend делать не нужно.
                         *
                         * Backend сам устанавливает
                         * новый HttpOnly access_token.
                         */
                    }
                )
                .finally(
                    () => {

                        refreshPromise =
                            null;
                    }
                );


        return refreshPromise;
    };


/*
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 */

api.interceptors.response.use(

    response =>
        response,


    async (
        error:
            AxiosError
    ) => {

        const originalRequest =
            error.config as
                RetryRequestConfig |
                undefined;


        /*
         * Нет исходного запроса.
         */

        if (
            !originalRequest
        ) {

            return Promise.reject(
                error
            );
        }


        const responseStatus =
            error.response
                ?.status;


        /*
         * ========================================================
         * НЕ 401
         * ========================================================
         */

        if (
            responseStatus !==
            401
        ) {

            return Promise.reject(
                error
            );
        }


        const url =
            originalRequest.url ??
            '';


        /*
         * ========================================================
         * AUTH ENDPOINTS
         * ========================================================
         *
         * На login/register/refresh
         * refresh повторно не запускаем.
         * ========================================================
         */

        const isAuthRequest =
            url.includes(
                '/api/users/login/'
            ) ||

            url.includes(
                '/api/users/register/'
            ) ||

            url.includes(
                '/api/users/refresh/'
            );


        if (
            isAuthRequest
        ) {

            return Promise.reject(
                error
            );
        }


        /*
         * ========================================================
         * RETRY PROTECTION
         * ========================================================
         *
         * Если после успешного refresh
         * повторный запрос снова вернул 401,
         * сессия больше невалидна.
         * ========================================================
         */

        if (
            originalRequest._retry
        ) {

            window.dispatchEvent(
                new Event(
                    'auth:expired'
                )
            );


            return Promise.reject(
                error
            );
        }


        originalRequest._retry =
            true;


        try {

            /*
             * ====================================================
             * REFRESH
             * ====================================================
             */

            await refreshAccessToken();


            /*
             * Backend уже поставил новую
             * HttpOnly access cookie.
             *
             * Просто повторяем исходный запрос.
             */

            return api.request(
                originalRequest
            );

        }

        catch (
            refreshError
        ) {

            /*
             * Refresh token тоже истёк
             * или был удалён.
             *
             * Только теперь считаем,
             * что сессия действительно закончилась.
             */

            window.dispatchEvent(
                new Event(
                    'auth:expired'
                )
            );


            return Promise.reject(
                refreshError
            );
        }
    }
);
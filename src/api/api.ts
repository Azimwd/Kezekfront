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
    'http://localhost:8000';


/*
 * ============================================================
 * COOKIE
 * ============================================================
 */

const getCookie = (
    name:
        string
): string | null => {

    const value =
        `; ${document.cookie}`;


    const parts =
        value.split(
            `; ${name}=`
        );


    if (
        parts.length ===
        2
    ) {

        return (
            parts
                .pop()
                ?.split(';')
                .shift() ??
            null
        );
    }


    return null;
};


const setCookie = (
    name:
        string,

    value:
        string,

    days =
        1
) => {

    const date =
        new Date();


    date.setTime(
        date.getTime() +
        days *
            24 *
            60 *
            60 *
            1000
    );


    document.cookie =
        `${name}=${value}; ` +
        `expires=${date.toUTCString()}; ` +
        `path=/; ` +
        `SameSite=Lax`;
};


const deleteCookie = (
    name:
        string
) => {

    document.cookie =
        `${name}=; ` +
        `expires=Thu, 01 Jan 1970 00:00:00 GMT; ` +
        `path=/; ` +
        `SameSite=Lax`;
};


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
 * REFRESH CLIENT
 * ============================================================
 *
 * ВАЖНО:
 *
 * У него нет response interceptor.
 * Иначе refresh сам может попасть
 * в бесконечный refresh-цикл.
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
 * REFRESH RESPONSE
 * ============================================================
 */

interface RefreshResponse {
    token?: string;

    access?: string;

    access_token?: string;
}


/*
 * ============================================================
 * REFRESH PROMISE
 * ============================================================
 *
 * Вместо ручной очереди failedQueue
 * проще использовать один общий Promise.
 *
 * Если 5 запросов одновременно получили 401,
 * refresh будет только один.
 * Остальные будут ждать его.
 * ============================================================
 */

let refreshPromise:
    Promise<string> | null =
    null;


/*
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */

api.interceptors.request.use(

    config => {

        const token =
            getCookie(
                'token'
            );


        if (
            token
        ) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }


        return config;
    },


    error =>
        Promise.reject(
            error
        )
);


/*
 * ============================================================
 * REFRESH ACCESS TOKEN
 * ============================================================
 */

const refreshAccessToken =
    async (): Promise<string> => {

        /*
         * Refresh уже выполняется.
         */

        if (
            refreshPromise
        ) {

            return refreshPromise;
        }


        refreshPromise =
            refreshApi
                .post<
                    RefreshResponse
                >(
                    '/api/users/refresh/',
                    {}
                )
                .then(
                    response => {

                        /*
                         * Поддерживаем несколько
                         * распространённых названий.
                         *
                         * Оставь затем только то,
                         * которое реально возвращает backend.
                         */

                        const newToken =
                            response.data.token ??
                            response.data.access ??
                            response.data.access_token;


                        if (
                            !newToken
                        ) {

                            throw new Error(
                                'Backend не вернул новый access token.'
                            );
                        }


                        /*
                         * Сохраняем новый access.
                         */

                        setCookie(
                            'token',
                            newToken,
                            1
                        );


                        return newToken;
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
         * Нет информации об исходном запросе.
         */

        if (
            !originalRequest
        ) {

            return Promise.reject(
                error
            );
        }


        const status =
            error.response
                ?.status;


        const url =
            originalRequest.url ??
            '';


        /*
         * ========================================================
         * НЕ 401
         * ========================================================
         */

        if (
            status !==
            401
        ) {

            return Promise.reject(
                error
            );
        }


        /*
         * ========================================================
         * AUTH ENDPOINTS
         * ========================================================
         *
         * login/register/refresh/logout
         * повторно refresh-ить не нужно.
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
            ) ||
            url.includes(
                '/api/users/logout/'
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
         */

        if (
            originalRequest._retry
        ) {

            /*
             * Даже после refresh
             * исходный endpoint вернул 401.
             *
             * Значит сессия действительно
             * больше невалидна.
             */

            deleteCookie(
                'token'
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

            const newToken =
                await refreshAccessToken();


            /*
             * Обновляем Authorization
             * непосредственно у исходного запроса.
             */

            originalRequest
                .headers
                .Authorization =
                `Bearer ${newToken}`;


            /*
             * ====================================================
             * RETRY ORIGINAL REQUEST
             * ====================================================
             */

            return api(
                originalRequest
            );

        } catch (
            refreshError
        ) {

            /*
             * Refresh token тоже невалиден
             * или истёк.
             */

            deleteCookie(
                'token'
            );


            /*
             * ВАЖНО:
             *
             * Здесь специально НЕ делаем:
             *
             * window.location.href = '/auth/login'
             *
             * Решение о редиректе должен принимать
             * AuthProvider / ProtectedRoute.
             */

            return Promise.reject(
                refreshError
            );
        }
    }
);
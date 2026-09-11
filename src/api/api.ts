import axios from 'axios';

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }

    return null;
};

const setCookie = (name: string, value: string, days = 1) => {
    const date = new Date();

    date.setTime(
        date.getTime() +
        days * 24 * 60 * 60 * 1000
    );

    document.cookie =
        `${name}=${value};` +
        `expires=${date.toUTCString()};` +
        `path=/`;
};

const deleteCookie = (name: string) => {
    document.cookie =
        `${name}=;` +
        `expires=Thu, 01 Jan 1970 00:00:00 UTC;` +
        `path=/`;
};


export const api = axios.create({
    baseURL: 'http://localhost:8000/',
    timeout: 10000,

    headers: {
        'Content-Type': 'application/json',
    },

    withCredentials: true,
});


let isRefreshing = false;

let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];


const processQueue = (
    error: unknown,
    token: string | null = null
) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};


api.interceptors.request.use(
    (config) => {
        const token = getCookie('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const url = originalRequest.url ?? '';

        const isAuthRequest =
            url.includes('/api/users/login/') ||
            url.includes('/api/users/register/') ||
            url.includes('/api/users/refresh/') ||
            url.includes('/api/users/logout/');

        if (status !== 401) {
            return Promise.reject(error);
        }

        if (isAuthRequest) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({
                    resolve,
                    reject,
                });
            })
                .then((token) => {
                    originalRequest.headers.Authorization =
                        `Bearer ${token}`;

                    return api(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }


        originalRequest._retry = true;
        isRefreshing = true;


        try {

            const response = await axios.post(
                'http://localhost:8000/api/users/refresh/',
                null,
                {
                    withCredentials: true,
                }
            );


            const newToken = response.data.token;


            if (!newToken) {
                throw new Error(
                    'Backend не вернул новый access token'
                );
            }


            setCookie('token', newToken, 1);

            processQueue(null, newToken);


            originalRequest.headers.Authorization =
                `Bearer ${newToken}`;


            return api(originalRequest);

        } catch (refreshError) {

            processQueue(refreshError, null);

            deleteCookie('token');

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);
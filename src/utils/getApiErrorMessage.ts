import axios from 'axios';


const FIELD_NAMES: Record<string, string> = {

    /*
     * STAFF
     */

    first_name: 'Имя',

    last_name: 'Фамилия',

    position: 'Должность',

    description: 'Описание',

    photo: 'Фото',

    user: 'Пользователь',


    /*
     * SERVICES
     */

    name: 'Название',

    price: 'Цена',

    duration_minutes: 'Длительность',

    buffer_before_minutes:
        'Буфер до услуги',

    buffer_after_minutes:
        'Буфер после услуги',

    is_active:
        'Статус',

    category:
        'Категория',

    business:
        'Бизнес',

    staff_ids:
        'Мастера',


    /*
     * BUSINESS
     */

    phone:
        'Телефон',

    email:
        'Email',

    city:
        'Город',

    address:
        'Адрес',

    logo:
        'Логотип',

    status:
        'Статус',


    /*
     * DRF
     */

    non_field_errors:
        'Ошибка'
};


/*
 * ============================================================
 * EXTRACT ERRORS
 * ============================================================
 */

const extractMessages = (
    value: unknown,
    parentKey?: string
): string[] => {

    /*
     * Обычная строка.
     */

    if (
        typeof value ===
        'string'
    ) {

        if (
            parentKey
        ) {

            const fieldName =
                FIELD_NAMES[
                    parentKey
                ] ??
                parentKey;


            return [
                `${fieldName}: ${value}`
            ];
        }


        return [
            value
        ];
    }


    /*
     * DRF часто возвращает:
     *
     * {
     *     first_name: [
     *         "Это поле обязательно."
     *     ]
     * }
     */

    if (
        Array.isArray(
            value
        )
    ) {

        return value.flatMap(
            item =>
                extractMessages(
                    item,
                    parentKey
                )
        );
    }


    /*
     * Вложенные объекты.
     */

    if (
        value &&
        typeof value ===
            'object'
    ) {

        return Object.entries(
            value
        ).flatMap(
            (
                [
                    key,
                    nestedValue
                ]
            ) =>
                extractMessages(
                    nestedValue,
                    key
                )
        );
    }


    return [];
};


/*
 * ============================================================
 * API ERROR
 * ============================================================
 */

export const getApiErrorMessage = (
    error: unknown,
    fallback:
        string =
        'Произошла ошибка. Попробуйте ещё раз.'
): string => {

    /*
     * ========================================================
     * AXIOS
     * ========================================================
     */

    if (
        axios.isAxiosError(
            error
        )
    ) {

        /*
         * Сервер вообще не ответил.
         */

        if (
            !error.response
        ) {

            return (
                'Не удалось подключиться к серверу. ' +
                'Проверьте интернет-соединение и попробуйте ещё раз.'
            );
        }


        const status =
            error.response.status;


        const data =
            error.response.data;


        /*
         * Backend вернул просто строку.
         */

        if (
            typeof data ===
                'string' &&
            data.trim()
        ) {

            return data;
        }


        /*
         * Backend вернул JSON.
         */

        if (
            data &&
            typeof data ===
                'object'
        ) {

            const responseData =
                data as Record<
                    string,
                    unknown
                >;


            /*
             * DRF стандартный detail.
             */

            if (
                typeof responseData.detail ===
                    'string'
            ) {

                return responseData.detail;
            }


            /*
             * Явное поле error.
             */

            if (
                typeof responseData.error ===
                    'string'
            ) {

                return responseData.error;
            }


            /*
             * Если message — единственная ошибка.
             */

            if (
                typeof responseData.message ===
                    'string' &&
                Object.keys(
                    responseData
                ).length === 1
            ) {

                return responseData.message;
            }


            /*
             * Field errors.
             */

            const filteredResponse =
                Object.fromEntries(
                    Object.entries(
                        responseData
                    ).filter(
                        (
                            [
                                key
                            ]
                        ) =>
                            key !==
                            'message'
                    )
                );


            const messages =
                extractMessages(
                    filteredResponse
                );


            if (
                messages.length >
                0
            ) {

                return Array.from(
                    new Set(
                        messages
                    )
                ).join(
                    '\n'
                );
            }


            /*
             * Если других ошибок нет,
             * используем message.
             */

            if (
                typeof responseData.message ===
                    'string'
            ) {

                return responseData.message;
            }
        }


        /*
         * ========================================================
         * STATUS FALLBACK
         * ========================================================
         */

        if (
            status ===
            400
        ) {

            return (
                'Проверьте введённые данные.'
            );
        }


        if (
            status ===
            401
        ) {

            return (
                'Сессия истекла. ' +
                'Войдите в аккаунт повторно.'
            );
        }


        if (
            status ===
            403
        ) {

            return (
                'У вас нет прав для выполнения этого действия.'
            );
        }


        if (
            status ===
            404
        ) {

            return (
                'Мастер не найден.'
            );
        }


        if (
            status ===
            409
        ) {

            return (
                'Возник конфликт данных. ' +
                'Обновите страницу и попробуйте ещё раз.'
            );
        }


        if (
            status ===
            413
        ) {

            return (
                'Загружаемый файл слишком большой.'
            );
        }


        if (
            status ===
            429
        ) {

            return (
                'Слишком много запросов. ' +
                'Попробуйте немного позже.'
            );
        }


        if (
            status >=
            500
        ) {

            return (
                'Ошибка сервера. ' +
                'Попробуйте повторить действие немного позже.'
            );
        }


        return fallback;
    }


    /*
     * ========================================================
     * NORMAL JS ERROR
     * ========================================================
     */

    if (
        error instanceof
        Error
    ) {

        return (
            error.message ||
            fallback
        );
    }


    return fallback;
};
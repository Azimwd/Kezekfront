import {
    Heart,
    MapPin,
    Star
} from 'lucide-react';

import axios from 'axios';

import {
    useNavigate
} from 'react-router-dom';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import Icon from '../../atoms/Icon';
import Typography from '../../atoms/Typography';
import Button from '../../atoms/Button';

import type {
    CatalogBusiness
} from '../../../api/catalog';

import {
    getFavoriteBusinessIds,
    toggleFavoriteBusiness
} from '../../../api/favorites';


/*
 * ============================================================
 * TYPES FROM CATALOG BUSINESS
 * ============================================================
 */

type BusinessImage =
    NonNullable<
        CatalogBusiness['images']
    >[number];


type BusinessService =
    CatalogBusiness['services'][number];


interface ServiceCardProps {
    businesses:
        CatalogBusiness[];

    isLoading?:
        boolean;
}


/*
 * ============================================================
 * BACKEND URL
 * ============================================================
 */

const BACKEND_URL:
    string =
    String(
        import.meta.env.VITE_API_URL ??
        'http://localhost:8000'
    ).replace(
        /\/$/,
        ''
    );


/*
 * ============================================================
 * MEDIA URL
 * ============================================================
 */

const getMediaUrl = (
    value?:
        string | null
): string | null => {

    if (
        !value
    ) {

        return null;
    }


    if (
        value.startsWith(
            'http://'
        ) ||
        value.startsWith(
            'https://'
        )
    ) {

        return value;
    }


    /*
     * Backend иногда может вернуть
     * file:// путь.
     *
     * Такой URL браузер открыть
     * с frontend не сможет.
     */

    if (
        value.startsWith(
            'file://'
        )
    ) {

        return null;
    }


    if (
        value.startsWith(
            '/'
        )
    ) {

        return `${BACKEND_URL}${value}`;
    }


    return `${BACKEND_URL}/${value}`;
};


/*
 * ============================================================
 * BUSINESS IMAGE
 * ============================================================
 */

const getBusinessImage = (
    business:
        CatalogBusiness
): string | null => {

    const images:
        BusinessImage[] =
        business.images ??
        [];


    const mainImage =
        images.find(
            (
                image:
                    BusinessImage
            ) =>
                Boolean(
                    image.is_main
                )
        );


    const imageValue:
        string | null =
        mainImage?.image ??
        images[0]?.image ??
        business.logo ??
        null;


    return getMediaUrl(
        imageValue
    );
};


/*
 * ============================================================
 * MIN PRICE
 * ============================================================
 */

const getMinPrice = (
    business:
        CatalogBusiness
): number | null => {

    /*
     * Backend min_price.
     */

    if (
        business.min_price !==
            null &&
        business.min_price !==
            undefined
    ) {

        const minPrice =
            Number(
                business.min_price
            );


        if (
            !Number.isNaN(
                minPrice
            )
        ) {

            return minPrice;
        }
    }


    /*
     * Иначе считаем
     * по активным услугам.
     */

    const services:
        BusinessService[] =
        business.services ??
        [];


    const prices:
        number[] =
        services
            .filter(
                (
                    service:
                        BusinessService
                ) =>
                    Boolean(
                        service.is_active
                    )
            )
            .map(
                (
                    service:
                        BusinessService
                ): number =>
                    Number(
                        service.price
                    )
            )
            .filter(
                (
                    price:
                        number
                ): boolean =>
                    !Number.isNaN(
                        price
                    )
            );


    if (
        prices.length ===
        0
    ) {

        return null;
    }


    return Math.min(
        ...prices
    );
};


/*
 * ============================================================
 * CATEGORY
 * ============================================================
 */

const getCategory = (
    business:
        CatalogBusiness
): string => {

    const services:
        BusinessService[] =
        business.services ??
        [];


    const categoryNames:
        string[] =
        services
            .map(
                (
                    service:
                        BusinessService
                ):
                    string | null => {

                    const categoryName =
                        service.category_name;


                    if (
                        typeof categoryName !==
                        'string'
                    ) {

                        return null;
                    }


                    const prepared =
                        categoryName.trim();


                    if (
                        !prepared
                    ) {

                        return null;
                    }


                    return prepared;
                }
            )
            .filter(
                (
                    value:
                        string | null
                ):
                    value is string =>
                    value !==
                    null
            );


    const uniqueCategories:
        string[] =
        Array.from(
            new Set<string>(
                categoryNames
            )
        );


    return (
        uniqueCategories[0] ??
        'Услуги'
    );
};


/*
 * ============================================================
 * ADDRESS
 * ============================================================
 */

const getBusinessAddress = (
    business:
        CatalogBusiness
): string => {

    const addressParts:
        Array<
            string |
            null |
            undefined
        > = [
            business.city_name,
            business.address
        ];


    return addressParts
        .filter(
            (
                value:
                    string |
                    null |
                    undefined
            ):
                value is string =>
                typeof value ===
                    'string' &&
                value.trim()
                    .length > 0
        )
        .join(
            ', '
        );
};


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ServiceCard({
    businesses,
    isLoading = false
}: ServiceCardProps) {

    /*
     * ============================================================
     * NAVIGATION
     * ============================================================
     */

    const navigate =
        useNavigate();


    /*
     * ============================================================
     * QUERY CLIENT
     * ============================================================
     */

    const queryClient =
        useQueryClient();


    /*
     * ============================================================
     * FAVORITES
     * ============================================================
     */

    const {
        data:
            favoriteIds = []
    } =
        useQuery<
            number[],
            Error
        >({

            queryKey: [
                'favorite-business-ids'
            ],

            queryFn:
                getFavoriteBusinessIds,

            retry:
                false,

            staleTime:
                30_000
        });


    /*
     * ============================================================
     * TOGGLE FAVORITE
     * ============================================================
     */

    const favoriteMutation =
        useMutation({

            mutationFn:
                toggleFavoriteBusiness,


            /*
             * OPTIMISTIC UPDATE
             *
             * Сердце меняется сразу,
             * не ждём ответа backend.
             */

            onMutate:
                async (
                    businessId:
                        number
                ) => {

                    await queryClient.cancelQueries({
                        queryKey: [
                            'favorite-business-ids'
                        ]
                    });


                    const previousFavoriteIds =
                        queryClient.getQueryData<
                            number[]
                        >(
                            [
                                'favorite-business-ids'
                            ]
                        ) ??
                        [];


                    const isFavorite =
                        previousFavoriteIds.includes(
                            businessId
                        );


                    const nextFavoriteIds =
                        isFavorite
                            ? previousFavoriteIds.filter(
                                  id =>
                                      id !==
                                      businessId
                              )
                            : [
                                  ...previousFavoriteIds,
                                  businessId
                              ];


                    queryClient.setQueryData<
                        number[]
                    >(
                        [
                            'favorite-business-ids'
                        ],
                        nextFavoriteIds
                    );


                    return {
                        previousFavoriteIds
                    };
                },


            /*
             * BACKEND ERROR
             */

            onError:
                (
                    error,
                    _businessId,
                    context
                ) => {

                    /*
                     * Возвращаем состояние,
                     * которое было до клика.
                     */

                    if (
                        context
                            ?.previousFavoriteIds
                    ) {

                        queryClient.setQueryData<
                            number[]
                        >(
                            [
                                'favorite-business-ids'
                            ],
                            context
                                .previousFavoriteIds
                        );
                    }


                    /*
                     * Пользователь
                     * не авторизован.
                     */

                    if (
                        axios.isAxiosError(
                            error
                        ) &&
                        (
                            error.response
                                ?.status ===
                                401 ||
                            error.response
                                ?.status ===
                                403
                        )
                    ) {

                        navigate(
                            '/login'
                        );

                        return;
                    }


                    console.error(
                        'Ошибка при изменении избранного:',
                        error
                    );
                },


            /*
             * После запроса синхронизируем
             * данные с backend.
             */

            onSettled:
                async () => {

                    await Promise.all([

                        queryClient.invalidateQueries({
                            queryKey: [
                                'favorite-business-ids'
                            ]
                        }),

                        queryClient.invalidateQueries({
                            queryKey: [
                                'favorite-businesses'
                            ]
                        })

                    ]);
                }
        });


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (
        isLoading
    ) {

        return (
            <div
                className="
                    grid
                    grid-cols-1
                    gap-5

                    md:grid-cols-2
                    lg:grid-cols-3
                "
            >

                {Array.from(
                    {
                        length:
                            6
                    }
                ).map(
                    (
                        _:
                            unknown,
                        index:
                            number
                    ) => (

                        <div
                            key={
                                index
                            }

                            className="
                                h-[430px]
                                animate-pulse
                                rounded-3xl
                                border
                                border-[#c7c4d8]
                                bg-white
                            "
                        />

                    )
                )}

            </div>
        );
    }


    /*
     * ============================================================
     * EMPTY
     * ============================================================
     */

    if (
        businesses.length ===
        0
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[300px]
                    w-full
                    items-center
                    justify-center
                    rounded-3xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    p-6
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-2
                        text-center
                    "
                >
                    <Typography
                        text="Ничего не найдено"
                        className="
                            text-lg
                            font-semibold
                            text-[#001D4A]
                        "
                    />

                    <Typography
                        text="Попробуйте изменить параметры поиска или фильтры."
                        className="
                            text-sm
                            text-[#858585]
                        "
                    />
                </div>
            </div>
        );
    }


    /*
     * ============================================================
     * CARDS
     * ============================================================
     */

    return (
        <div
            className="
                grid
                grid-cols-1
                gap-5

                md:grid-cols-2
                lg:grid-cols-3
            "
        >

            {businesses.map(
                (
                    item:
                        CatalogBusiness
                ) => {

                    /*
                     * =================================================
                     * IMAGE
                     * =================================================
                     */

                    const image:
                        string | null =
                        getBusinessImage(
                            item
                        );


                    /*
                     * =================================================
                     * PRICE
                     * =================================================
                     */

                    const minPrice:
                        number | null =
                        getMinPrice(
                            item
                        );


                    /*
                     * =================================================
                     * CATEGORY
                     * =================================================
                     */

                    const category:
                        string =
                        getCategory(
                            item
                        );


                    /*
                     * =================================================
                     * RATING
                     * =================================================
                     */

                    const rating:
                        number =
                        Number(
                            item.rating ??
                            0
                        );


                    /*
                     * =================================================
                     * ADDRESS
                     * =================================================
                     */

                    const address:
                        string =
                        getBusinessAddress(
                            item
                        );


                    /*
                     * =================================================
                     * FAVORITE
                     * =================================================
                     */

                    const isFavorite:
                        boolean =
                        favoriteIds.includes(
                            item.id
                        );


                    const isFavoriteLoading:
                        boolean =
                        favoriteMutation
                            .isPending &&
                        favoriteMutation
                            .variables ===
                            item.id;


                    return (
                        <div
                            key={
                                item.id
                            }

                            className="
                                flex
                                h-full
                                w-full
                                min-w-0
                                flex-col
                                overflow-hidden
                                rounded-3xl
                                border
                                border-[#c7c4d8]
                                bg-white
                                transition-shadow

                                hover:shadow-md
                            "
                        >

                            {/* =========================================
                                IMAGE
                            ========================================= */}

                            <div
                                className="
                                    relative
                                    h-[220px]
                                    w-full
                                    shrink-0
                                    p-3
                                "
                            >

                                {image ? (

                                    <img
                                        src={
                                            image
                                        }

                                        alt={
                                            item.name
                                        }

                                        className="
                                            h-full
                                            w-full
                                            rounded-2xl
                                            object-cover
                                        "
                                    />

                                ) : (

                                    <div
                                        className="
                                            flex
                                            h-full
                                            w-full
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-[#F2F4F7]
                                            text-sm
                                            text-[#858585]
                                        "
                                    >
                                        Нет фотографии
                                    </div>

                                )}


                                {/* =====================================
                                    RATING
                                ===================================== */}

                                <div
                                    className="
                                        absolute
                                        left-6
                                        top-6
                                        flex
                                        items-center
                                        gap-1
                                        rounded-full
                                        bg-white
                                        px-3
                                        py-1
                                        shadow-sm
                                    "
                                >

                                    <Icon
                                        icon={
                                            Star
                                        }

                                        size={
                                            14
                                        }

                                        className="
                                            fill-[#FFC107]
                                            text-[#FFC107]
                                        "
                                    />


                                    <span
                                        className="
                                            text-sm
                                            font-bold
                                            text-[#111827]
                                        "
                                    >

                                        {
                                            rating >
                                            0
                                                ? rating.toFixed(
                                                      1
                                                  )
                                                : '—'
                                        }

                                    </span>

                                </div>


                                {/* =====================================
                                    FAVORITE
                                ===================================== */}

                                <button
                                    type="button"

                                    disabled={
                                        isFavoriteLoading
                                    }

                                    aria-pressed={
                                        isFavorite
                                    }

                                    aria-label={
                                        isFavorite
                                            ? 'Удалить из избранного'
                                            : 'Добавить в избранное'
                                    }

                                    onClick={
                                        () => {

                                            if (
                                                isFavoriteLoading
                                            ) {
                                                return;
                                            }


                                            favoriteMutation.mutate(
                                                item.id
                                            );
                                        }
                                    }

                                    className={`
                                        absolute
                                        right-6
                                        top-6
                                        rounded-full
                                        bg-white
                                        p-2.5
                                        shadow-sm
                                        transition-all

                                        ${
                                            isFavoriteLoading
                                                ? `
                                                    cursor-not-allowed
                                                    opacity-50
                                                `
                                                : `
                                                    cursor-pointer
                                                    hover:scale-105
                                                `
                                        }

                                        ${
                                            isFavorite
                                                ? `
                                                    text-red-500
                                                `
                                                : `
                                                    text-[#8c8c8c]
                                                    hover:text-red-500
                                                `
                                        }
                                    `}
                                >

                                    <Icon
                                        icon={
                                            Heart
                                        }

                                        size={
                                            20
                                        }

                                        className={
                                            isFavorite
                                                ? `
                                                    fill-red-500
                                                    text-red-500
                                                `
                                                : ''
                                        }
                                    />

                                </button>

                            </div>


                            {/* =========================================
                                CONTENT
                            ========================================= */}

                            <div
                                className="
                                    flex
                                    min-w-0
                                    flex-1
                                    flex-col
                                    gap-3
                                    p-5
                                "
                            >

                                {/* =====================================
                                    NAME + CATEGORY
                                ===================================== */}

                                <div
                                    className="
                                        flex
                                        min-w-0
                                        items-start
                                        justify-between
                                        gap-2
                                    "
                                >

                                    <Typography
                                        text={
                                            item.name
                                        }

                                        className="
                                            min-w-0
                                            text-xl
                                            font-semibold
                                            leading-tight
                                            text-[#001D4A]
                                        "
                                    />


                                    <div
                                        className="
                                            max-w-[45%]
                                            shrink-0
                                            truncate
                                            whitespace-nowrap
                                            rounded
                                            bg-[#EEF2FF]
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-medium
                                            text-[#4F46E5]
                                        "
                                    >

                                        {
                                            category
                                        }

                                    </div>

                                </div>


                                {/* =====================================
                                    ADDRESS
                                ===================================== */}

                                {address && (

                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            items-start
                                            gap-1.5
                                            text-[#6B7280]
                                        "
                                    >

                                        <Icon
                                            icon={
                                                MapPin
                                            }

                                            size={
                                                16
                                            }

                                            className="
                                                mt-0.5
                                                shrink-0
                                            "
                                        />


                                        <Typography
                                            text={
                                                address
                                            }

                                            className="
                                                min-w-0
                                                text-sm
                                            "
                                        />

                                    </div>

                                )}


                                {/* =====================================
                                    DESCRIPTION
                                ===================================== */}

                                <Typography
                                    text={
                                        item.description ??
                                        'Описание пока не добавлено.'
                                    }

                                    className="
                                        line-clamp-2
                                        text-sm
                                        leading-relaxed
                                        text-[#4B5563]
                                    "
                                />


                                {/* =====================================
                                    REVIEWS
                                ===================================== */}

                                {Number(
                                    item.reviews_count ??
                                    0
                                ) > 0 && (

                                    <Typography
                                        text={`${Number(
                                            item.reviews_count ??
                                            0
                                        )} отзывов`}

                                        className="
                                            text-xs
                                            text-[#858585]
                                        "
                                    />

                                )}


                                {/* =====================================
                                    FOOTER
                                ===================================== */}

                                <div
                                    className="
                                        mt-auto
                                        pt-2
                                    "
                                >

                                    <hr
                                        className="
                                            mb-3
                                            border-[#e3e3e3]
                                        "
                                    />


                                    <div
                                        className="
                                            flex
                                            items-end
                                            justify-between
                                            gap-3
                                        "
                                    >

                                        {/* PRICE */}

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                flex-col
                                            "
                                        >

                                            <span
                                                className="
                                                    mb-0.5
                                                    text-xs
                                                    font-medium
                                                    text-[#8c8c8c]
                                                "
                                            >
                                                От
                                            </span>


                                            <span
                                                className="
                                                    text-lg
                                                    font-bold
                                                    text-[#001D4A]
                                                "
                                            >

                                                {
                                                    minPrice !==
                                                    null
                                                        ? `${minPrice.toLocaleString(
                                                              'ru-RU'
                                                          )} ₸`
                                                        : 'Цена не указана'
                                                }

                                            </span>

                                        </div>


                                        {/* BOOK */}

                                        <Button
                                            onClick={() => {
                                                navigate(
                                                    `/booking/${item.id}`
                                                );
                                            }}

                                            className="
                                                shrink-0
                                                cursor-pointer
                                                rounded-xl
                                                bg-[#3b28cc]
                                                px-6
                                                py-2.5
                                                font-medium
                                                text-white
                                                transition-colors

                                                hover:bg-[#3120b0]
                                            "
                                        >
                                            Записаться
                                        </Button>

                                    </div>

                                </div>

                            </div>

                        </div>
                    );
                }
            )}

        </div>
    );
}
import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    useSearchParams
} from 'react-router-dom';

import {
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import {
    getCatalogData,
    getCatalogCities,
    getCatalogCategories,
    type CatalogBusiness,
    type CatalogService,
    type CatalogCity,
    type CatalogCategory
} from '../../../api/catalog';

import SearchBar from './SearchBar';

import CatalogSidebar, {
    type CatalogCategoryOption,
    type CatalogServiceOption
} from './CatalogSidebar';

import ServiceCard from './ServiceCard';


/*
 * ============================================================
 * PRICE
 * ============================================================
 */

const normalizePrice = (
    value: string
): number | null => {

    const preparedValue =
        value
            .trim()
            .replace(
                ',',
                '.'
            );


    if (
        !preparedValue
    ) {
        return null;
    }


    const parsedValue =
        Number(
            preparedValue
        );


    if (
        Number.isNaN(
            parsedValue
        )
    ) {
        return null;
    }


    return parsedValue;
};


/*
 * ============================================================
 * URL NUMBER
 * ============================================================
 */

const normalizeId = (
    value: string | null
): number | null => {

    if (
        !value
    ) {
        return null;
    }


    const parsedValue =
        Number(
            value
        );


    if (
        Number.isNaN(
            parsedValue
        )
    ) {
        return null;
    }


    return parsedValue;
};


/*
 * ============================================================
 * BUSINESS MIN PRICE
 * ============================================================
 */

const getBusinessMinPrice = (
    business: CatalogBusiness
): number | null => {

    if (
        business.min_price !== null &&
        business.min_price !== undefined
    ) {

        const backendPrice =
            Number(
                business.min_price
            );


        if (
            !Number.isNaN(
                backendPrice
            )
        ) {
            return backendPrice;
        }
    }


    const services:
        CatalogService[] =
        business.services ??
        [];


    const prices:
        number[] =
        services
            .filter(
                (
                    service:
                        CatalogService
                ): boolean =>
                    service.is_active
            )
            .map(
                (
                    service:
                        CatalogService
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
        prices.length === 0
    ) {
        return null;
    }


    return Math.min(
        ...prices
    );
};

/*
 * ============================================================
 * PAGINATION
 * ============================================================
 */

const PAGE_SIZE =
    6;


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function CatalogControl() {

    /*
     * ============================================================
     * URL
     * ============================================================
     */

    const [
        searchParams,
        setSearchParams
    ] =
        useSearchParams();


    /*
     * ============================================================
     * PAGINATION
     * ============================================================
     */

    const [
        page,
        setPage
    ] =
        useState<number>(
            1
        );


    /*
     * ============================================================
     * SEARCH FROM URL
     * ============================================================
     */

    const searchFromUrl =
        searchParams.get(
            'search'
        ) ?? '';


    /*
     * ============================================================
     * CITY FROM URL
     * ============================================================
     */

    const cityFromUrl =
        searchParams.get(
            'city'
        );


    const cityIdFromUrl =
        normalizeId(
            cityFromUrl
        );


    /*
     * ============================================================
     * CATEGORY FROM URL
     * ============================================================
     */

    const categoryFromUrl =
        searchParams.get(
            'category'
        );


    const categoryIdFromUrl =
        normalizeId(
            categoryFromUrl
        );


    /*
     * ============================================================
     * SEARCH
     * ============================================================
     */

    const [
        search,
        setSearch
    ] =
        useState<string>(
            searchFromUrl
        );


    /*
     * ============================================================
     * CITY
     * ============================================================
     */

    const [
        selectedCityId,
        setSelectedCityId
    ] =
        useState<
            number | null
        >(
            cityIdFromUrl
        );


    /*
     * ============================================================
     * CATEGORY
     * ============================================================
     */

    const [
        selectedCategoryId,
        setSelectedCategoryId
    ] =
        useState<
            number | null
        >(
            categoryIdFromUrl
        );


    /*
     * ============================================================
     * SORT
     * ============================================================
     */

    const [
        sortId,
        setSortId
    ] =
        useState<number>(
            1
        );


    /*
     * ============================================================
     * PRICE
     * ============================================================
     */

    const [
        minPrice,
        setMinPrice
    ] =
        useState<string>(
            ''
        );


    const [
        maxPrice,
        setMaxPrice
    ] =
        useState<string>(
            ''
        );


    /*
     * ============================================================
     * SERVICES
     * ============================================================
     */

    const [
        selectedServices,
        setSelectedServices
    ] =
        useState<string[]>(
            []
        );


    /*
     * ============================================================
     * HEADER SEARCH -> CATALOG
     * ============================================================
     */

    useEffect(
        () => {

            setSearch(
                searchFromUrl
            );

        },
        [
            searchFromUrl
        ]
    );


    /*
     * ============================================================
     * URL CITY -> CATALOG
     * ============================================================
     */

    useEffect(
        () => {

            setSelectedCityId(
                cityIdFromUrl
            );

        },
        [
            cityFromUrl
        ]
    );


    /*
     * ============================================================
     * URL CATEGORY -> CATALOG
     * ============================================================
     */

    useEffect(
        () => {

            setSelectedCategoryId(
                categoryIdFromUrl
            );

        },
        [
            categoryFromUrl
        ]
    );


    /*
     * ============================================================
     * CATALOG SEARCH -> URL
     * ============================================================
     *
     * Debounce 300 ms.
     */

    useEffect(
        () => {

            const timer =
                window.setTimeout(
                    () => {

                        const preparedSearch =
                            search.trim();


                        if (
                            preparedSearch ===
                            searchFromUrl
                        ) {
                            return;
                        }


                        const params =
                            new URLSearchParams(
                                searchParams
                            );


                        if (
                            preparedSearch
                        ) {

                            params.set(
                                'search',
                                preparedSearch
                            );

                        } else {

                            params.delete(
                                'search'
                            );
                        }


                        setSearchParams(
                            params,
                            {
                                replace:
                                    true
                            }
                        );

                    },
                    300
                );


            return () => {

                window.clearTimeout(
                    timer
                );
            };

        },
        [
            search,
            searchFromUrl,
            searchParams,
            setSearchParams
        ]
    );


    /*
     * ============================================================
     * BACKEND CATALOG
     * ============================================================
     */

    const {
        data:
            catalogData,
        isLoading,
        isFetching,
        isError
    } =
        useQuery<
            CatalogBusiness[],
            Error
        >({

            queryKey: [
                'public-catalog',
                searchFromUrl
            ],

            queryFn: () =>
                getCatalogData(
                    searchFromUrl
                ),

            retry:
                false
        });


    const catalog:
        CatalogBusiness[] =
        Array.isArray(
            catalogData
        )
            ? catalogData
            : [];


    /*
     * ============================================================
     * BACKEND CITIES
     * ============================================================
     */

    const {
        data:
            citiesData = []
    } =
        useQuery<
            CatalogCity[],
            Error
        >({

            queryKey: [
                'catalog-cities'
            ],

            queryFn:
                getCatalogCities,

            retry:
                false
        });


    /*
     * ============================================================
     * BACKEND CATEGORIES
     * ============================================================
     */

    const {
        data:
            categoriesData = []
    } =
        useQuery<
            CatalogCategory[],
            Error
        >({

            queryKey: [
                'catalog-categories'
            ],

            queryFn:
                getCatalogCategories,

            retry:
                false
        });


    /*
     * ============================================================
     * CITY OPTIONS
     * ============================================================
     */

    const cities =
        useMemo(
            () => {

                return citiesData
                    .map(
                        (
                            city:
                                CatalogCity
                        ) => ({
                            id:
                                city.id,

                            name:
                                city.name
                        })
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            a.name.localeCompare(
                                b.name,
                                'ru'
                            )
                    );

            },
            [
                citiesData
            ]
        );


    /*
     * ============================================================
     * CATEGORY OPTIONS
     * ============================================================
     */

    const categories =
        useMemo<
            CatalogCategoryOption[]
        >(
            () => {

                return categoriesData
                    .filter(
                        (
                            category:
                                CatalogCategory
                        ) =>
                            category.is_active !==
                            false
                    )
                    .map(
                        (
                            category:
                                CatalogCategory
                        ):
                            CatalogCategoryOption => ({
                            id:
                                category.id,

                            name:
                                category.name
                        })
                    )
                    .sort(
                        (
                            a:
                                CatalogCategoryOption,
                            b:
                                CatalogCategoryOption
                        ) =>
                            a.name.localeCompare(
                                b.name,
                                'ru'
                            )
                    );

            },
            [
                categoriesData
            ]
        );


    /*
     * ============================================================
     * SERVICES OPTIONS
     * ============================================================
     */

    const services =
        useMemo<
            CatalogServiceOption[]
        >(
            () => {

                const serviceMap =
                    new Map<
                        string,
                        string
                    >();


                catalog.forEach(
                    (
                        business:
                            CatalogBusiness
                    ) => {

                        const businessServices:
                            CatalogService[] =
                            business.services ??
                            [];


                        businessServices.forEach(
                            (
                                service:
                                    CatalogService
                            ) => {

                                if (
                                    !service.is_active
                                ) {
                                    return;
                                }


                                const serviceName =
                                    service.name
                                        .trim();


                                if (
                                    !serviceName
                                ) {
                                    return;
                                }


                                const normalizedName =
                                    serviceName
                                        .toLocaleLowerCase(
                                            'ru'
                                        );


                                if (
                                    serviceMap.has(
                                        normalizedName
                                    )
                                ) {
                                    return;
                                }


                                serviceMap.set(
                                    normalizedName,
                                    serviceName
                                );
                            }
                        );
                    }
                );


                return Array.from(
                    serviceMap.values()
                )
                    .sort(
                        (
                            a:
                                string,
                            b:
                                string
                        ) =>
                            a.localeCompare(
                                b,
                                'ru'
                            )
                    )
                    .map(
                        (
                            name:
                                string
                        ):
                            CatalogServiceOption => ({
                            name
                        })
                    );

            },
            [
                catalog
            ]
        );


    /*
     * ============================================================
     * CITY CHANGE
     * ============================================================
     */

    const handleCityChange = (
        cityId:
            number | null
    ) => {

        setSelectedCityId(
            cityId
        );


        const params =
            new URLSearchParams(
                searchParams
            );


        if (
            cityId !==
            null
        ) {

            params.set(
                'city',
                String(
                    cityId
                )
            );

        } else {

            params.delete(
                'city'
            );
        }


        setSearchParams(
            params,
            {
                replace:
                    true
            }
        );
    };


    /*
     * ============================================================
     * CATEGORY CHANGE
     * ============================================================
     */

    const handleCategoryChange = (
        categoryId:
            number | null
    ) => {

        setSelectedCategoryId(
            categoryId
        );


        const params =
            new URLSearchParams(
                searchParams
            );


        if (
            categoryId !==
            null
        ) {

            params.set(
                'category',
                String(
                    categoryId
                )
            );

        } else {

            params.delete(
                'category'
            );
        }


        setSearchParams(
            params,
            {
                replace:
                    true
            }
        );
    };


    /*
     * ============================================================
     * SERVICE TOGGLE
     * ============================================================
     */

    const handleToggleService = (
        serviceName:
            string
    ) => {

        setSelectedServices(
            (
                previous:
                    string[]
            ) => {

                if (
                    previous.includes(
                        serviceName
                    )
                ) {

                    return previous.filter(
                        (
                            item:
                                string
                        ) =>
                            item !==
                            serviceName
                    );
                }


                return [
                    ...previous,
                    serviceName
                ];
            }
        );
    };


    /*
     * ============================================================
     * RESET
     * ============================================================
     */

    const handleReset =
        () => {

            setSearch(
                ''
            );

            setSortId(
                1
            );

            setMinPrice(
                ''
            );

            setMaxPrice(
                ''
            );

            setSelectedCityId(
                null
            );

            setSelectedCategoryId(
                null
            );

            setSelectedServices(
                []
            );


            const params =
                new URLSearchParams(
                    searchParams
                );


            params.delete(
                'search'
            );

            params.delete(
                'city'
            );

            params.delete(
                'category'
            );


            setSearchParams(
                params,
                {
                    replace:
                        true
                }
            );
        };


    /*
     * ============================================================
     * FILTER + SORT
     * ============================================================
     */

    const filteredBusinesses =
        useMemo<
            CatalogBusiness[]
        >(
            () => {

                const minimumPrice =
                    normalizePrice(
                        minPrice
                    );


                const maximumPrice =
                    normalizePrice(
                        maxPrice
                    );


                /*
                 * ====================================================
                 * FILTER
                 * ====================================================
                 */

                const result:
                    CatalogBusiness[] =
                    catalog.filter(
                        (
                            business:
                                CatalogBusiness
                        ): boolean => {

                            const businessServices:
                                CatalogService[] =
                                business.services ??
                                [];


                            /*
                             * =========================================
                             * CITY
                             * =========================================
                             */

                            if (
                                selectedCityId !==
                                null
                            ) {

                                if (
                                    Number(
                                        business.city
                                    ) !==
                                    selectedCityId
                                ) {

                                    return false;
                                }
                            }


                            /*
                             * =========================================
                             * CATEGORY
                             * =========================================
                             */

                            if (
                                selectedCategoryId !==
                                null
                            ) {

                                const hasCategory =
                                    businessServices.some(
                                        (
                                            service:
                                                CatalogService
                                        ): boolean =>
                                            service.is_active &&
                                            Number(
                                                service.category
                                            ) ===
                                                selectedCategoryId
                                    );


                                if (
                                    !hasCategory
                                ) {

                                    return false;
                                }
                            }


                            /*
                             * =========================================
                             * SERVICES
                             * =========================================
                             */

                            if (
                                selectedServices.length >
                                0
                            ) {

                                const businessServiceNames:
                                    string[] =
                                    businessServices
                                        .filter(
                                            (
                                                service:
                                                    CatalogService
                                            ): boolean =>
                                                service.is_active
                                        )
                                        .map(
                                            (
                                                service:
                                                    CatalogService
                                            ): string =>
                                                service.name
                                                    .trim()
                                                    .toLocaleLowerCase(
                                                        'ru'
                                                    )
                                        );


                                const hasSelectedService =
                                    selectedServices.some(
                                        (
                                            selectedService:
                                                string
                                        ): boolean =>

                                            businessServiceNames.includes(
                                                selectedService
                                                    .trim()
                                                    .toLocaleLowerCase(
                                                        'ru'
                                                    )
                                            )
                                    );


                                if (
                                    !hasSelectedService
                                ) {

                                    return false;
                                }
                            }


                            /*
                             * =========================================
                             * PRICE
                             * =========================================
                             */

                            if (
                                minimumPrice !==
                                    null ||
                                maximumPrice !==
                                    null
                            ) {

                                const hasPrice =
                                    businessServices.some(
                                        (
                                            service:
                                                CatalogService
                                        ): boolean => {

                                            if (
                                                !service.is_active
                                            ) {
                                                return false;
                                            }


                                            const price =
                                                Number(
                                                    service.price
                                                );


                                            if (
                                                Number.isNaN(
                                                    price
                                                )
                                            ) {
                                                return false;
                                            }


                                            if (
                                                minimumPrice !==
                                                    null &&
                                                price <
                                                    minimumPrice
                                            ) {

                                                return false;
                                            }


                                            if (
                                                maximumPrice !==
                                                    null &&
                                                price >
                                                    maximumPrice
                                            ) {

                                                return false;
                                            }


                                            return true;
                                        }
                                    );


                                if (
                                    !hasPrice
                                ) {

                                    return false;
                                }
                            }


                            return true;
                        }
                    );


                /*
                 * ====================================================
                 * SORT
                 * ====================================================
                 */

                return [
                    ...result
                ].sort(
                    (
                        a:
                            CatalogBusiness,
                        b:
                            CatalogBusiness
                    ): number => {

                        /*
                         * RATING
                         */

                        if (
                            sortId ===
                            1
                        ) {

                            return (
                                Number(
                                    b.rating ??
                                    0
                                ) -
                                Number(
                                    a.rating ??
                                    0
                                )
                            );
                        }


                        /*
                         * PRICE ASC
                         */

                        if (
                            sortId ===
                            2
                        ) {

                            const priceA =
                                getBusinessMinPrice(
                                    a
                                );


                            const priceB =
                                getBusinessMinPrice(
                                    b
                                );


                            if (
                                priceA ===
                                    null &&
                                priceB ===
                                    null
                            ) {
                                return 0;
                            }


                            if (
                                priceA ===
                                null
                            ) {
                                return 1;
                            }


                            if (
                                priceB ===
                                null
                            ) {
                                return -1;
                            }


                            return (
                                priceA -
                                priceB
                            );
                        }


                        /*
                         * PRICE DESC
                         */

                        if (
                            sortId ===
                            3
                        ) {

                            const priceA =
                                getBusinessMinPrice(
                                    a
                                );


                            const priceB =
                                getBusinessMinPrice(
                                    b
                                );


                            if (
                                priceA ===
                                    null &&
                                priceB ===
                                    null
                            ) {
                                return 0;
                            }


                            if (
                                priceA ===
                                null
                            ) {
                                return 1;
                            }


                            if (
                                priceB ===
                                null
                            ) {
                                return -1;
                            }


                            return (
                                priceB -
                                priceA
                            );
                        }


                        /*
                         * NEW
                         */

                        if (
                            sortId ===
                            4
                        ) {

                            const dateA =
                                a.created_at
                                    ? new Date(
                                          a.created_at
                                      ).getTime()
                                    : 0;


                            const dateB =
                                b.created_at
                                    ? new Date(
                                          b.created_at
                                      ).getTime()
                                    : 0;


                            return (
                                dateB -
                                dateA
                            );
                        }


                        /*
                         * OLD
                         */

                        if (
                            sortId ===
                            5
                        ) {

                            const dateA =
                                a.created_at
                                    ? new Date(
                                          a.created_at
                                      ).getTime()
                                    : 0;


                            const dateB =
                                b.created_at
                                    ? new Date(
                                          b.created_at
                                      ).getTime()
                                    : 0;


                            return (
                                dateA -
                                dateB
                            );
                        }


                        /*
                         * REVIEWS
                         */

                        if (
                            sortId ===
                            6
                        ) {

                            return (
                                Number(
                                    b.reviews_count ??
                                    0
                                ) -
                                Number(
                                    a.reviews_count ??
                                    0
                                )
                            );
                        }


                        return 0;
                    }
                );

            },
            [
                catalog,
                sortId,
                minPrice,
                maxPrice,
                selectedCityId,
                selectedCategoryId,
                selectedServices
            ]
        );


    /*
     * ============================================================
     * RESET PAGE WHEN FILTERS CHANGE
     * ============================================================
     */

    useEffect(
        () => {

            setPage(
                1
            );

        },
        [
            searchFromUrl,
            selectedCityId,
            selectedCategoryId,
            selectedServices,
            minPrice,
            maxPrice,
            sortId
        ]
    );


    /*
    * ============================================================
    * PAGINATION DATA
    * ============================================================
    */

    const totalCount =
        filteredBusinesses.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalCount /
                PAGE_SIZE
            )
        );


    const currentPage =
        Math.min(
            page,
            totalPages
        );


    const firstItem =
        totalCount === 0
            ? 0
            : (
                currentPage -
                1
            ) *
                PAGE_SIZE +
            1;


    const lastItem =
        totalCount === 0
            ? 0
            : Math.min(
                currentPage *
                    PAGE_SIZE,
                totalCount
            );


    const paginatedBusinesses =
        useMemo(
            () => {

                const start =
                    (
                        currentPage -
                        1
                    ) *
                    PAGE_SIZE;


                return filteredBusinesses.slice(
                    start,
                    start +
                        PAGE_SIZE
                );

            },
            [
                filteredBusinesses,
                currentPage
            ]
        );

    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    if (
        isError
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
                    border-red-200
                    bg-red-50
                    p-6
                    text-center
                "
            >

                <div>

                    <p
                        className="
                            text-base
                            font-semibold
                            text-red-600
                        "
                    >
                        Не удалось загрузить каталог
                    </p>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-red-500
                        "
                    >
                        Проверьте подключение к серверу.
                    </p>

                </div>

            </div>
        );
    }

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div
            className="
                flex
                w-full
                min-w-0
                flex-col
                gap-5
            "
        >

            {/* =====================================================
                SEARCH + CITY
            ===================================================== */}

            <SearchBar
                value={
                    search
                }

                onChange={
                    setSearch
                }

                cities={
                    cities
                }

                selectedCityId={
                    selectedCityId
                }

                onCityChange={
                    handleCityChange
                }
            />


            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div
                className="
                    grid
                    w-full
                    min-w-0
                    grid-cols-1
                    gap-5

                    md:grid-cols-[260px_minmax(0,1fr)]
                "
            >

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside
                    className="
                        w-full
                        min-w-0
                    "
                >

                    <CatalogSidebar
                        sortId={
                            sortId
                        }

                        onSortChange={
                            setSortId
                        }


                        minPrice={
                            minPrice
                        }

                        maxPrice={
                            maxPrice
                        }

                        onMinPriceChange={
                            setMinPrice
                        }

                        onMaxPriceChange={
                            setMaxPrice
                        }


                        categories={
                            categories
                        }

                        selectedCategoryId={
                            selectedCategoryId
                        }

                        onCategoryChange={
                            handleCategoryChange
                        }


                        services={
                            services
                        }

                        selectedServices={
                            selectedServices
                        }

                        onToggleService={
                            handleToggleService
                        }


                        onReset={
                            handleReset
                        }
                    />

                </aside>


                {/* =================================================
                    BUSINESSES
                ================================================= */}

                <section
                    className="
                        w-full
                        min-w-0
                    "
                >

                    {!isLoading && (

                        <div
                            className="
                                mb-4
                                flex
                                items-center
                                justify-between
                                gap-3
                            "
                        >

                            <span
                                className="
                                    text-sm
                                    font-medium
                                    text-[#667085]
                                "
                            >
                                Найдено:{' '}
                                {
                                    filteredBusinesses.length
                                }
                            </span>


                            {isFetching && (

                                <span
                                    className="
                                        animate-pulse
                                        text-xs
                                        text-[#858585]
                                    "
                                >
                                    Поиск...
                                </span>

                            )}

                        </div>

                    )}


                    <ServiceCard
                        businesses={
                            paginatedBusinesses
                        }

                        isLoading={
                            isLoading
                        }
                    />


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {!isLoading &&
                        totalCount >
                            0 && (

                        <div
                            className="
                                mt-6
                                flex
                                flex-col
                                gap-4
                                rounded-2xl
                                border
                                border-[#D9DDEC]
                                bg-white
                                px-4
                                py-4

                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:px-5
                            "
                        >

                            <div
                                className="
                                    text-sm
                                    font-medium
                                    text-[#667085]
                                "
                            >
                                Показано{' '}

                                <span
                                    className="
                                        font-semibold
                                        text-slate-800
                                    "
                                >
                                    {firstItem}
                                    –
                                    {lastItem}
                                </span>

                                {' '}из{' '}

                                <span
                                    className="
                                        font-semibold
                                        text-slate-800
                                    "
                                >
                                    {totalCount}
                                </span>
                            </div>


                            {totalPages >
                                1 && (

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                    "
                                >

                                    <button
                                        type="button"

                                        disabled={
                                            currentPage <=
                                            1
                                        }

                                        onClick={() =>
                                            setPage(
                                                previous =>
                                                    Math.max(
                                                        1,
                                                        previous -
                                                            1
                                                    )
                                            )
                                        }

                                        className="
                                            flex
                                            h-9
                                            cursor-pointer
                                            items-center
                                            justify-center
                                            gap-1
                                            rounded-lg
                                            border
                                            border-[#D9DDEC]
                                            bg-white
                                            px-3
                                            text-sm
                                            font-medium
                                            text-[#667085]
                                            transition

                                            hover:border-[#4F46E5]
                                            hover:text-[#4F46E5]

                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        <ChevronLeft
                                            size={
                                                16
                                            }
                                        />

                                        <span
                                            className="
                                                hidden
                                                sm:inline
                                            "
                                        >
                                            Пред.
                                        </span>
                                    </button>


                                    {Array.from(
                                        {
                                            length:
                                                totalPages
                                        },
                                        (
                                            _,
                                            index
                                        ) =>
                                            index +
                                            1
                                    ).map(
                                        pageNumber => {

                                            const active =
                                                pageNumber ===
                                                currentPage;


                                            return (
                                                <button
                                                    key={
                                                        pageNumber
                                                    }

                                                    type="button"

                                                    disabled={
                                                        active
                                                    }

                                                    onClick={() =>
                                                        setPage(
                                                            pageNumber
                                                        )
                                                    }

                                                    className={`
                                                        flex
                                                        h-9
                                                        min-w-9
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        border
                                                        px-3
                                                        text-sm
                                                        font-medium
                                                        transition

                                                        ${
                                                            active
                                                                ? `
                                                                    cursor-default
                                                                    border-[#4F46E5]
                                                                    bg-[#4F46E5]
                                                                    text-white
                                                                `
                                                                : `
                                                                    cursor-pointer
                                                                    border-[#D9DDEC]
                                                                    bg-white
                                                                    text-[#667085]

                                                                    hover:border-[#4F46E5]
                                                                    hover:text-[#4F46E5]
                                                                `
                                                        }
                                                    `}
                                                >
                                                    {
                                                        pageNumber
                                                    }
                                                </button>
                                            );
                                        }
                                    )}


                                    <button
                                        type="button"

                                        disabled={
                                            currentPage >=
                                            totalPages
                                        }

                                        onClick={() =>
                                            setPage(
                                                previous =>
                                                    Math.min(
                                                        totalPages,
                                                        previous +
                                                            1
                                                    )
                                            )
                                        }

                                        className="
                                            flex
                                            h-9
                                            cursor-pointer
                                            items-center
                                            justify-center
                                            gap-1
                                            rounded-lg
                                            border
                                            border-[#D9DDEC]
                                            bg-white
                                            px-3
                                            text-sm
                                            font-medium
                                            text-[#667085]
                                            transition

                                            hover:border-[#4F46E5]
                                            hover:text-[#4F46E5]

                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        <span
                                            className="
                                                hidden
                                                sm:inline
                                            "
                                        >
                                            След.
                                        </span>

                                        <ChevronRight
                                            size={
                                                16
                                            }
                                        />
                                    </button>

                                </div>

                            )}

                        </div>

                    )}

                </section>

            </div>

        </div>
    );
}
import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    Heart,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    useNavigate
} from 'react-router-dom';

import Icon from '../../atoms/Icon';
import Button from '../../atoms/Button';
import Typography from '../../atoms/Typography';

import ServiceCard
    from '../Catalog/ServiceCard';

import {
    getFavoriteBusinesses
} from '../../../api/favorites';


export default function FavoritesControl() {

    /*
     * ============================================================
     * NAVIGATION
     * ============================================================
     */

    const navigate =
        useNavigate();


    /*
     * ============================================================
     * PAGE
     * ============================================================
     */

    const [
        page,
        setPage
    ] =
        useState(
            1
        );


    /*
     * ============================================================
     * FAVORITES FROM BACKEND
     * ============================================================
     */

    const {
        data:
            response,

        isLoading,

        isFetching,

        isError,

        refetch
    } =
        useQuery({

            queryKey: [
                'favorite-businesses',
                page
            ],

            queryFn: () =>
                getFavoriteBusinesses(
                    page
                ),

            retry:
                false,

            /*
             * Пока грузится следующая
             * страница, оставляем
             * предыдущие карточки.
             */

            placeholderData:
                previousData =>
                    previousData,

            /*
             * Когда пользователь снова
             * открывает Избранное,
             * получаем свежие данные.
             */

            refetchOnMount:
                'always'
        });


    /*
     * ============================================================
     * RESPONSE
     * ============================================================
     */

    const favorites =
        response
            ?.data ??
        [];


    const pagination =
        response
            ?.pagination;


    /*
     * ============================================================
     * PAGINATION DATA
     * ============================================================
     */

    const currentPage =
        pagination
            ?.current_page ??
        page;


    const totalPages =
        pagination
            ?.total_pages ??
        1;


    const totalCount =
        pagination
            ?.count ??
        0;


    const pageSize =
        pagination
            ?.page_size ??
        5;


    /*
     * Например:
     *
     * page 1 -> 1
     * page 2 -> 6
     */

    const firstItem =
        totalCount ===
        0
            ? 0
            : (
                currentPage -
                1
            ) *
                pageSize +
            1;


    /*
     * Например:
     *
     * count = 12
     *
     * page 1 -> 5
     * page 2 -> 10
     * page 3 -> 12
     */

    const lastItem =
        totalCount ===
        0
            ? 0
            : Math.min(
                currentPage *
                    pageSize,
                totalCount
            );


    /*
     * ============================================================
     * PAGE NUMBERS
     * ============================================================
     */

    const pageNumbers =
        useMemo(
            () => {

                /*
                 * Если страниц <= 5,
                 * показываем все.
                 */

                if (
                    totalPages <=
                    5
                ) {

                    return Array.from(
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
                    );
                }


                /*
                 * Начало:
                 *
                 * 1 2 3 4 5
                 */

                if (
                    currentPage <=
                    3
                ) {

                    return [
                        1,
                        2,
                        3,
                        4,
                        5
                    ];
                }


                /*
                 * Конец:
                 *
                 * 6 7 8 9 10
                 */

                if (
                    currentPage >=
                    totalPages -
                        2
                ) {

                    return [
                        totalPages -
                            4,

                        totalPages -
                            3,

                        totalPages -
                            2,

                        totalPages -
                            1,

                        totalPages
                    ];
                }


                /*
                 * Середина:
                 *
                 * 3 4 5 6 7
                 */

                return [
                    currentPage -
                        2,

                    currentPage -
                        1,

                    currentPage,

                    currentPage +
                        1,

                    currentPage +
                        2
                ];

            },
            [
                currentPage,
                totalPages
            ]
        );


    /*
     * ============================================================
     * CORRECT PAGE AFTER DELETE
     * ============================================================
     *
     * Например:
     *
     * было:
     *
     * page 3
     * 11-11 из 11
     *
     * пользователь удалил последний
     * бизнес из избранного.
     *
     * Теперь страниц осталось 2.
     *
     * Автоматически переходим
     * на страницу 2.
     */

    useEffect(
        () => {

            if (
                !pagination
            ) {
                return;
            }


            if (
                page >
                pagination.total_pages
            ) {

                setPage(
                    Math.max(
                        1,
                        pagination.total_pages
                    )
                );
            }

        },
        [
            page,
            pagination
        ]
    );


    /*
     * ============================================================
     * PAGE CHANGE
     * ============================================================
     */

    const handlePageChange =
        (
            newPage:
                number
        ) => {

            if (
                newPage <
                    1 ||
                newPage >
                    totalPages ||
                newPage ===
                    currentPage ||
                isFetching
            ) {
                return;
            }


            setPage(
                newPage
            );


            /*
             * После переключения страницы
             * возвращаем пользователя наверх.
             */

            window.scrollTo({
                top:
                    0,

                behavior:
                    'smooth'
            });
        };


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
                    min-h-[400px]
                    w-full
                    items-center
                    justify-center
                    rounded-3xl
                    border
                    border-[#D9DDEC]
                    bg-white
                    p-6
                "
            >

                <div
                    className="
                        text-center
                    "
                >

                    <Typography
                        text="Не удалось загрузить избранное"

                        className="
                            text-xl
                            font-bold
                            text-[#111115]
                        "
                    />


                    <Typography
                        text="Попробуйте загрузить страницу ещё раз."

                        className="
                            mt-2
                            text-sm
                            text-[#667085]
                        "
                    />


                    <Button
                        onClick={() =>
                            refetch()
                        }

                        className="
                            mt-5
                            cursor-pointer
                            rounded-xl
                            bg-[#4F46E5]
                            px-6
                            py-3
                            font-medium
                            text-white
                            transition
                            hover:bg-[#3731aa]
                        "
                    >
                        Повторить
                    </Button>

                </div>

            </div>
        );
    }


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
                    flex
                    w-full
                    flex-col
                    gap-6
                "
            >

                <div>

                    <Typography
                        text="Избранное"

                        className="
                            text-2xl
                            font-bold
                            text-[#111115]
                            md:text-3xl
                        "
                    />


                    <Typography
                        text="Загружаем сохранённые места..."

                        className="
                            mt-2
                            text-sm
                            text-[#667085]
                        "
                    />

                </div>


                <ServiceCard
                    businesses={
                        []
                    }

                    isLoading={
                        true
                    }
                />

            </div>
        );
    }


    /*
     * ============================================================
     * EMPTY
     * ============================================================
     */

    if (
        totalCount ===
        0
    ) {

        return (
            <div
                className="
                    flex
                    w-full
                    flex-col
                    gap-6
                "
            >

                <div>

                    <Typography
                        text="Избранное"

                        className="
                            text-2xl
                            font-bold
                            text-[#111115]
                            md:text-3xl
                        "
                    />


                    <Typography
                        text="Сохранённые вами места"

                        className="
                            mt-2
                            text-sm
                            text-[#667085]
                        "
                    />

                </div>


                <div
                    className="
                        flex
                        min-h-[400px]
                        flex-col
                        items-center
                        justify-center
                        rounded-3xl
                        border
                        border-[#D9DDEC]
                        bg-white
                        px-6
                        py-10
                        text-center
                    "
                >

                    <div
                        className="
                            flex
                            h-20
                            w-20
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F2F0FF]
                        "
                    >

                        <Icon
                            icon={
                                Heart
                            }

                            size={
                                34
                            }

                            className="
                                text-[#4F46E5]
                            "
                        />

                    </div>


                    <Typography
                        text="Избранное пока пусто"

                        className="
                            mt-5
                            text-xl
                            font-bold
                            text-[#111115]
                            md:text-2xl
                        "
                    />


                    <Typography
                        text="Добавляйте понравившиеся места, нажимая на сердечко в каталоге."

                        className="
                            mt-2
                            max-w-md
                            text-sm
                            leading-6
                            text-[#667085]
                        "
                    />


                    <Button
                        onClick={() =>
                            navigate(
                                '/catalog'
                            )
                        }

                        className="
                            mt-6
                            cursor-pointer
                            rounded-xl
                            bg-[#4F46E5]
                            px-6
                            py-3
                            font-medium
                            text-white
                            transition
                            hover:bg-[#3731aa]
                        "
                    >
                        Перейти в каталог
                    </Button>

                </div>

            </div>
        );
    }


    /*
     * ============================================================
     * FAVORITES
     * ============================================================
     */

    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-6
            "
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-1
                "
            >

                <Typography
                    text="Избранное"

                    className="
                        text-2xl
                        font-bold
                        text-[#111115]
                        md:text-3xl
                    "
                />


                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <Typography
                        text="Сохранено"

                        className="
                            text-sm
                            text-[#667085]
                        "
                    />


                    {/* =============================================
                        TOTAL COUNT
                    ============================================= */}

                    <span
                        className="
                            flex
                            h-6
                            min-w-6
                            items-center
                            justify-center
                            rounded-full
                            bg-[#EEF2FF]
                            px-2
                            text-xs
                            font-semibold
                            text-[#4F46E5]
                        "
                    >
                        {totalCount}
                    </span>


                    {isFetching && (

                        <Typography
                            text="Обновление..."

                            className="
                                ml-2
                                text-xs
                                text-[#858585]
                            "
                        />

                    )}

                </div>

            </div>


            {/* =====================================================
                FAVORITE CARDS
            ===================================================== */}

            <ServiceCard
                businesses={
                    favorites
                }

                isLoading={
                    false
                }
            />


            {/* =====================================================
                PAGINATION
            ===================================================== */}

            <div
                className="
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

                {/* =================================================
                    COUNT
                ================================================= */}

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

                    {' '}избранных
                </div>


                {/* =================================================
                    CONTROLS
                ================================================= */}

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

                        {/* =========================================
                            PREVIOUS
                        ========================================= */}

                        <button
                            type="button"

                            disabled={
                                currentPage <=
                                    1 ||
                                isFetching
                            }

                            onClick={() =>
                                handlePageChange(
                                    currentPage -
                                        1
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


                        {/* =========================================
                            PAGE NUMBERS
                        ========================================= */}

                        {pageNumbers.map(
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
                                            active ||
                                            isFetching
                                        }

                                        onClick={() =>
                                            handlePageChange(
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

                                            disabled:opacity-60
                                        `}
                                    >
                                        {
                                            pageNumber
                                        }
                                    </button>
                                );
                            }
                        )}


                        {/* =========================================
                            NEXT
                        ========================================= */}

                        <button
                            type="button"

                            disabled={
                                currentPage >=
                                    totalPages ||
                                isFetching
                            }

                            onClick={() =>
                                handlePageChange(
                                    currentPage +
                                        1
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

        </div>
    );
}
import {
    useMemo,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import BusinessCard
    from '../../components/organisms/Crm/Businesses/BusinessCard';

import Cards
    from '../../components/organisms/Crm/Businesses/Cards';

import {
    listBusinesses
} from '../../api/businesses';


export default function Mybusinesses() {

    const [
        page,
        setPage
    ] = useState(1);


    /*
     * ============================================================
     * BUSINESSES
     * ============================================================
     */

    const {
        isPending,
        isFetching,
        error,
        data
    } = useQuery({

        queryKey: [
            'businesses',
            page
        ],

        queryFn: () =>
            listBusinesses(
                page
            ),

        retry:
            false,

        placeholderData:
            previousData =>
                previousData
    });


    const businesses =
        data?.data ??
        [];


    const pagination =
        data?.pagination;


    const currentPage =
        pagination?.current_page ??
        page;


    const totalPages =
        pagination?.total_pages ??
        1;


    const totalCount =
        pagination?.count ??
        0;


    const pageSize =
        pagination?.page_size ??
        9;


    /*
     * ============================================================
     * STATISTICS
     * ============================================================
     */

    const cardsData =
        useMemo(
            () => {

                const active =
                    businesses.filter(
                        business =>
                            business.status ===
                            'active'
                    ).length;


                const drafts =
                    businesses.filter(
                        business =>
                            business.status ===
                            'draft'
                    ).length;


                const blocked =
                    businesses.filter(
                        business =>
                            business.status ===
                            'blocked'
                    ).length;


                return [
                    {
                        id: 1,
                        title: 'Всего бизнесов',
                        num: totalCount,
                        leftBorderClass: ''
                    },

                    {
                        id: 2,
                        title: 'Активные',
                        num: active,
                        leftBorderClass:
                            'border-l-[4px] border-l-green-500'
                    },

                    {
                        id: 3,
                        title: 'Черновики',
                        num: drafts,
                        leftBorderClass:
                            'border-l-[4px] border-l-slate-400'
                    },

                    {
                        id: 4,
                        title: 'Заблокированные',
                        num: blocked,
                        leftBorderClass:
                            'border-l-[4px] border-l-red-500'
                    }
                ];

            },
            [
                businesses,
                totalCount
            ]
        );


    /*
     * ============================================================
     * EMPTY
     * ============================================================
     */

    const hasNoBusinesses =
        totalCount ===
        0;


    /*
     * ============================================================
     * PAGINATION INFO
     * ============================================================
     */

    const firstItem =
        totalCount === 0
            ? 0
            : (
                currentPage -
                1
            ) *
                pageSize +
                1;


    const lastItem =
        totalCount === 0
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
                 * До 5 страниц показываем все.
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
                 * Если страниц много —
                 * показываем максимум 5 рядом
                 * с текущей страницей.
                 */

                let start =
                    Math.max(
                        1,
                        currentPage -
                            2
                    );


                let end =
                    Math.min(
                        totalPages,
                        start +
                            4
                    );


                if (
                    end -
                        start <
                    4
                ) {

                    start =
                        Math.max(
                            1,
                            end -
                                4
                        );
                }


                const pages:
                    number[] = [];


                for (
                    let number =
                        start;
                    number <=
                    end;
                    number +=
                        1
                ) {

                    pages.push(
                        number
                    );
                }


                return pages;

            },
            [
                currentPage,
                totalPages
            ]
        );


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (
        isPending &&
        !data
    ) {

        return (
            <div
                className="
                    flex
                    w-full
                    items-center
                    justify-center
                    px-4
                    py-10
                    text-center
                "
            >
                <p
                    className="
                        text-sm
                        text-gray-500

                        sm:text-base
                    "
                >
                    Загрузка бизнесов...
                </p>
            </div>
        );
    }


    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    if (
        error
    ) {

        return (
            <div
                className="
                    flex
                    w-full
                    items-center
                    justify-center
                    px-4
                    py-10
                    text-center
                "
            >
                <p
                    className="
                        max-w-[420px]
                        text-sm
                        leading-5
                        text-red-500

                        sm:text-base
                    "
                >
                    Произошла ошибка при загрузке бизнесов.
                    Возможно, сессия истекла.
                </p>
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
                gap-6

                sm:gap-8

                lg:gap-10
            "
        >

            {/* =====================================================
                STATISTICS
            ===================================================== */}

            <div
                className="
                    grid
                    w-full
                    min-w-0
                    grid-cols-1
                    gap-3

                    sm:grid-cols-2
                    sm:gap-4

                    lg:grid-cols-4
                    lg:gap-6

                    xl:gap-9
                "
            >

                {cardsData.map(
                    card => (

                        <div
                            key={
                                card.id
                            }
                            className="
                                min-w-0
                            "
                        >
                            <Cards
                                title={
                                    card.title
                                }
                                num={
                                    card.num
                                }
                                leftBorderClass={
                                    card.leftBorderClass
                                }
                            />
                        </div>

                    )
                )}

            </div>


            {/* =====================================================
                BUSINESSES
            ===================================================== */}

            {hasNoBusinesses ? (

                <div
                    className="
                        rounded-2xl
                        border
                        border-dashed
                        border-[#c7c4d8]
                        bg-white
                        px-4
                        py-10
                        text-center

                        sm:py-14
                    "
                >
                    <p
                        className="
                            text-sm
                            text-gray-500

                            sm:text-base
                        "
                    >
                        У вас пока нет ни одного бизнеса
                    </p>
                </div>

            ) : (

                <>

                    {/* =============================================
                        BUSINESS CARDS
                    ============================================= */}

                    <div
                        className={`
                            grid
                            w-full
                            min-w-0
                            grid-cols-1
                            gap-4

                            md:grid-cols-2
                            md:gap-5

                            xl:grid-cols-3
                            xl:gap-6

                            transition-opacity

                            ${
                                isFetching
                                    ? 'opacity-60'
                                    : 'opacity-100'
                            }
                        `}
                    >

                        {businesses.map(
                            business => (

                                <div
                                    key={
                                        business.id
                                    }
                                    className="
                                        min-w-0
                                    "
                                >
                                    <BusinessCard
                                        business={
                                            business
                                        }
                                    />
                                </div>

                            )
                        )}

                    </div>


                    {/* =============================================
                        PAGINATION
                    ============================================= */}

                    <div
                        className="
                            flex
                            w-full
                            min-w-0
                            flex-col
                            gap-4
                            border-t
                            border-[#e2e4f0]
                            pt-5

                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        {/* =========================================
                            INFO
                        ========================================= */}

                        <div
                            className="
                                text-center
                                text-xs
                                leading-5
                                text-slate-500

                                sm:text-left
                                sm:text-sm
                            "
                        >
                            {
                                totalCount ===
                                0
                                    ? 'Бизнесов нет'
                                    : `Показано ${firstItem}-${lastItem} из ${totalCount} бизнесов`
                            }
                        </div>


                        {/* =========================================
                            MOBILE PAGINATION
                        ========================================= */}

                        {totalPages >
                            1 && (

                            <div
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    gap-2

                                    sm:hidden
                                "
                            >

                                {/* PREVIOUS */}

                                <button
                                    type="button"
                                    disabled={
                                        currentPage <=
                                            1 ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            previousPage =>
                                                Math.max(
                                                    1,
                                                    previousPage -
                                                        1
                                                )
                                        )
                                    }
                                    className="
                                        flex
                                        h-10
                                        min-w-[82px]
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        px-3
                                        text-xs
                                        font-medium
                                        text-slate-600
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    Пред.
                                </button>


                                {/* CURRENT */}

                                <div
                                    className="
                                        flex
                                        min-w-0
                                        flex-1
                                        items-center
                                        justify-center
                                        text-xs
                                        font-semibold
                                        text-slate-600
                                    "
                                >
                                    {currentPage} / {totalPages}
                                </div>


                                {/* NEXT */}

                                <button
                                    type="button"
                                    disabled={
                                        currentPage >=
                                            totalPages ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            previousPage =>
                                                Math.min(
                                                    totalPages,
                                                    previousPage +
                                                        1
                                                )
                                        )
                                    }
                                    className="
                                        flex
                                        h-10
                                        min-w-[82px]
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        px-3
                                        text-xs
                                        font-medium
                                        text-slate-600
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    След.
                                </button>

                            </div>

                        )}


                        {/* =========================================
                            TABLET / DESKTOP PAGINATION
                        ========================================= */}

                        {totalPages >
                            1 && (

                            <div
                                className="
                                    hidden
                                    min-w-0
                                    items-center
                                    gap-1

                                    sm:flex
                                "
                            >

                                {/* PREVIOUS */}

                                <button
                                    type="button"
                                    disabled={
                                        currentPage <=
                                            1 ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            previousPage =>
                                                Math.max(
                                                    1,
                                                    previousPage -
                                                        1
                                                )
                                        )
                                    }
                                    className="
                                        h-9
                                        cursor-pointer
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        px-3
                                        text-sm
                                        font-medium
                                        text-slate-600
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40

                                        lg:px-4
                                    "
                                >
                                    Пред.
                                </button>


                                {/* PAGE NUMBERS */}

                                {pageNumbers.map(
                                    pageNumber => (

                                        <button
                                            key={
                                                pageNumber
                                            }
                                            type="button"
                                            disabled={
                                                isFetching
                                            }
                                            onClick={() =>
                                                setPage(
                                                    pageNumber
                                                )
                                            }
                                            className={`
                                                h-9
                                                min-w-9
                                                cursor-pointer
                                                rounded-lg
                                                border
                                                px-2
                                                text-sm
                                                font-medium
                                                transition

                                                ${
                                                    currentPage ===
                                                    pageNumber
                                                        ? `
                                                            border-[#4031d0]
                                                            bg-[#4031d0]
                                                            text-white
                                                        `
                                                        : `
                                                            border-[#c7c4d8]
                                                            bg-white
                                                            text-slate-600
                                                            hover:bg-slate-50
                                                        `
                                                }

                                                disabled:cursor-not-allowed
                                                disabled:opacity-60

                                                lg:px-3
                                            `}
                                        >
                                            {
                                                pageNumber
                                            }
                                        </button>

                                    )
                                )}


                                {/* NEXT */}

                                <button
                                    type="button"
                                    disabled={
                                        currentPage >=
                                            totalPages ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            previousPage =>
                                                Math.min(
                                                    totalPages,
                                                    previousPage +
                                                        1
                                                )
                                        )
                                    }
                                    className="
                                        h-9
                                        cursor-pointer
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        px-3
                                        text-sm
                                        font-medium
                                        text-slate-600
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40

                                        lg:px-4
                                    "
                                >
                                    След.
                                </button>

                            </div>

                        )}

                    </div>

                </>

            )}

        </div>
    );
}
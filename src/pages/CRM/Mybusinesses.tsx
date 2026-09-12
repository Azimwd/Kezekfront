import {
    useMemo,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import BusinessCard from '../../components/organisms/Crm/Businesses/BusinessCard';
import Cards from '../../components/organisms/Crm/Businesses/Cards';

import {
    listBusinesses
} from '../../api/businesses';


export default function Mybusinesses() {
    const [
        page,
        setPage
    ] = useState(1);


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

        retry: false,

        placeholderData:
            (
                previousData
            ) =>
                previousData
    });


    const businesses =
        data?.data ?? [];


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
     * Статистика.
     *
     * totalCount — общее количество из backend.
     *
     * active/drafts/blocked пока считаются
     * только среди бизнесов текущей страницы.
     */
    const cardsData =
        useMemo(() => {
            const active =
                businesses.filter(
                    (business) =>
                        business.status ===
                        'active'
                ).length;


            const drafts =
                businesses.filter(
                    (business) =>
                        business.status ===
                        'draft'
                ).length;


            const blocked =
                businesses.filter(
                    (business) =>
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

        }, [
            businesses,
            totalCount
        ]);


    const hasNoBusinesses =
        totalCount === 0;


    /*
     * Например:
     *
     * страница 1 -> 1-9
     * страница 2 -> 10-18
     */
    const firstItem =
        totalCount === 0
            ? 0
            : (
                currentPage - 1
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


    const pageNumbers =
        Array.from(
            {
                length:
                    totalPages
            },
            (
                _,
                index
            ) =>
                index + 1
        );


    if (
        isPending &&
        !data
    ) {
        return (
            <div className="w-full flex justify-center items-center py-10">
                <p className="text-gray-500">
                    Загрузка бизнесов...
                </p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="w-full flex justify-center items-center py-10">

                <p className="text-red-500">
                    Произошла ошибка при загрузке бизнесов.
                    Возможно, сессия истекла.
                </p>

            </div>
        );
    }


    return (
        <div className="w-full flex flex-col gap-10">

            {/* STATISTICS */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                    gap-9
                "
            >

                {cardsData.map(
                    (
                        card
                    ) => (
                        <Cards
                            key={
                                card.id
                            }
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
                    )
                )}

            </div>


            {/* BUSINESSES */}

            {hasNoBusinesses ? (

                <div className="py-4">

                    <p className="text-gray-500">
                        У вас пока нет ни одного бизнеса
                    </p>

                </div>

            ) : (

                <>
                    <div
                        className={`
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            xl:grid-cols-3
                            gap-6

                            ${
                                isFetching
                                    ? 'opacity-60'
                                    : ''
                            }
                        `}
                    >

                        {businesses.map(
                            (
                                business
                            ) => (
                                <BusinessCard
                                    key={
                                        business.id
                                    }
                                    business={
                                        business
                                    }
                                />
                            )
                        )}

                    </div>


                    {/* PAGINATION */}

                    <div
                        className="
                            flex
                            flex-col
                            sm:flex-row
                            items-center
                            justify-between
                            gap-4
                            border-t
                            border-[#e2e4f0]
                            pt-5
                        "
                    >

                        {/* LEFT TEXT */}

                        <div className="text-sm text-slate-500">

                            {totalCount === 0
                                ? 'Бизнесов нет'
                                : `Показано ${firstItem}-${lastItem} из ${totalCount} бизнесов`
                            }

                        </div>


                        {/* BUTTONS */}

                        {totalPages > 1 && (

                            <div className="flex items-center gap-1">

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
                                            (
                                                previousPage
                                            ) =>
                                                Math.max(
                                                    1,
                                                    previousPage -
                                                        1
                                                )
                                        )
                                    }
                                    className="
                                        h-9
                                        px-4
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        text-sm
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


                                {/* PAGE NUMBERS */}

                                {pageNumbers.map(
                                    (
                                        pageNumber
                                    ) => (
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
                                                px-3
                                                rounded-lg
                                                border
                                                text-sm
                                                font-medium
                                                transition

                                                ${
                                                    currentPage ===
                                                    pageNumber
                                                        ? 'border-[#4031d0] bg-[#4031d0] text-white'
                                                        : 'border-[#c7c4d8] bg-white text-slate-600 hover:bg-slate-50'
                                                }
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
                                            (
                                                previousPage
                                            ) =>
                                                Math.min(
                                                    totalPages,
                                                    previousPage +
                                                        1
                                                )
                                        )
                                    }
                                    className="
                                        h-9
                                        px-4
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        text-sm
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

                    </div>
                </>
            )}

        </div>
    );
}
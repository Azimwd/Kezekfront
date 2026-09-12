import {
    useEffect,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import Filter from '../../../molecules/Crm/Staff/Filter';
import Pagination from '../../../molecules/Crm/Staff/Pagination';
import Searchbar from '../../../molecules/Crm/Staff/Searchbar';
import StaffTable from '../../../molecules/Crm/Staff/StaffTable';

import {
    getMasters
} from '../../../../api/staff';

import {
    useBusiness
} from '../../../../context/BusinessContext';


export type StaffStatus =
    | 'all'
    | 'active'
    | 'inactive';


export default function StaffControl() {
    const {
        selectedBusiness
    } = useBusiness();


    const [
        page,
        setPage
    ] = useState(1);


    const [
        search,
        setSearch
    ] = useState('');


    const [
        debouncedSearch,
        setDebouncedSearch
    ] = useState('');


    const [
        status,
        setStatus
    ] = useState<StaffStatus>(
        'all'
    );


    const businessId =
        selectedBusiness
            ? Number(
                selectedBusiness.id
            )
            : null;


    /*
     * Debounce поиска.
     *
     * Запрос отправится через 400 мс
     * после окончания ввода.
     */
    useEffect(() => {
        const timer =
            setTimeout(() => {
                setDebouncedSearch(
                    search.trim()
                );
            }, 400);


        return () => {
            clearTimeout(
                timer
            );
        };
    }, [
        search
    ]);


    /*
     * При смене бизнеса,
     * поиска или фильтра
     * возвращаемся на первую страницу.
     */
    useEffect(() => {
        setPage(1);
    }, [
        businessId,
        debouncedSearch,
        status
    ]);


    const {
        isPending,
        isFetching,
        data,
        error
    } = useQuery({
        queryKey: [
            'masters',
            businessId,
            page,
            debouncedSearch,
            status
        ],

        queryFn: () =>
            getMasters(
                Number(
                    businessId
                ),
                page,
                debouncedSearch,
                status
            ),

        enabled:
            !!businessId,

        retry: false,

        placeholderData:
            (
                previousData
            ) =>
                previousData
    });


    if (!selectedBusiness) {
        return (
            <div className="flex justify-center items-center h-64 border bg-white border-[#c7c4d8] rounded-2xl p-5">
                <span className="text-gray-500 text-lg">
                    Пожалуйста, выберите бизнес в верхнем меню.
                </span>
            </div>
        );
    }


    if (
        isPending &&
        !data
    ) {
        return (
            <div className="flex justify-center items-center h-64 border bg-white border-[#c7c4d8] rounded-2xl p-5">
                <span className="text-gray-500 text-lg">
                    Загрузка данных специалистов...
                </span>
            </div>
        );
    }


    if (error) {
        return (
            <div className="flex justify-center items-center h-64 border bg-white border-[#c7c4d8] rounded-2xl p-5">
                <span className="text-red-500 text-lg">
                    Произошла ошибка при загрузке данных.
                </span>
            </div>
        );
    }


    const staffList =
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


    return (
        <div className="flex flex-col gap-6 p-5 border bg-white border-[#c7c4d8] rounded-2xl">

            {/* SEARCH + FILTER */}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                <Searchbar
                    value={search}
                    onChange={setSearch}
                />


                <Filter
                    value={status}
                    onChange={setStatus}
                />

            </div>


            {/* TABLE */}

            <div
                className={`
                    transition-opacity
                    duration-200

                    ${
                        isFetching
                            ? 'opacity-60'
                            : 'opacity-100'
                    }
                `}
            >
                <StaffTable
                    staffs={
                        staffList
                    }
                />
            </div>


            {/* PAGINATION */}

            <div
                className="
                    flex
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

                <div className="text-sm text-slate-500">

                    {totalCount === 0
                        ? 'Специалистов нет'
                        : `Показано ${firstItem}-${lastItem} из ${totalCount} специалистов`
                    }

                </div>


                <Pagination
                    currentPage={
                        currentPage
                    }
                    totalPages={
                        totalPages
                    }
                    onPageChange={
                        setPage
                    }
                    disabled={
                        isFetching
                    }
                />

            </div>

        </div>
    );
}
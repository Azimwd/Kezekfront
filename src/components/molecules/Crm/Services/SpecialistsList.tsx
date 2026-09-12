import {
    useEffect,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    CalendarDays,
    Check,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import Typography from '../../../atoms/Typography';
import Icon from '../../../atoms/Icon';

import {
    searchStaff,
    type StaffMember
} from '../../../../api/services';


interface SpecialistsListProps {
    businessId: number;
    selectedIds: number[];
    onChangeSelected: (ids: number[]) => void;
}


type FilterType =
    | 'Все'
    | 'Активные'
    | 'Отключённые';


export default function SpecialistsList({
    businessId,
    selectedIds,
    onChangeSelected
}: SpecialistsListProps) {

    const [
        activeFilter,
        setActiveFilter
    ] = useState<FilterType>(
        'Все'
    );


    const [
        searchQuery,
        setSearchQuery
    ] = useState('');


    /*
     * Поиск, который реально отправляем
     * на backend.
     *
     * Он обновляется с небольшой задержкой,
     * чтобы не делать запрос после каждой буквы.
     */
    const [
        debouncedSearch,
        setDebouncedSearch
    ] = useState('');


    const [
        page,
        setPage
    ] = useState(1);


    /*
     * DEBOUNCE SEARCH
     */
    useEffect(() => {

        const timer =
            setTimeout(() => {

                setDebouncedSearch(
                    searchQuery.trim()
                );

            }, 400);


        return () => {
            clearTimeout(
                timer
            );
        };

    }, [
        searchQuery
    ]);


    /*
     * Преобразуем русский UI-фильтр
     * в параметры backend.
     */
    const status:
        'all' |
        'active' |
        'inactive' =
        activeFilter === 'Активные'
            ? 'active'
            : activeFilter === 'Отключённые'
                ? 'inactive'
                : 'all';


    /*
     * При изменении поиска,
     * фильтра или бизнеса
     * возвращаемся на страницу №1.
     */
    useEffect(() => {
        setPage(1);
    }, [
        businessId,
        debouncedSearch,
        status
    ]);


    /*
     * SERVER REQUEST
     */
    const {
        data,
        isLoading,
        isFetching,
        isError
    } = useQuery({

        queryKey: [
            'service-staff',
            businessId,
            debouncedSearch,
            status,
            page
        ],

        queryFn: () =>
            searchStaff(
                businessId,
                debouncedSearch,
                status,
                page
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


    /*
     * Backend уже вернул
     * отфильтрованных сотрудников.
     *
     * Поэтому .filter() здесь
     * больше не нужен.
     */
    const specialistsList:
        StaffMember[] =
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


    /*
     * CHECKBOX
     */
    const toggleCheckbox = (
        id: number
    ) => {

        onChangeSelected(
            selectedIds.includes(
                id
            )
                ? selectedIds.filter(
                    (
                        item
                    ) =>
                        item !== id
                )
                : [
                    ...selectedIds,
                    id
                ]
        );
    };


    /*
     * INITIALS
     */
    const getInitials = (
        firstName: string,
        lastName: string
    ) => {

        return (
            `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`
        ).toUpperCase();
    };


    const filters:
        FilterType[] = [
            'Все',
            'Активные',
            'Отключённые'
        ];


    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-6
            "
        >

            {/* SEARCH */}

            <div className="relative">

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        left-0
                        flex
                        items-center
                        pl-3
                    "
                >
                    <Search
                        className="
                            h-5
                            w-5
                            text-gray-400
                        "
                    />
                </div>


                <input
                    type="text"
                    placeholder="Поиск по имени или фамилии..."
                    value={
                        searchQuery
                    }
                    onChange={(e) =>
                        setSearchQuery(
                            e.target.value
                        )
                    }
                    className="
                        block
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        bg-white
                        py-2.5
                        pl-10
                        pr-3
                        text-sm
                        leading-5
                        text-slate-800
                        transition-colors
                        placeholder-gray-500
                        focus:border-[#4F46E5]
                        focus:outline-none
                        focus:ring-1
                        focus:ring-[#4F46E5]
                    "
                />

            </div>


            {/* FILTERS */}

            <div className="flex flex-col gap-4">

                <div
                    className="
                        flex
                        items-center
                        justify-start
                        gap-2
                    "
                >

                    {filters.map(
                        (
                            filter
                        ) => (

                            <button
                                key={
                                    filter
                                }
                                type="button"
                                onClick={() =>
                                    setActiveFilter(
                                        filter
                                    )
                                }
                                className={`
                                    cursor-pointer
                                    rounded-full
                                    px-5
                                    py-2
                                    text-sm
                                    font-medium
                                    transition-colors

                                    ${
                                        activeFilter ===
                                        filter
                                            ? 'bg-[#4F46E5] text-white'
                                            : 'bg-transparent text-gray-500 hover:bg-slate-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                {filter}
                            </button>

                        )
                    )}

                </div>


                <hr
                    className="
                        border-t
                        border-gray-100
                    "
                />

            </div>


            {/* RESULT INFO */}

            {!isLoading &&
                !isError && (

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            text-xs
                            text-slate-500
                        "
                    >

                        <span>
                            Найдено: {totalCount}
                        </span>


                        {isFetching && (
                            <span>
                                Обновление...
                            </span>
                        )}

                    </div>

                )}


            {/* LIST */}

            <div
                className={`
                    flex
                    flex-col
                    gap-3
                    transition-opacity

                    ${
                        isFetching &&
                        !isLoading
                            ? 'opacity-60'
                            : 'opacity-100'
                    }
                `}
            >

                {isLoading && (
                    <div
                        className="
                            py-4
                            text-sm
                            text-gray-500
                        "
                    >
                        Загрузка мастеров...
                    </div>
                )}


                {isError && (
                    <div
                        className="
                            py-4
                            text-sm
                            text-red-500
                        "
                    >
                        Ошибка при загрузке данных.
                    </div>
                )}


                {!isLoading &&
                    !isError &&
                    specialistsList.length === 0 && (

                        <div
                            className="
                                py-4
                                text-sm
                                text-gray-400
                            "
                        >
                            Специалисты не найдены.
                        </div>

                    )}


                {specialistsList.map(
                    (
                        specialist
                    ) => {

                        const isChecked =
                            selectedIds.includes(
                                specialist.id
                            );


                        const fullName =
                            `${specialist.first_name} ${specialist.last_name}`;


                        return (
                            <div
                                key={
                                    specialist.id
                                }
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    rounded-2xl
                                    border
                                    border-[#e5e7eb]
                                    bg-white
                                    p-4
                                    transition
                                    hover:border-[#c7c4d8]
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-4
                                    "
                                >

                                    {/* CHECKBOX */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleCheckbox(
                                                specialist.id
                                            )
                                        }
                                        className={`
                                            flex
                                            h-5
                                            w-5
                                            shrink-0
                                            cursor-pointer
                                            items-center
                                            justify-center
                                            rounded-[4px]
                                            border
                                            transition-colors

                                            ${
                                                isChecked
                                                    ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                                                    : 'border-[#d1d5db] bg-white'
                                            }
                                        `}
                                    >
                                        {isChecked && (
                                            <Check
                                                size={
                                                    14
                                                }
                                                strokeWidth={
                                                    3
                                                }
                                            />
                                        )}
                                    </button>


                                    {/* PHOTO */}

                                    {specialist.photo ? (

                                        <img
                                            src={
                                                specialist.photo
                                            }
                                            alt={
                                                fullName
                                            }
                                            className="
                                                h-12
                                                w-12
                                                rounded-full
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-[#e0e7ff]
                                                text-sm
                                                font-semibold
                                                tracking-wide
                                                text-[#4F46E5]
                                            "
                                        >
                                            {getInitials(
                                                specialist.first_name,
                                                specialist.last_name
                                            )}
                                        </div>

                                    )}


                                    {/* INFO */}

                                    <div className="flex flex-col">

                                        <Typography
                                            text={
                                                fullName
                                            }
                                            className="
                                                text-sm
                                                font-semibold
                                                text-slate-800
                                            "
                                        />


                                        <Typography
                                            text={
                                                specialist.position ||
                                                'Должность не указана'
                                            }
                                            className="
                                                mt-0.5
                                                text-xs
                                                text-slate-500
                                            "
                                        />


                                        <div
                                            className="
                                                mt-1.5
                                                flex
                                                items-center
                                                gap-1.5
                                                text-slate-400
                                            "
                                        >

                                            <Icon
                                                icon={
                                                    CalendarDays
                                                }
                                                size={
                                                    13
                                                }
                                            />


                                            <Typography
                                                text={
                                                    specialist.description ||
                                                    'Нет описания'
                                                }
                                                className="
                                                    text-xs
                                                    text-slate-500
                                                "
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* STATUS */}

                                <div
                                    className={`
                                        rounded-md
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-semibold

                                        ${
                                            specialist.is_active
                                                ? 'bg-[#eff4ff] text-[#4F46E5]'
                                                : 'bg-gray-100 text-gray-500'
                                        }
                                    `}
                                >
                                    {specialist.is_active
                                        ? 'Активен'
                                        : 'Отключён'
                                    }
                                </div>

                            </div>
                        );
                    }
                )}

            </div>


            {/* PAGINATION */}

            {!isLoading &&
                !isError &&
                totalPages > 1 && (

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-t
                            border-gray-100
                            pt-5
                        "
                    >

                        <Typography
                            text={
                                `Страница ${currentPage} из ${totalPages}`
                            }
                            className="
                                text-sm
                                text-slate-500
                            "
                        />


                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            {/* PREVIOUS */}

                            <button
                                type="button"
                                disabled={
                                    currentPage <= 1 ||
                                    isFetching
                                }
                                onClick={() =>
                                    setPage(
                                        (
                                            current
                                        ) =>
                                            Math.max(
                                                current -
                                                    1,
                                                1
                                            )
                                    )
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-[#c7c4d8]
                                    bg-white
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <ChevronLeft
                                    size={18}
                                />
                            </button>


                            {/* NUMBERS */}

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
                                            rounded-lg
                                            border
                                            px-3
                                            text-sm
                                            font-medium
                                            transition

                                            ${
                                                currentPage ===
                                                pageNumber
                                                    ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                                                    : 'border-[#c7c4d8] bg-white text-slate-600 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        {pageNumber}
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
                                            current
                                        ) =>
                                            Math.min(
                                                current +
                                                    1,
                                                totalPages
                                            )
                                    )
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-[#c7c4d8]
                                    bg-white
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <ChevronRight
                                    size={18}
                                />
                            </button>

                        </div>

                    </div>

                )}

        </div>
    );
}
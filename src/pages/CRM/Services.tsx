import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    Scissors,
    Trash2
} from 'lucide-react';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import Typography
    from '../../components/atoms/Typography';

import Button
    from '../../components/atoms/Button';

import Icon
    from '../../components/atoms/Icon';

import EditService
    from '../../components/molecules/Crm/Services/EditService';

import {
    useBusiness
} from '../../context/BusinessContext';

import {
    deleteService,
    listOfServices
} from '../../api/services';


export default function Services() {

    /*
     * ============================================================
     * BASIC
     * ============================================================
     */

    const {
        selectedBusiness
    } = useBusiness();


    const queryClient =
        useQueryClient();


    const [
        page,
        setPage
    ] = useState(
        1
    );


    /*
     * При смене бизнеса
     * возвращаемся на первую страницу.
     */

    useEffect(
        () => {

            setPage(
                1
            );

        },
        [
            selectedBusiness?.id
        ]
    );


    /*
     * ============================================================
     * SERVICES
     * ============================================================
     */

    const {
        data,
        isLoading,
        isFetching,
        error
    } = useQuery({

        queryKey: [
            'services',
            selectedBusiness?.id,
            page
        ],

        queryFn: () =>
            listOfServices(
                Number(
                    selectedBusiness!.id
                ),
                page
            ),

        enabled:
            !!selectedBusiness?.id,

        retry:
            false,

        placeholderData:
            previousData =>
                previousData
    });


    /*
     * ============================================================
     * PAGINATION
     * ============================================================
     */

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
        data?.data?.length ??
        0;


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


                const pages:
                    number[] = [];


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


                for (
                    let i =
                        start;
                    i <=
                    end;
                    i +=
                        1
                ) {

                    pages.push(
                        i
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
     * DELETE
     * ============================================================
     */

    const deleteMutation =
        useMutation({

            mutationFn:
                (
                    id:
                        number
                ) =>
                    deleteService(
                        id
                    ),


            onSuccess:
                async () => {

                    /*
                     * Если удалили последний элемент
                     * на странице, возвращаемся назад.
                     */

                    if (
                        data?.data?.length ===
                            1 &&
                        page >
                            1
                    ) {

                        setPage(
                            previous =>
                                previous -
                                1
                        );

                    } else {

                        await queryClient.invalidateQueries({
                            queryKey: [
                                'services',
                                selectedBusiness?.id
                            ]
                        });
                    }
                },


            onError:
                (
                    err
                ) => {

                    console.error(
                        'Ошибка при удалении услуги:',
                        err
                    );


                    alert(
                        'Произошла ошибка при удалении услуги.'
                    );
                }
        });


    const handleDelete =
        (
            id:
                number
        ) => {

            const confirmed =
                window.confirm(
                    'Вы уверены, что хотите удалить эту услугу?'
                );


            if (
                confirmed
            ) {

                deleteMutation.mutate(
                    id
                );
            }
        };


    /*
     * ============================================================
     * NO BUSINESS
     * ============================================================
     */

    if (
        !selectedBusiness
    ) {

        return (
            <div
                className="
                    p-10
                    text-center
                    text-gray-500
                "
            >
                Пожалуйста, выберите бизнес из списка сверху...
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
                    p-10
                    text-center
                    text-gray-500
                "
            >
                Загрузка сервисов...
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
                    py-10
                "
            >

                <p
                    className="
                        text-center
                        text-red-500
                    "
                >
                    Произошла ошибка при загрузке сервисов. Возможно, сессия
                    истекла.
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
                max-w-full
                min-w-0
                flex-col
                gap-6

                md:gap-10
            "
        >

            {/* =====================================================
                BUSINESS INFO
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    p-4

                    md:p-5
                "
            >

                <Typography
                    className="
                        mb-1
                        text-base
                        font-medium
                        text-gray-900

                        md:text-lg
                    "
                    text={
                        `Текущий бизнес: ${
                            selectedBusiness.label ||
                            'Не выбрано'
                        }`
                    }
                />


                <Typography
                    className="
                        text-xs
                        leading-relaxed
                        text-gray-600

                        md:text-sm
                    "
                    text={
                        `Управляйте услугами бизнеса ${
                            selectedBusiness.label ||
                            'Не выбрано'
                        }. Услуги создаются и отображаются только для выбранного бизнеса.`
                    }
                />

            </div>


            {/* =====================================================
                SERVICES
            ===================================================== */}

            <div
                className="
                    flex
                    min-w-0
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                "
            >

                {/* =================================================
                    FETCH INDICATOR
                ================================================= */}

                {isFetching && (

                    <div
                        className="
                            h-1
                            w-full
                            animate-pulse
                            bg-[#4F46E5]
                        "
                    />

                )}


                {/* =================================================
                    MOBILE CARDS
                ================================================= */}

                <div
                    className="
                        flex
                        flex-col
                        divide-y
                        divide-gray-200

                        md:hidden
                    "
                >

                    {data?.data &&
                    data.data.length >
                        0 ? (

                        data.data.map(
                            (
                                service:
                                    any
                            ) => (

                                <div
                                    key={
                                        service.id
                                    }
                                    className="
                                        flex
                                        flex-col
                                        gap-4
                                        p-4
                                    "
                                >

                                    {/* TOP */}

                                    <div
                                        className="
                                            flex
                                            items-start
                                            justify-between
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <div
                                                className={`
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    transition-colors

                                                    ${
                                                        service.is_active ===
                                                        false
                                                            ? `
                                                                bg-gray-100
                                                                text-gray-400
                                                            `
                                                            : `
                                                                bg-[#eeebff]
                                                                text-[#6366f1]
                                                            `
                                                    }
                                                `}
                                            >

                                                <Icon
                                                    size={
                                                        20
                                                    }
                                                    icon={
                                                        Scissors
                                                    }
                                                />

                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <div
                                                    className="
                                                        break-words
                                                        text-[15px]
                                                        font-semibold
                                                        text-slate-800
                                                    "
                                                >
                                                    {
                                                        service.name
                                                    }
                                                </div>


                                                <div
                                                    className={`
                                                        mt-1
                                                        inline-flex
                                                        rounded-full
                                                        px-2
                                                        py-0.5
                                                        text-[10px]
                                                        font-medium

                                                        ${
                                                            service.is_active ===
                                                            false
                                                                ? `
                                                                    bg-gray-100
                                                                    text-gray-500
                                                                `
                                                                : `
                                                                    bg-green-50
                                                                    text-green-600
                                                                `
                                                        }
                                                    `}
                                                >
                                                    {
                                                        service.is_active ===
                                                        false
                                                            ? 'Неактивна'
                                                            : 'Активна'
                                                    }
                                                </div>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div
                                            className="
                                                flex
                                                shrink-0
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <EditService
                                                service={
                                                    service
                                                }
                                            />


                                            <Button
                                                type="button"
                                                className={`
                                                    text-slate-500
                                                    transition-colors
                                                    hover:text-red-500

                                                    ${
                                                        deleteMutation.isPending
                                                            ? `
                                                                cursor-not-allowed
                                                                opacity-50
                                                            `
                                                            : `
                                                                cursor-pointer
                                                            `
                                                    }
                                                `}
                                                onClick={() =>
                                                    handleDelete(
                                                        service.id
                                                    )
                                                }
                                                disabled={
                                                    deleteMutation.isPending
                                                }
                                            >

                                                <Icon
                                                    icon={
                                                        Trash2
                                                    }
                                                    size={
                                                        20
                                                    }
                                                />

                                            </Button>

                                        </div>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div
                                        className="
                                            text-[13px]
                                            leading-5
                                            text-gray-500
                                        "
                                    >
                                        {
                                            service.description ||
                                            'Описание не указано'
                                        }
                                    </div>


                                    {/* INFO */}

                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            gap-3
                                            rounded-xl
                                            bg-[#f8f9ff]
                                            p-3
                                        "
                                    >

                                        {/* PRICE */}

                                        <div>

                                            <div
                                                className="
                                                    mb-1
                                                    text-[10px]
                                                    font-medium
                                                    uppercase
                                                    tracking-wide
                                                    text-gray-400
                                                "
                                            >
                                                Цена
                                            </div>


                                            <div
                                                className="
                                                    text-[13px]
                                                    font-semibold
                                                    text-slate-800
                                                "
                                            >
                                                {
                                                    Number(
                                                        service.price
                                                    ).toLocaleString(
                                                        'ru-RU'
                                                    )
                                                } ₸
                                            </div>

                                        </div>


                                        {/* DURATION */}

                                        <div>

                                            <div
                                                className="
                                                    mb-1
                                                    text-[10px]
                                                    font-medium
                                                    uppercase
                                                    tracking-wide
                                                    text-gray-400
                                                "
                                            >
                                                Длительность
                                            </div>


                                            <div
                                                className="
                                                    text-[13px]
                                                    text-gray-700
                                                "
                                            >
                                                {
                                                    service.duration_minutes
                                                } мин
                                            </div>

                                        </div>


                                        {/* BUFFER BEFORE */}

                                        <div>

                                            <div
                                                className="
                                                    mb-1
                                                    text-[10px]
                                                    font-medium
                                                    uppercase
                                                    tracking-wide
                                                    text-gray-400
                                                "
                                            >
                                                Буфер до
                                            </div>


                                            <div
                                                className="
                                                    text-[13px]
                                                    text-gray-700
                                                "
                                            >
                                                {
                                                    service.buffer_before_minutes
                                                } мин
                                            </div>

                                        </div>


                                        {/* BUFFER AFTER */}

                                        <div>

                                            <div
                                                className="
                                                    mb-1
                                                    text-[10px]
                                                    font-medium
                                                    uppercase
                                                    tracking-wide
                                                    text-gray-400
                                                "
                                            >
                                                Буфер после
                                            </div>


                                            <div
                                                className="
                                                    text-[13px]
                                                    text-gray-700
                                                "
                                            >
                                                {
                                                    service.buffer_after_minutes
                                                } мин
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )
                        )

                    ) : (

                        <div
                            className="
                                px-6
                                py-10
                                text-center
                                text-sm
                                text-gray-500
                            "
                        >
                            Услуги пока не добавлены.
                        </div>

                    )}

                </div>


                {/* =================================================
                    DESKTOP TABLE
                ================================================= */}

                <div
                    className="
                        hidden
                        overflow-x-auto

                        md:block
                    "
                >

                    <table
                        className="
                            w-full
                            min-w-[800px]
                            border-collapse
                            text-left
                        "
                    >

                        <thead>

                            <tr
                                className="
                                    border-b
                                    border-[#c7c4d8]
                                "
                            >

                                <th
                                    className="
                                        px-6
                                        py-4
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-gray-500
                                    "
                                >
                                    Название
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-gray-500
                                    "
                                >
                                    Описание
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-gray-500
                                    "
                                >
                                    Цена
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-gray-500
                                    "
                                >
                                    Длительность
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-gray-500
                                    "
                                >
                                    Буфер до / после
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        text-right
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-gray-500
                                    "
                                >
                                    Действия
                                </th>

                            </tr>

                        </thead>


                        <tbody
                            className="
                                divide-y
                                divide-gray-200
                            "
                        >

                            {data?.data &&
                            data.data.length >
                                0 ? (

                                data.data.map(
                                    (
                                        service:
                                            any
                                    ) => (

                                        <tr
                                            key={
                                                service.id
                                            }
                                            className="
                                                transition-colors
                                                hover:bg-slate-50
                                            "
                                        >

                                            {/* NAME */}

                                            <td
                                                className="
                                                    px-6
                                                    py-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-4
                                                    "
                                                >

                                                    <div
                                                        className={`
                                                            flex
                                                            h-10
                                                            w-10
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            transition-colors

                                                            ${
                                                                service.is_active ===
                                                                false
                                                                    ? `
                                                                        bg-gray-100
                                                                        text-gray-400
                                                                    `
                                                                    : `
                                                                        bg-[#eeebff]
                                                                        text-[#6366f1]
                                                                    `
                                                            }
                                                        `}
                                                    >

                                                        <Icon
                                                            size={
                                                                20
                                                            }
                                                            icon={
                                                                Scissors
                                                            }
                                                        />

                                                    </div>


                                                    <span
                                                        className="
                                                            whitespace-nowrap
                                                            font-semibold
                                                            text-slate-800
                                                        "
                                                    >
                                                        {
                                                            service.name
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* DESCRIPTION */}

                                            <td
                                                className="
                                                    max-w-[260px]
                                                    px-6
                                                    py-4
                                                    text-sm
                                                    text-gray-500
                                                "
                                            >

                                                <div
                                                    className="
                                                        truncate
                                                    "
                                                >
                                                    {
                                                        service.description ||
                                                        '—'
                                                    }
                                                </div>

                                            </td>


                                            {/* PRICE */}

                                            <td
                                                className="
                                                    whitespace-nowrap
                                                    px-6
                                                    py-4
                                                    text-sm
                                                    font-semibold
                                                    text-slate-800
                                                "
                                            >
                                                {
                                                    Number(
                                                        service.price
                                                    ).toLocaleString(
                                                        'ru-RU'
                                                    )
                                                } ₸
                                            </td>


                                            {/* DURATION */}

                                            <td
                                                className="
                                                    whitespace-nowrap
                                                    px-6
                                                    py-4
                                                    text-sm
                                                    text-gray-600
                                                "
                                            >
                                                {
                                                    service.duration_minutes
                                                } мин
                                            </td>


                                            {/* BUFFER */}

                                            <td
                                                className="
                                                    whitespace-nowrap
                                                    px-6
                                                    py-4
                                                    text-sm
                                                    text-gray-600
                                                "
                                            >
                                                {
                                                    service.buffer_before_minutes
                                                } мин
                                                {' / '}
                                                {
                                                    service.buffer_after_minutes
                                                } мин
                                            </td>


                                            {/* ACTIONS */}

                                            <td
                                                className="
                                                    whitespace-nowrap
                                                    px-6
                                                    py-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        justify-end
                                                        gap-5
                                                    "
                                                >

                                                    <EditService
                                                        service={
                                                            service
                                                        }
                                                    />


                                                    <Button
                                                        type="button"
                                                        className={`
                                                            text-slate-500
                                                            transition-colors
                                                            hover:text-red-500

                                                            ${
                                                                deleteMutation.isPending
                                                                    ? `
                                                                        cursor-not-allowed
                                                                        opacity-50
                                                                    `
                                                                    : `
                                                                        cursor-pointer
                                                                    `
                                                            }
                                                        `}
                                                        onClick={() =>
                                                            handleDelete(
                                                                service.id
                                                            )
                                                        }
                                                        disabled={
                                                            deleteMutation.isPending
                                                        }
                                                    >

                                                        <Icon
                                                            icon={
                                                                Trash2
                                                            }
                                                            size={
                                                                20
                                                            }
                                                        />

                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan={
                                            6
                                        }
                                        className="
                                            px-6
                                            py-10
                                            text-center
                                            text-gray-500
                                        "
                                    >
                                        Услуги пока не добавлены.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {totalPages >
                    0 && (

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            border-t
                            border-[#c7c4d8]
                            bg-white
                            px-4
                            py-4

                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            sm:px-6
                        "
                    >

                        {/* INFO */}

                        <span
                            className="
                                text-center
                                text-xs
                                font-medium
                                text-gray-500

                                sm:text-left
                                sm:text-sm
                            "
                        >
                            Показано {firstItem}-{lastItem} из {totalCount} услуг
                        </span>


                        {/* =================================================
                            MOBILE PAGINATION
                        ================================================= */}

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

                            <button
                                type="button"
                                disabled={
                                    currentPage <=
                                        1 ||
                                    isFetching
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
                                    cursor-pointer
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-white
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    text-gray-700
                                    transition-colors
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                Пред.
                            </button>


                            <span
                                className="
                                    text-xs
                                    font-medium
                                    text-gray-600
                                "
                            >
                                {currentPage} / {totalPages}
                            </span>


                            <button
                                type="button"
                                disabled={
                                    currentPage >=
                                        totalPages ||
                                    isFetching
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
                                    cursor-pointer
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-white
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    text-gray-700
                                    transition-colors
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                След.
                            </button>

                        </div>


                        {/* =================================================
                            DESKTOP PAGINATION
                        ================================================= */}

                        <div
                            className="
                                hidden
                                items-center
                                gap-2

                                sm:flex
                            "
                        >

                            <button
                                type="button"
                                disabled={
                                    currentPage <=
                                        1 ||
                                    isFetching
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
                                    cursor-pointer
                                    rounded-md
                                    border
                                    border-gray-200
                                    bg-white
                                    px-3
                                    py-1.5
                                    text-sm
                                    text-gray-500
                                    transition-colors
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                Пред.
                            </button>


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
                                            min-w-[34px]
                                            cursor-pointer
                                            rounded-md
                                            border
                                            px-3
                                            py-1.5
                                            text-sm
                                            font-medium
                                            transition-colors

                                            ${
                                                pageNumber ===
                                                currentPage
                                                    ? `
                                                        border-[#4F46E5]
                                                        bg-[#4F46E5]
                                                        text-white
                                                        shadow-sm
                                                    `
                                                    : `
                                                        border-gray-200
                                                        bg-white
                                                        text-gray-700
                                                        hover:bg-gray-50
                                                    `
                                            }

                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        `}
                                    >
                                        {
                                            pageNumber
                                        }
                                    </button>

                                )
                            )}


                            <button
                                type="button"
                                disabled={
                                    currentPage >=
                                        totalPages ||
                                    isFetching
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
                                    cursor-pointer
                                    rounded-md
                                    border
                                    border-gray-200
                                    bg-white
                                    px-3
                                    py-1.5
                                    text-sm
                                    text-gray-700
                                    transition-colors
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                След.
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}
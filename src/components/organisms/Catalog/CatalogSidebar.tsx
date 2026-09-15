import {
    Blend,
    Funnel
} from 'lucide-react';

import Select, {
    type SelectOption
} from '../../atoms/Select';

import Typography
    from '../../atoms/Typography';

import Input
    from '../../atoms/Input';

import Button
    from '../../atoms/Button';

import Icon
    from '../../atoms/Icon';

import DropDownQuery
    from '../../molecules/Catalog/DropDownQuery';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface CatalogCategoryOption {
    id: number;
    name: string;
}


export interface CatalogServiceOption {
    name: string;
}


interface CatalogSidebarProps {
    sortId: number;

    onSortChange: (
        sortId: number
    ) => void;


    minPrice: string;

    maxPrice: string;


    onMinPriceChange: (
        value: string
    ) => void;

    onMaxPriceChange: (
        value: string
    ) => void;


    categories:
        CatalogCategoryOption[];


    selectedCategoryId:
        number | null;


    onCategoryChange: (
        categoryId:
            number | null
    ) => void;


    services:
        CatalogServiceOption[];


    selectedServices:
        string[];


    onToggleService: (
        serviceName: string
    ) => void;


    onReset:
        () => void;
}


/*
 * ============================================================
 * SORT
 * ============================================================
 */

const sortOptions:
    SelectOption[] = [

        {
            id: 1,
            label:
                'По рейтингу'
        },

        {
            id: 2,
            label:
                'По цене: сначала дешевле'
        },

        {
            id: 3,
            label:
                'По цене: сначала дороже'
        },

        {
            id: 4,
            label:
                'Сначала новые'
        },

        {
            id: 5,
            label:
                'Сначала старые'
        },

        {
            id: 6,
            label:
                'По количеству отзывов'
        }

    ];


/*
 * ============================================================
 * PRICE INPUT
 * ============================================================
 */

const handlePriceInput = (
    value: string,

    callback: (
        value: string
    ) => void
) => {

    if (
        /^\d*([.,]\d{0,2})?$/.test(
            value
        )
    ) {

        callback(
            value
        );
    }
};


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function CatalogSidebar({
    sortId,
    onSortChange,

    minPrice,
    maxPrice,

    onMinPriceChange,
    onMaxPriceChange,

    categories,
    selectedCategoryId,
    onCategoryChange,

    services,
    selectedServices,
    onToggleService,

    onReset
}: CatalogSidebarProps) {

    const selectedSort =
        sortOptions.find(
            (
                option:
                    SelectOption
            ) =>
                Number(
                    option.id
                ) ===
                sortId
        ) ??
        sortOptions[0];


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

            {/* FILTER */}

            <div
                className="
                    w-full
                    rounded-3xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-5
                    py-2
                    sm:px-6
                "
            >

                <DropDownQuery
                    title="Фильтр"
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                        "
                    >

                        <Typography
                            text="Сортировка"
                            className="
                                pt-4
                                text-sm
                            "
                        />


                        <Select
                            options={
                                sortOptions
                            }

                            value={
                                selectedSort
                            }

                            onChange={(
                                option:
                                    SelectOption
                            ) => {

                                onSortChange(
                                    Number(
                                        option.id
                                    )
                                );
                            }}

                            leftIcon={
                                Funnel
                            }

                            className="
                                w-full
                                min-w-0
                                rounded-xl
                                border
                                border-[#e3e3e3]
                                font-normal
                            "
                        />


                        <Typography
                            text="Цена"
                            className="
                                pt-3
                                text-sm
                            "
                        />


                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-2
                            "
                        >

                            <Input
                                type="text"
                                placeholder="От"
                                inputMode="decimal"

                                value={
                                    minPrice
                                }

                                onChange={
                                    event => {

                                        handlePriceInput(
                                            event
                                                .target
                                                .value,

                                            onMinPriceChange
                                        );
                                    }
                                }

                                className="
                                    min-w-0
                                    rounded-xl
                                    border
                                    border-[#e3e3e3]
                                    px-3
                                    py-2
                                "
                            />


                            <Input
                                type="text"
                                placeholder="До"
                                inputMode="decimal"

                                value={
                                    maxPrice
                                }

                                onChange={
                                    event => {

                                        handlePriceInput(
                                            event
                                                .target
                                                .value,

                                            onMaxPriceChange
                                        );
                                    }
                                }

                                className="
                                    min-w-0
                                    rounded-xl
                                    border
                                    border-[#e3e3e3]
                                    px-3
                                    py-2
                                "
                            />

                        </div>


                        <Button
                            onClick={
                                onReset
                            }

                            className="
                                flex
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#4F46E5]
                                p-3
                                text-white
                                transition-colors
                                hover:bg-indigo-600
                            "
                        >

                            <Icon
                                icon={
                                    Blend
                                }
                                size={
                                    20
                                }
                            />


                            <Typography
                                text="Сбросить фильтры"
                                className="
                                    text-sm
                                "
                            />

                        </Button>

                    </div>

                </DropDownQuery>

            </div>


            {/* CATEGORY */}

            <div
                className="
                    w-full
                    rounded-3xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-5
                    py-2
                    sm:px-6
                "
            >

                <DropDownQuery
                    title="Категория"
                >

                    <div
                        className="
                            flex
                            max-h-[350px]
                            flex-col
                            gap-2
                            overflow-y-auto
                            pt-3
                            pr-1
                        "
                    >

                        {categories.length ===
                        0 ? (

                            <Typography
                                text="Категорий пока нет"
                                className="
                                    py-2
                                    text-sm
                                    text-[#858585]
                                "
                            />

                        ) : (

                            categories.map(
                                (
                                    category:
                                        CatalogCategoryOption
                                ) => {

                                    const isActive =
                                        selectedCategoryId ===
                                        category.id;


                                    return (
                                        <Button
                                            key={
                                                category.id
                                            }

                                            onClick={() => {

                                                onCategoryChange(
                                                    isActive
                                                        ? null
                                                        : category.id
                                                );
                                            }}

                                            className={`
                                                flex
                                                w-full
                                                cursor-pointer
                                                items-center
                                                justify-start
                                                gap-2
                                                rounded-xl
                                                border
                                                p-3
                                                text-left
                                                transition-colors

                                                ${
                                                    isActive
                                                        ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                                                        : 'border-[#e3e3e3] bg-white text-[#222222] hover:border-[#4F46E5] hover:text-[#4F46E5]'
                                                }
                                            `}
                                        >

                                            <Icon
                                                icon={
                                                    Blend
                                                }
                                                size={
                                                    20
                                                }
                                            />


                                            <Typography
                                                text={
                                                    category.name
                                                }

                                                className="
                                                    min-w-0
                                                    text-sm
                                                "
                                            />

                                        </Button>
                                    );
                                }
                            )

                        )}

                    </div>

                </DropDownQuery>

            </div>


            {/* SERVICES */}

            {/* <div
                className="
                    w-full
                    rounded-3xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    px-5
                    py-2
                    sm:px-6
                "
            >

                <DropDownQuery
                    title="Услуги"
                >

                    <div
                        className="
                            mt-4
                            flex
                            max-h-[350px]
                            flex-col
                            gap-3
                            overflow-y-auto
                            pr-1
                        "
                    >

                        {services.length ===
                        0 ? (

                            <Typography
                                text="Услуг пока нет"
                                className="
                                    py-2
                                    text-sm
                                    text-[#858585]
                                "
                            />

                        ) : (

                            services.map(
                                (
                                    service:
                                        CatalogServiceOption
                                ) => {

                                    const isChecked =
                                        selectedServices.includes(
                                            service.name
                                        );


                                    return (
                                        <label
                                            key={
                                                service.name
                                            }

                                            className="
                                                flex
                                                cursor-pointer
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <input
                                                type="checkbox"

                                                checked={
                                                    isChecked
                                                }

                                                onChange={() => {

                                                    onToggleService(
                                                        service.name
                                                    );
                                                }}

                                                className="
                                                    h-4
                                                    w-4
                                                    shrink-0
                                                    cursor-pointer
                                                    accent-[#4F46E5]
                                                "
                                            />


                                            <Typography
                                                text={
                                                    service.name
                                                }

                                                className="
                                                    min-w-0
                                                    text-sm
                                                    text-[#222222]
                                                "
                                            />

                                        </label>
                                    );
                                }
                            )

                        )}

                    </div>

                </DropDownQuery>

            </div> */}

        </div>
    );
}
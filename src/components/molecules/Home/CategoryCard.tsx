import {
    BriefcaseMedical,
    Car,
    Dumbbell,
    GraduationCap,
    LayoutGrid,
    Scale,
    UserRound,
    Wrench,
    type LucideIcon
} from 'lucide-react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    useNavigate
} from 'react-router-dom';

import Typography from '../../atoms/Typography';
import Icon from '../../atoms/Icon';
import Button from '../../atoms/Button';

import {
    getCatalogCategories,
    type CatalogCategory
} from '../../../api/catalog';


/*
 * ============================================================
 * CATEGORY ICON
 * ============================================================
 */

const getCategoryIcon = (
    name: string
): LucideIcon => {

    const normalizedName =
        name
            .trim()
            .toLocaleLowerCase(
                'ru'
            );


    if (
        normalizedName.includes(
            'крас'
        )
    ) {
        return UserRound;
    }


    if (
        normalizedName.includes(
            'мед'
        )
    ) {
        return BriefcaseMedical;
    }


    if (
        normalizedName.includes(
            'авто'
        )
    ) {
        return Car;
    }


    if (
        normalizedName.includes(
            'ремонт'
        )
    ) {
        return Wrench;
    }


    if (
        normalizedName.includes(
            'образ'
        )
    ) {
        return GraduationCap;
    }


    if (
        normalizedName.includes(
            'юрист'
        ) ||
        normalizedName.includes(
            'прав'
        )
    ) {
        return Scale;
    }


    if (
        normalizedName.includes(
            'спорт'
        )
    ) {
        return Dumbbell;
    }


    return LayoutGrid;
};


export default function CategoryCard() {

    const navigate =
        useNavigate();


    const {
        data: categories = [],
        isLoading
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
     * На главной показываем первые 7.
     */

    const visibleCategories =
        categories.slice(
            0,
            7
        );


    if (
        isLoading
    ) {

        return (
            <div
                className="
                    grid
                    w-full
                    grid-cols-1
                    gap-4
                    rounded-3xl
                    border
                    border-[#E1E4F5]
                    bg-white
                    p-4

                    sm:grid-cols-2
                    md:grid-cols-4
                "
            >

                {Array.from({
                    length: 8
                }).map(
                    (
                        _,
                        index
                    ) => (

                        <div
                            key={
                                index
                            }

                            className="
                                h-35
                                animate-pulse
                                rounded-2xl
                                bg-[#F4F6FC]

                                md:h-62.5
                            "
                        />

                    )
                )}

            </div>
        );
    }


    return (
        <div
            className="
                grid
                w-full
                grid-cols-1
                gap-4
                rounded-3xl
                border
                border-[#E1E4F5]
                bg-white
                p-4

                sm:grid-cols-2
                md:grid-cols-4
            "
        >

            {visibleCategories.map(
                (
                    category:
                        CatalogCategory
                ) => {

                    const CategoryIcon =
                        getCategoryIcon(
                            category.name
                        );


                    return (
                        <Button
                            key={
                                category.id
                            }

                            onClick={() => {

                                navigate(
                                    `/catalog?category=${category.id}`
                                );
                            }}

                            className="
                                group
                                relative
                                flex
                                h-35
                                w-full
                                cursor-pointer
                                select-none
                                flex-col
                                justify-between
                                overflow-hidden
                                rounded-2xl
                                border
                                border-transparent
                                bg-[#F4F6FC]
                                p-5
                                text-left
                                transition-all

                                hover:border-[#c7c4d8]
                                hover:shadow-md

                                md:h-62.5
                            "
                        >

                            <div
                                className="
                                    absolute
                                    -right-8
                                    -top-8
                                    h-28
                                    w-28
                                    rounded-full
                                    bg-[#E6E9FA]
                                    opacity-60
                                    duration-300

                                    group-hover:bg-[#c1c6e3]
                                "
                            />


                            <div
                                className="
                                    relative
                                    z-10
                                    flex
                                    h-20
                                    w-20
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white
                                    shadow-sm
                                "
                            >

                                <Icon
                                    icon={
                                        CategoryIcon
                                    }

                                    size={
                                        35
                                    }

                                    className="
                                        text-[#3624C7]
                                    "
                                />

                            </div>


                            <div
                                className="
                                    relative
                                    z-10
                                "
                            >

                                <Typography
                                    text={
                                        category.name
                                    }

                                    className="
                                        mb-0.5
                                        block
                                        text-xl
                                        font-bold
                                        text-[#111115]
                                    "
                                />


                                <Typography
                                    text="Смотреть услуги"

                                    className="
                                        block
                                        text-sm
                                        font-medium
                                        uppercase
                                        tracking-wide
                                        text-[#868695]
                                    "
                                />

                            </div>

                        </Button>
                    );
                }
            )}


            {/* ALL CATEGORIES */}

            <Button
                onClick={() =>
                    navigate(
                        '/catalog'
                    )
                }

                className="
                    relative
                    flex
                    h-35
                    w-full
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#3624C7]
                    p-5
                    transition-all

                    hover:bg-[#2F1FB3]
                    hover:shadow-lg

                    md:h-62.5
                "
            >

                <Icon
                    icon={
                        LayoutGrid
                    }

                    size={
                        35
                    }

                    className="
                        mb-3
                        text-white
                    "
                />


                <Typography
                    text="Все категории"

                    className="
                        block
                        text-xl
                        font-bold
                        text-white
                    "
                />

            </Button>

        </div>
    );
}
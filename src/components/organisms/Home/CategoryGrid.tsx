import {
    ChevronRight
} from 'lucide-react';

import {
    NavLink
} from 'react-router-dom';

import Icon from '../../atoms/Icon';
import Typography from '../../atoms/Typography';

import CategoryCard from '../../molecules/Home/CategoryCard';


export default function CategoryGrid() {

    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-6
                px-4

                md:gap-10
                md:px-12

                lg:px-24
            "
        >

            <div
                className="
                    flex
                    flex-col
                    items-start
                    justify-between
                    gap-4

                    sm:flex-row
                    sm:items-end
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-1

                        md:gap-2
                    "
                >

                    <Typography
                        text="Популярные категории"

                        className="
                            text-2xl
                            font-bold
                            text-[#1A1A24]

                            md:text-3xl
                        "
                    />


                    <Typography
                        text="Выберите услугу из каталога"

                        className="
                            text-sm
                            text-[#6E7191]

                            md:text-lg
                        "
                    />

                </div>


                <NavLink
                    to="/catalog"

                    className="
                        group
                        flex
                        items-center
                        justify-center
                        gap-1
                        pb-1

                        sm:pb-0
                    "
                >

                    <Typography
                        text="Все категории"

                        className="
                            text-sm
                            font-medium
                            text-[#4F46E5]

                            group-hover:underline

                            md:text-base
                        "
                    />


                    <Icon
                        icon={
                            ChevronRight
                        }

                        size={
                            18
                        }

                        className="
                            text-[#4F46E5]
                        "
                    />

                </NavLink>

            </div>


            <div
                className="
                    w-full
                "
            >

                <CategoryCard />

            </div>

        </div>
    );
}
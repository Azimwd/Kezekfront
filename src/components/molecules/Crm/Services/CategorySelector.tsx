import {
    useQuery
} from '@tanstack/react-query';

import Select, {
    type SelectOption
} from '../../../atoms/Select';

import Typography from '../../../atoms/Typography';

import {
    listCategories
} from '../../../../api/categories';


interface CategorySelectorProps {
    value: number | null;

    onChange: (
        categoryId: number | null
    ) => void;
}


export default function CategorySelector({
    value,
    onChange
}: CategorySelectorProps) {

    const {
        data: categoriesResponse,
        isLoading,
        isError
    } = useQuery({

        queryKey: [
            'categories'
        ],

        queryFn:
            listCategories,

        retry:
            false
    });


    const categoryOptions:
        SelectOption[] = [

            {
                id: 0,
                label: 'Без категории'
            },

            ...(
                categoriesResponse?.data ??
                []
            ).map(
                category => ({
                    id:
                        category.id,

                    label:
                        category.name
                })
            )

        ];


    const selectedOption =
        categoryOptions.find(
            option =>
                Number(
                    option.id
                ) ===
                (
                    value ??
                    0
                )
        ) ??
        categoryOptions[0];


    if (
        isLoading
    ) {

        return (
            <div
                className="
                    flex
                    flex-col
                    gap-1.5
                "
            >

                <Typography
                    text="Категория"
                    className="
                        text-sm
                        font-medium
                        text-slate-800
                    "
                />


                <div
                    className="
                        flex
                        h-[46px]
                        items-center
                        rounded-lg
                        border
                        border-[#d6d4e1]
                        bg-[#f8f9ff]
                        px-4
                        text-sm
                        text-slate-500
                    "
                >
                    Загрузка категорий...
                </div>

            </div>
        );
    }


    if (
        isError
    ) {

        return (
            <div
                className="
                    flex
                    flex-col
                    gap-1.5
                "
            >

                <Typography
                    text="Категория"
                    className="
                        text-sm
                        font-medium
                        text-slate-800
                    "
                />


                <div
                    className="
                        rounded-lg
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        text-red-500
                    "
                >
                    Не удалось загрузить категории.
                </div>

            </div>
        );
    }


    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-1.5
            "
        >

            <Typography
                text="Категория"
                className="
                    text-sm
                    font-medium
                    text-slate-800
                "
            />


            <Select
                options={
                    categoryOptions
                }
                value={
                    selectedOption
                }
                onChange={
                    option => {

                        const categoryId =
                            Number(
                                option.id
                            );


                        onChange(
                            categoryId === 0
                                ? null
                                : categoryId
                        );
                    }
                }
                className="
                    w-full
                    rounded-lg
                    border
                    border-[#d6d4e1]
                    bg-[#f8f9ff]
                "
            />

        </div>
    );
}
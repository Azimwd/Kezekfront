import {
    useEffect,
    useMemo
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import Select, {
    type SelectOption
} from '../../../atoms/Select';

import {
    listAllBusinesses
} from '../../../../api/businesses';

import {
    useBusiness
} from '../../../../context/BusinessContext';


export default function BusinessSelect() {

    const {
        selectedBusiness,
        setSelectedBusiness
    } =
        useBusiness();


    /*
     * ============================================================
     * BUSINESSES
     * ============================================================
     */

    const {
        data:
            businesses = [],

        isLoading,

        isError
    } =
        useQuery({

            queryKey: [
                'all-businesses'
            ],

            queryFn:
                listAllBusinesses,

            retry:
                false,

            refetchOnMount:
                'always'
        });


    /*
     * ============================================================
     * OPTIONS
     * ============================================================
     */

    const options =
        useMemo<
            SelectOption[]
        >(
            () => {

                return businesses.map(
                    business => ({
                        id:
                            business.id,

                        label:
                            business.name
                    })
                );

            },
            [
                businesses
            ]
        );


    /*
     * ============================================================
     * SYNC SELECTED BUSINESS
     * ============================================================
     */

    useEffect(
        () => {

            /*
             * Пока список загружается —
             * ничего не меняем.
             */

            if (
                isLoading
            ) {
                return;
            }


            /*
             * Если бизнесов больше нет,
             * обязательно очищаем
             * выбранный бизнес.
             */

            if (
                options.length === 0
            ) {

                if (
                    selectedBusiness
                ) {

                    setSelectedBusiness(
                        null
                    );
                }

                return;
            }


            /*
             * Проверяем, существует ли
             * выбранный бизнес в актуальном
             * списке бизнесов.
             */

            const selectedExists =
                selectedBusiness
                    ? options.some(
                        option =>
                            String(
                                option.id
                            ) ===
                            String(
                                selectedBusiness.id
                            )
                    )
                    : false;


            /*
             * Если выбранного бизнеса
             * больше нет — выбираем первый
             * существующий бизнес.
             */

            if (
                !selectedExists
            ) {

                setSelectedBusiness(
                    options[0]
                );
            }

        },
        [
            options,
            selectedBusiness,
            setSelectedBusiness,
            isLoading
        ]
    );


    /*
     * ============================================================
     * CURRENT VALUE
     * ============================================================
     */

    const value =
        useMemo(
            () => {

                if (
                    options.length === 0
                ) {
                    return null;
                }


                if (
                    !selectedBusiness
                ) {

                    return (
                        options[0] ??
                        null
                    );
                }


                return (
                    options.find(
                        option =>
                            String(
                                option.id
                            ) ===
                            String(
                                selectedBusiness.id
                            )
                    ) ??
                    options[0] ??
                    null
                );

            },
            [
                options,
                selectedBusiness
            ]
        );


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
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[#D9DDEC]
                    bg-[#F7F8FD]
                "
            />
        );
    }


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
                    rounded-xl
                    border
                    border-red-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-red-500
                "
            >
                Не удалось загрузить бизнесы
            </div>
        );
    }


    /*
     * ============================================================
     * EMPTY
     * ============================================================
     */

    if (
        options.length === 0
    ) {

        return (
            <div
                className="
                    rounded-xl
                    border
                    border-[#D9DDEC]
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-500
                "
            >
                Бизнесов нет
            </div>
        );
    }


    /*
     * ============================================================
     * SELECT
     * ============================================================
     */

    return (
        <Select
            options={
                options
            }

            value={
                value!
            }

            onChange={
                option => {

                    setSelectedBusiness({
                        id:
                            option.id,

                        label:
                            option.label
                    });
                }
            }

            className="
                w-full
                min-w-[220px]
                cursor-pointer
                rounded-xl
                border
                border-[#D9DDEC]
            "
        />
    );
}
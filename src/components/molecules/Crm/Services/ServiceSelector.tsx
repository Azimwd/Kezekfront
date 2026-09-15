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

        isLoading
    } =
        useQuery({

            queryKey: [
                'all-businesses'
            ],

            queryFn:
                listAllBusinesses,

            retry:
                false
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
     * AUTO SELECT FIRST BUSINESS
     * ============================================================
     */

    useEffect(
        () => {

            if (
                options.length ===
                0
            ) {
                return;
            }


            /*
             * Если бизнес уже выбран,
             * оставляем его.
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


            if (
                selectedExists
            ) {
                return;
            }


            /*
             * Иначе автоматически
             * выбираем первый бизнес.
             */

            setSelectedBusiness(
                options[0]
            );

        },
        [
            options,
            selectedBusiness,
            setSelectedBusiness
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
     * EMPTY
     * ============================================================
     */

    if (
        options.length ===
        0
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
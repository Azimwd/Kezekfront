import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    useSearchParams
} from 'react-router-dom';

import Select, {
    type SelectOption
} from '../../../../atoms/Select';

import Typography from '../../../../atoms/Typography';

import {
    listAllBusinesses
} from '../../../../../api/businesses';

import {
    getAllMasters
} from '../../../../../api/staff';

import {
    useBusiness
} from '../../../../../context/BusinessContext';


interface ScheduleSelectsProps {
    onStaffSelect: (
        id: number | null
    ) => void;
}


export default function ScheduleSelects({
    onStaffSelect
}: ScheduleSelectsProps) {

    /*
     * ============================================================
     * BUSINESS
     * ============================================================
     */

    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    /*
     * ============================================================
     * SPECIALIST
     * ============================================================
     */

    const [
        selectedSpecialist,
        setSelectedSpecialist
    ] = useState<SelectOption | null>(
        null
    );


    /*
     * ============================================================
     * URL
     * ============================================================
     */

    const [
        searchParams
    ] = useSearchParams();


    const staffIdFromUrl =
        searchParams.get(
            'staff_id'
        );


    /*
     * ============================================================
     * BUSINESSES
     * ============================================================
     */

    const {
        data: businesses = [],
        isPending: isBusinessesPending
    } = useQuery({

        queryKey: [
            'all-businesses'
        ],

        queryFn:
            listAllBusinesses,

        retry:
            false
    });


    const businessOptions =
        useMemo<SelectOption[]>(
            () =>
                businesses.map(
                    business => ({
                        id:
                            business.id,

                        label:
                            business.name
                    })
                ),
            [
                businesses
            ]
        );


    /*
     * ============================================================
     * RESTORE BUSINESS
     * ============================================================
     */

    useEffect(
        () => {

            if (
                businessOptions.length ===
                0
            ) {
                return;
            }


            const savedBusiness =
                selectedBusiness
                    ? businessOptions.find(
                        business =>
                            Number(
                                business.id
                            ) ===
                            Number(
                                selectedBusiness.id
                            )
                    )
                    : null;


            if (
                savedBusiness
            ) {

                if (
                    savedBusiness.label !==
                    selectedBusiness?.label
                ) {

                    setSelectedBusiness(
                        savedBusiness
                    );
                }


                return;
            }


            setSelectedBusiness(
                businessOptions[0]
            );

        },
        [
            businessOptions,
            selectedBusiness,
            setSelectedBusiness
        ]
    );


    const businessId =
        selectedBusiness
            ? Number(
                selectedBusiness.id
            )
            : null;


    /*
     * ============================================================
     * MASTERS
     * ============================================================
     */

    const {
        data: masters = [],
        isPending: isMastersPending
    } = useQuery({

        queryKey: [
            'all-masters',
            businessId
        ],

        queryFn: () =>
            getAllMasters(
                Number(
                    businessId
                )
            ),

        enabled:
            !!businessId,

        retry:
            false
    });


    const specialistOptions =
        useMemo<SelectOption[]>(
            () =>
                masters.map(
                    (master: any) => ({
                        id:
                            master.id,

                        label:
                            `${master.first_name} (${master.position})`
                    })
                ),
            [
                masters
            ]
        );


    /*
     * ============================================================
     * STORAGE KEY
     * ============================================================
     */

    const staffStorageKey =
        businessId
            ? `kezek_selected_staff_${businessId}`
            : null;


    /*
     * ============================================================
     * RESTORE SPECIALIST
     * ============================================================
     */

    useEffect(
        () => {

            if (
                !businessId ||
                specialistOptions.length ===
                    0
            ) {

                setSelectedSpecialist(
                    null
                );

                return;
            }


            /*
             * URL имеет приоритет.
             */

            if (
                staffIdFromUrl
            ) {

                const staffFromUrl =
                    specialistOptions.find(
                        specialist =>
                            Number(
                                specialist.id
                            ) ===
                            Number(
                                staffIdFromUrl
                            )
                    );


                if (
                    staffFromUrl
                ) {

                    setSelectedSpecialist(
                        staffFromUrl
                    );


                    if (
                        staffStorageKey
                    ) {

                        localStorage.setItem(
                            staffStorageKey,
                            String(
                                staffFromUrl.id
                            )
                        );
                    }


                    return;
                }
            }


            /*
             * Восстанавливаем последнего
             * специалиста бизнеса.
             */

            if (
                staffStorageKey
            ) {

                const savedStaffId =
                    localStorage.getItem(
                        staffStorageKey
                    );


                if (
                    savedStaffId
                ) {

                    const savedStaff =
                        specialistOptions.find(
                            specialist =>
                                Number(
                                    specialist.id
                                ) ===
                                Number(
                                    savedStaffId
                                )
                        );


                    if (
                        savedStaff
                    ) {

                        setSelectedSpecialist(
                            savedStaff
                        );

                        return;
                    }
                }
            }


            /*
             * Иначе первый специалист.
             */

            setSelectedSpecialist(
                specialistOptions[0]
            );

        },
        [
            businessId,
            specialistOptions,
            staffIdFromUrl,
            staffStorageKey
        ]
    );


    /*
     * ============================================================
     * CHANGE SPECIALIST
     * ============================================================
     */

    const handleSpecialistChange = (
        specialist: SelectOption
    ) => {

        setSelectedSpecialist(
            specialist
        );


        if (
            staffStorageKey
        ) {

            localStorage.setItem(
                staffStorageKey,
                String(
                    specialist.id
                )
            );
        }
    };


    /*
     * ============================================================
     * CHANGE BUSINESS
     * ============================================================
     */

    const handleBusinessChange = (
        business: SelectOption
    ) => {

        setSelectedBusiness(
            business
        );


        setSelectedSpecialist(
            null
        );


        onStaffSelect(
            null
        );
    };


    /*
     * ============================================================
     * SEND SPECIALIST TO PARENT
     * ============================================================
     */

    useEffect(
        () => {

            if (
                selectedSpecialist?.id
            ) {

                onStaffSelect(
                    Number(
                        selectedSpecialist.id
                    )
                );

            } else {

                onStaffSelect(
                    null
                );
            }

        },
        [
            selectedSpecialist?.id,
            onStaffSelect
        ]
    );


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (
        isBusinessesPending
    ) {

        return (
            <div
                className="
                    w-full
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    p-4
                    text-sm
                    text-slate-500

                    md:w-auto
                "
            >
                Загрузка бизнесов...
            </div>
        );
    }


    /*
     * ============================================================
     * NO BUSINESSES
     * ============================================================
     */

    if (
        businessOptions.length ===
        0
    ) {

        return (
            <div
                className="
                    w-full
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    p-4
                    text-sm
                    text-slate-500

                    md:w-auto
                "
            >
                У вас нет бизнесов
            </div>
        );
    }


    if (
        !selectedBusiness
    ) {

        return (
            <div
                className="
                    w-full
                    text-sm
                    text-slate-500

                    md:w-auto
                "
            >
                Загрузка...
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
                min-w-0
                flex-col
                gap-4
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-white
                p-4

                md:ml-auto
                md:w-fit
                md:flex-row
                md:items-end
                md:gap-3
                md:rounded-3xl
                md:p-3
            "
        >

            {/* =====================================================
                BUSINESS
            ===================================================== */}

            <div
                className="
                    w-full
                    min-w-0

                    md:w-auto
                    md:flex-1
                "
            >

                <Typography
                    text="Бизнес"
                    className="
                        mb-2
                        block
                        text-[13px]
                        font-medium
                        text-[#475569]

                        md:mb-1
                        md:px-3
                        md:text-sm
                    "
                />


                <Select
                    options={
                        businessOptions
                    }
                    value={
                        selectedBusiness
                    }
                    onChange={
                        handleBusinessChange
                    }
                    className="
                        w-full
                        min-w-0

                        md:min-w-[220px]
                    "
                />

            </div>


            {/* =====================================================
                DIVIDER
            ===================================================== */}

            <div
                className="
                    hidden
                    h-8
                    w-px
                    shrink-0
                    bg-gray-200

                    md:mb-3
                    md:block
                "
            />


            {/* =====================================================
                SPECIALIST
            ===================================================== */}

            <div
                className="
                    relative
                    w-full
                    min-w-0

                    md:w-auto
                    md:flex-1
                "
            >

                <Typography
                    text="Специалист"
                    className="
                        mb-2
                        block
                        text-[13px]
                        font-medium
                        text-[#475569]

                        md:mb-1
                        md:px-3
                        md:text-sm
                    "
                />


                <Select
                    options={
                        specialistOptions
                    }
                    value={
                        selectedSpecialist ??
                        {
                            id:
                                0,

                            label:
                                isMastersPending
                                    ? 'Загрузка...'
                                    : 'Нет специалистов'
                        }
                    }
                    onChange={
                        handleSpecialistChange
                    }
                    className={`
                        w-full
                        min-w-0

                        md:min-w-[220px]

                        ${
                            isMastersPending ||
                            specialistOptions.length ===
                                0
                                ? `
                                    pointer-events-none
                                    opacity-50
                                `
                                : ''
                        }
                    `}
                />

            </div>

        </div>
    );
}
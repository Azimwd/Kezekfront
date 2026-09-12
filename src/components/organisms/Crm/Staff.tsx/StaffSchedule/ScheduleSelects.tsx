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
     * Общий бизнес для всей CRM.
     */
    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    /*
     * Выбранный специалист.
     */
    const [
        selectedSpecialist,
        setSelectedSpecialist
    ] = useState<SelectOption | null>(
        null
    );


    /*
     * Например:
     *
     * /crm/schedule?staff_id=4
     */
    const [
        searchParams
    ] = useSearchParams();


    const staffIdFromUrl =
        searchParams.get(
            'staff_id'
        );


    /*
     * Все бизнесы пользователя.
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

        retry: false
    });


    const businessOptions =
        useMemo<SelectOption[]>(
            () =>
                businesses.map(
                    (business) => ({
                        id: business.id,
                        label: business.name
                    })
                ),
            [
                businesses
            ]
        );


    /*
     * Проверяем сохранённый бизнес.
     *
     * Если его больше нет в базе,
     * выбираем первый существующий.
     */
    useEffect(() => {

        if (
            businessOptions.length === 0
        ) {
            return;
        }


        const savedBusiness =
            selectedBusiness
                ? businessOptions.find(
                    (business) =>
                        Number(
                            business.id
                        ) ===
                        Number(
                            selectedBusiness.id
                        )
                )
                : null;


        if (savedBusiness) {

            /*
             * Обновляем также label,
             * если название бизнеса изменилось.
             */
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

    }, [
        businessOptions,
        selectedBusiness,
        setSelectedBusiness
    ]);


    const businessId =
        selectedBusiness
            ? Number(
                selectedBusiness.id
            )
            : null;


    /*
     * Получаем ВСЕХ специалистов
     * выбранного бизнеса.
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

        retry: false
    });


    const specialistOptions =
        useMemo<SelectOption[]>(
            () =>
                masters.map(
                    (master: any) => ({
                        id: master.id,

                        label:
                            `${master.first_name} (${master.position})`
                    })
                ),
            [
                masters
            ]
        );


    /*
     * Для каждого бизнеса свой
     * сохранённый специалист.
     *
     * Например:
     *
     * kezek_selected_staff_3
     * kezek_selected_staff_7
     */
    const staffStorageKey =
        businessId
            ? `kezek_selected_staff_${businessId}`
            : null;


    /*
     * Восстанавливаем специалиста
     * после загрузки списка.
     */
    useEffect(() => {

        if (
            !businessId ||
            specialistOptions.length === 0
        ) {
            setSelectedSpecialist(
                null
            );

            return;
        }


        /*
         * Если пришли со страницы сотрудника:
         *
         * /crm/schedule?staff_id=4
         *
         * staff_id имеет приоритет.
         */
        if (staffIdFromUrl) {

            const staffFromUrl =
                specialistOptions.find(
                    (specialist) =>
                        Number(
                            specialist.id
                        ) ===
                        Number(
                            staffIdFromUrl
                        )
                );


            if (staffFromUrl) {

                setSelectedSpecialist(
                    staffFromUrl
                );


                if (staffStorageKey) {
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
         * Если staff_id в URL нет,
         * восстанавливаем последнего
         * выбранного специалиста.
         */
        if (staffStorageKey) {

            const savedStaffId =
                localStorage.getItem(
                    staffStorageKey
                );


            if (savedStaffId) {

                const savedStaff =
                    specialistOptions.find(
                        (specialist) =>
                            Number(
                                specialist.id
                            ) ===
                            Number(
                                savedStaffId
                            )
                    );


                if (savedStaff) {

                    setSelectedSpecialist(
                        savedStaff
                    );

                    return;
                }
            }
        }


        /*
         * Если ничего не сохранено —
         * выбираем первого.
         */
        setSelectedSpecialist(
            specialistOptions[0]
        );

    }, [
        businessId,
        specialistOptions,
        staffIdFromUrl,
        staffStorageKey
    ]);


    /*
     * Сохраняем специалиста
     * при ручном выборе.
     */
    const handleSpecialistChange = (
        specialist: SelectOption
    ) => {

        setSelectedSpecialist(
            specialist
        );


        if (staffStorageKey) {

            localStorage.setItem(
                staffStorageKey,
                String(
                    specialist.id
                )
            );
        }
    };


    /*
     * При выборе бизнеса меняем
     * общий BusinessContext.
     */
    const handleBusinessChange = (
        business: SelectOption
    ) => {

        setSelectedBusiness(
            business
        );


        /*
         * Временно очищаем специалиста.
         *
         * После загрузки специалистов
         * нового бизнеса useEffect выше
         * восстановит его последнее значение.
         */
        setSelectedSpecialist(
            null
        );


        onStaffSelect(
            null
        );
    };


    /*
     * Сообщаем родителю выбранного
     * специалиста.
     */
    useEffect(() => {

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

    }, [
        selectedSpecialist?.id,
        onStaffSelect
    ]);


    if (
        isBusinessesPending
    ) {
        return (
            <div className="text-sm text-slate-500">
                Загрузка бизнесов...
            </div>
        );
    }


    if (
        businessOptions.length === 0
    ) {
        return (
            <div className="text-sm text-slate-500">
                У вас нет бизнесов
            </div>
        );
    }


    if (
        !selectedBusiness
    ) {
        return (
            <div className="text-sm text-slate-500">
                Загрузка...
            </div>
        );
    }


    return (
        <div
            className="
                flex
                w-fit
                items-end
                gap-3
                rounded-3xl
                border
                border-[#c7c4d8]
                bg-white
                p-3
            "
        >

            {/* BUSINESS */}

            <div className="flex-1">

                <Typography
                    text="Бизнес"
                    className="
                        mb-1
                        px-3
                        text-sm
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
                        min-w-[220px]
                    "
                />

            </div>


            <div
                className="
                    mb-3
                    h-8
                    w-px
                    bg-gray-200
                "
            />


            {/* SPECIALIST */}

            <div className="relative flex-1">

                <Typography
                    text="Специалист"
                    className="
                        mb-1
                        px-3
                        text-sm
                    "
                />


                <Select
                    options={
                        specialistOptions
                    }
                    value={
                        selectedSpecialist ??
                        {
                            id: 0,

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
                        min-w-[220px]

                        ${
                            isMastersPending ||
                            specialistOptions.length === 0
                                ? 'pointer-events-none opacity-50'
                                : ''
                        }
                    `}
                />


                {isMastersPending && (
                    <span
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            mt-2
                            -translate-x-1/2
                            text-xs
                            text-gray-500
                        "
                    >
                        Загрузка...
                    </span>
                )}

            </div>

        </div>
    );
}
import React, {
    useEffect,
    useState
} from 'react';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import {
    CircleAlert,
    Pencil,
    Plus,
    Trash2
} from 'lucide-react';

import Button from '../../../atoms/Button';
import Typography from '../../../atoms/Typography';
import Icon from '../../../atoms/Icon';
import Input from '../../../atoms/Input';

import SidePage from '../../../organisms/SidePage';

import {
    editService,
    putStaffToService,
    getAssignedStaffForService,
    listServiceAddons,
    createServiceAddon,
    editServiceAddon,
    deleteServiceAddon,
    type ServiceAddonItem,
    type ServiceAddonPayload,
    type ServiceItem
} from '../../../../api/services';

import {
    useBusiness
} from '../../../../context/BusinessContext';

import SpecialistsList from './SpecialistsList';
import CategorySelector from './CategorySelector';

import {
    getApiErrorMessage
} from '../../../../utils/getApiErrorMessage';


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

interface EditServiceProps {
    service: ServiceItem;
}


interface AddonDraft {
    id?: number;

    tempId: string;

    name: string;
    description: string;

    price: string;
    duration_minutes: number;

    is_active: boolean;
}


/*
 * ============================================================
 * ADDON HELPERS
 * ============================================================
 */

const createEmptyAddon =
    (): AddonDraft => ({

        tempId:
            `${Date.now()}-${Math.random()}`,

        name: '',

        description: '',

        price: '',

        duration_minutes: 0,

        is_active: true
    });


const serviceAddonToDraft = (
    addon: ServiceAddonItem
): AddonDraft => ({

    id:
        addon.id,

    tempId:
        `existing-${addon.id}`,

    name:
        addon.name ?? '',

    description:
        addon.description ?? '',

    price:
        String(
            addon.price ?? ''
        ),

    duration_minutes:
        Number(
            addon.duration_minutes ?? 0
        ),

    is_active:
        addon.is_active ?? true
});


export default function EditService({
    service
}: EditServiceProps) {

    /*
     * ============================================================
     * BASIC
     * ============================================================
     */

    const [
        isOpen,
        setIsOpen
    ] = useState(false);


    const queryClient =
        useQueryClient();


    const {
        selectedBusiness
    } = useBusiness();


    /*
     * ============================================================
     * FORM
     * ============================================================
     */

    const [
        name,
        setName
    ] = useState(
        service.name || ''
    );


    const [
        description,
        setDescription
    ] = useState(
        service.description || ''
    );


    const [
        price,
        setPrice
    ] = useState<string>(
        String(
            service.price ?? ''
        )
    );


    const [
        duration,
        setDuration
    ] = useState(
        service.duration_minutes ?? 0
    );


    const [
        bufferBefore,
        setBufferBefore
    ] = useState(
        service.buffer_before_minutes ?? 0
    );


    const [
        bufferAfter,
        setBufferAfter
    ] = useState(
        service.buffer_after_minutes ?? 0
    );


    const [
        isActive,
        setIsActive
    ] = useState(
        service.is_active ?? true
    );


    /*
     * ============================================================
     * CATEGORY
     * ============================================================
     */

    const [
        selectedCategoryId,
        setSelectedCategoryId
    ] = useState<number | null>(
        service.category ?? null
    );


    /*
     * ============================================================
     * STAFF
     * ============================================================
     */

    const [
        selectedStaffIds,
        setSelectedStaffIds
    ] = useState<number[]>(
        service.staff_ids || []
    );


    /*
     * ============================================================
     * ADDONS
     * ============================================================
     */

    const [
        addons,
        setAddons
    ] = useState<AddonDraft[]>(
        (service.addons || []).map(
            serviceAddonToDraft
        )
    );


    const [
        deletedAddonIds,
        setDeletedAddonIds
    ] = useState<number[]>([]);


    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    const [
        errorMessage,
        setErrorMessage
    ] = useState('');


    /*
     * ============================================================
     * INPUT HELPERS
     * ============================================================
     */

    const handleIntegerChange = (
        value: string,
        setter: React.Dispatch<
            React.SetStateAction<number>
        >
    ) => {

        if (
            !/^\d*$/.test(
                value
            )
        ) {
            return;
        }


        if (
            value === ''
        ) {
            setter(0);
            return;
        }


        setter(
            Number(value)
        );
    };


    const handlePriceChange = (
        value: string
    ) => {

        if (
            !/^\d*[.,]?\d{0,2}$/.test(
                value
            )
        ) {
            return;
        }


        setPrice(
            value.replace(
                ',',
                '.'
            )
        );
    };


    /*
     * ============================================================
     * ASSIGNED STAFF
     * ============================================================
     */

    const {
        data: assignedStaffData,
        isFetching: isAssignedLoading
    } = useQuery({

        queryKey: [
            'assignedStaff',
            service.id
        ],

        queryFn: () =>
            getAssignedStaffForService(
                service.id
            ),

        enabled:
            isOpen
    });


    useEffect(
        () => {

            if (
                assignedStaffData?.data
            ) {

                const ids =
                    assignedStaffData.data.map(
                        (
                            staff: any
                        ) =>
                            staff.id
                    );


                setSelectedStaffIds(
                    ids
                );
            }

        },
        [
            assignedStaffData
        ]
    );


    /*
     * ============================================================
     * SERVICE ADDONS
     * ============================================================
     */

    const {
        data: serviceAddons,
        isFetching: isAddonsLoading
    } = useQuery({

        queryKey: [
            'service-addons',
            service.id
        ],

        queryFn: () =>
            listServiceAddons(
                service.id
            ),

        enabled:
            isOpen
    });


    useEffect(
        () => {

            if (
                !serviceAddons
            ) {
                return;
            }


            setAddons(
                serviceAddons.map(
                    serviceAddonToDraft
                )
            );


            setDeletedAddonIds(
                []
            );

        },
        [
            serviceAddons
        ]
    );


    /*
     * ============================================================
     * ADDON ACTIONS
     * ============================================================
     */

    const handleAddAddon = () => {

        setAddons(
            current => [
                ...current,
                createEmptyAddon()
            ]
        );
    };


    const handleRemoveAddon = (
        addon: AddonDraft
    ) => {

        if (
            addon.id !== undefined
        ) {

            setDeletedAddonIds(
                current => {

                    if (
                        current.includes(
                            addon.id!
                        )
                    ) {
                        return current;
                    }


                    return [
                        ...current,
                        addon.id!
                    ];
                }
            );
        }


        setAddons(
            current =>
                current.filter(
                    item =>
                        item.tempId !==
                        addon.tempId
                )
        );
    };


    const updateAddon = (
        tempId: string,
        changes: Partial<AddonDraft>
    ) => {

        setAddons(
            current =>
                current.map(
                    addon => {

                        if (
                            addon.tempId !==
                            tempId
                        ) {
                            return addon;
                        }


                        return {
                            ...addon,
                            ...changes
                        };
                    }
                )
        );
    };


    const handleAddonPriceChange = (
        tempId: string,
        value: string
    ) => {

        if (
            !/^\d*[.,]?\d{0,2}$/.test(
                value
            )
        ) {
            return;
        }


        updateAddon(
            tempId,
            {
                price:
                    value.replace(
                        ',',
                        '.'
                    )
            }
        );
    };


    const handleAddonDurationChange = (
        tempId: string,
        value: string
    ) => {

        if (
            !/^\d*$/.test(
                value
            )
        ) {
            return;
        }


        updateAddon(
            tempId,
            {
                duration_minutes:
                    value === ''
                        ? 0
                        : Number(
                            value
                        )
            }
        );
    };


    /*
     * ============================================================
     * OPEN / CLOSE
     * ============================================================
     */

    const handleOpen = () => {

        setName(
            service.name || ''
        );


        setDescription(
            service.description || ''
        );


        setPrice(
            String(
                service.price ?? ''
            )
        );


        setDuration(
            service.duration_minutes ?? 0
        );


        setBufferBefore(
            service.buffer_before_minutes ?? 0
        );


        setBufferAfter(
            service.buffer_after_minutes ?? 0
        );


        setIsActive(
            service.is_active ?? true
        );


        setSelectedCategoryId(
            service.category ?? null
        );


        setSelectedStaffIds(
            service.staff_ids || []
        );


        setAddons(
            (service.addons || []).map(
                serviceAddonToDraft
            )
        );


        setDeletedAddonIds(
            []
        );


        setErrorMessage(
            ''
        );


        setIsOpen(
            true
        );
    };


    const handleClose = () => {

        setErrorMessage(
            ''
        );


        setDeletedAddonIds(
            []
        );


        setIsOpen(
            false
        );
    };


    /*
     * ============================================================
     * EDIT
     * ============================================================
     */

    const editMutation =
        useMutation({

            mutationFn:
                async () => {

                    /*
                     * ================================================
                     * 1. MAIN SERVICE
                     * ================================================
                     */

                    await editService(
                        service.id,
                        selectedCategoryId,
                        name.trim(),
                        description.trim(),
                        Number(price),
                        Number(duration),
                        Number(bufferBefore),
                        Number(bufferAfter),
                        isActive
                    );


                    /*
                     * ================================================
                     * 2. STAFF
                     * ================================================
                     */

                    await putStaffToService(
                        service.id,
                        selectedStaffIds
                    );


                    /*
                     * ================================================
                     * 3. ADDONS
                     * ================================================
                     */

                    const addonTasks:
                        Promise<unknown>[] = [];


                    for (
                        const addon
                        of addons
                    ) {

                        const payload:
                            ServiceAddonPayload = {

                                name:
                                    addon.name.trim(),

                                description:
                                    addon.description.trim(),

                                price:
                                    Number(
                                        addon.price
                                    ),

                                duration_minutes:
                                    Number(
                                        addon.duration_minutes
                                    ),

                                is_active:
                                    addon.is_active
                            };


                        if (
                            addon.id !== undefined
                        ) {

                            addonTasks.push(
                                editServiceAddon(
                                    addon.id,
                                    payload
                                )
                            );
                        }
                        else {

                            addonTasks.push(
                                createServiceAddon(
                                    service.id,
                                    payload
                                )
                            );
                        }
                    }


                    /*
                     * ================================================
                     * 4. DELETED ADDONS
                     * ================================================
                     */

                    for (
                        const addonId
                        of deletedAddonIds
                    ) {

                        addonTasks.push(
                            deleteServiceAddon(
                                addonId
                            )
                        );
                    }


                    await Promise.all(
                        addonTasks
                    );
                },


            onMutate: () => {

                setErrorMessage(
                    ''
                );
            },


            onSuccess:
                async () => {

                    await Promise.all([

                        queryClient.invalidateQueries({
                            queryKey: [
                                'services',
                                selectedBusiness?.id
                            ]
                        }),

                        queryClient.invalidateQueries({
                            queryKey: [
                                'service-addons',
                                service.id
                            ]
                        }),

                        queryClient.invalidateQueries({
                            queryKey: [
                                'assignedStaff',
                                service.id
                            ]
                        }),

                        queryClient.invalidateQueries({
                            queryKey: [
                                'booking-services',
                                Number(
                                    selectedBusiness?.id
                                )
                            ]
                        })
                    ]);


                    setDeletedAddonIds(
                        []
                    );


                    setIsOpen(
                        false
                    );
                },


            onError:
                (
                    error
                ) => {

                    console.error(
                        'Ошибка при редактировании:',
                        error
                    );


                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Не удалось сохранить изменения.'
                        )
                    );
                }
        });


    /*
     * ============================================================
     * SUBMIT
     * ============================================================
     */

    const handleSubmit = (
        e: React.FormEvent
    ) => {

        e.preventDefault();


        setErrorMessage(
            ''
        );


        if (
            !name.trim()
        ) {

            setErrorMessage(
                'Введите название услуги.'
            );

            return;
        }


        if (
            String(price).trim() === ''
        ) {

            setErrorMessage(
                'Введите цену услуги.'
            );

            return;
        }


        if (
            Number(price) < 0
        ) {

            setErrorMessage(
                'Цена не может быть отрицательной.'
            );

            return;
        }


        if (
            Number(duration) <= 0
        ) {

            setErrorMessage(
                'Длительность услуги должна быть больше 0 минут.'
            );

            return;
        }


        if (
            Number(bufferBefore) < 0 ||
            Number(bufferAfter) < 0
        ) {

            setErrorMessage(
                'Буфер услуги не может быть отрицательным.'
            );

            return;
        }


        /*
         * ========================================================
         * ADDONS VALIDATION
         * ========================================================
         */

        for (
            const addon
            of addons
        ) {

            if (
                !addon.name.trim()
            ) {

                setErrorMessage(
                    'Введите название каждой дополнительной услуги.'
                );

                return;
            }


            if (
                String(
                    addon.price
                ).trim() === ''
            ) {

                setErrorMessage(
                    `Введите цену дополнительной услуги «${addon.name}».`
                );

                return;
            }


            if (
                Number(
                    addon.price
                ) < 0
            ) {

                setErrorMessage(
                    `Цена «${addon.name}» не может быть отрицательной.`
                );

                return;
            }


            if (
                Number(
                    addon.duration_minutes
                ) < 0
            ) {

                setErrorMessage(
                    `Длительность «${addon.name}» не может быть отрицательной.`
                );

                return;
            }
        }


        const normalizedAddonNames =
            addons.map(
                addon =>
                    addon
                        .name
                        .trim()
                        .toLowerCase()
            );


        const uniqueAddonNames =
            new Set(
                normalizedAddonNames
            );


        if (
            uniqueAddonNames.size !==
            normalizedAddonNames.length
        ) {

            setErrorMessage(
                'Дополнительные услуги не могут иметь одинаковые названия.'
            );

            return;
        }


        editMutation.mutate();
    };


    /*
     * ============================================================
     * BUSINESS
     * ============================================================
     */

    if (
        !selectedBusiness
    ) {

        return (
            <div>
                Пожалуйста, выберите бизнес из списка сверху...
            </div>
        );
    }


    const businessesId =
        Number(
            selectedBusiness.id
        );


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <>

            {/* =====================================================
                EDIT BUTTON
            ===================================================== */}

            <Button
                className="
                    cursor-pointer
                    text-slate-500
                    transition-colors
                    hover:text-indigo-600
                "
                onClick={
                    handleOpen
                }
            >

                <Icon
                    icon={
                        Pencil
                    }
                    size={
                        20
                    }
                />

            </Button>


            {/* =====================================================
                SIDE PAGE
            ===================================================== */}

            <SidePage
                isOpen={
                    isOpen
                }
                onClose={
                    handleClose
                }
                title="Редактировать услугу"
                description="Редактируйте услугу и дополнительные услуги для выбранного бизнеса"
            >

                <form
                    className="
                        flex
                        h-full
                        flex-col
                    "
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div
                        className="
                            flex
                            flex-1
                            flex-col
                            gap-6
                        "
                    >

                        {/* =================================================
                            BUSINESS INFO
                        ================================================= */}

                        <div
                            className="
                                flex
                                items-center
                                justify-start
                                gap-4
                                rounded-xl
                                border
                                border-[#c7c4d8]
                                bg-[#eff4ff]
                                px-4
                                py-2
                            "
                        >

                            <div>

                                <Icon
                                    icon={
                                        CircleAlert
                                    }
                                    className="
                                        text-[#4F46E5]
                                    "
                                />

                            </div>


                            <div
                                className="
                                    flex
                                    flex-col
                                "
                            >

                                <Typography
                                    className="
                                        text-md
                                        font-medium
                                        tracking-normal
                                    "
                                    text={
                                        `Бизнес: ${
                                            selectedBusiness.label ||
                                            'Выберите бизнес.'
                                        }`
                                    }
                                />


                                <Typography
                                    className="
                                        text-sm
                                        text-gray-700
                                    "
                                    text="Услуга будет обновлена только для этого бизнеса"
                                />

                            </div>

                        </div>


                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {errorMessage && (

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-3
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-red-700
                                "
                            >

                                <CircleAlert
                                    size={19}
                                    className="
                                        mt-0.5
                                        shrink-0
                                        text-red-500
                                    "
                                />


                                <div
                                    className="
                                        whitespace-pre-line
                                        leading-5
                                    "
                                >
                                    {errorMessage}
                                </div>

                            </div>

                        )}


                        {/* =================================================
                            NAME
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-1.5
                            "
                        >

                            <Typography
                                className="
                                    text-sm
                                    font-medium
                                    text-slate-800
                                "
                                text="Название услуги"
                            />


                            <Input
                                type="text"
                                value={
                                    name
                                }
                                placeholder="Мужская стрижка"
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-[#d6d4e1]
                                    bg-[#f8f9ff]
                                    px-4
                                    py-3
                                    font-normal
                                    text-slate-900
                                    focus:border-[#5955e8]
                                    focus:outline-none
                                    focus:ring
                                    focus:ring-[#5955e8]
                                "
                                onChange={
                                    e =>
                                        setName(
                                            e.target.value
                                        )
                                }
                            />

                        </div>


                        {/* =================================================
                            CATEGORY
                        ================================================= */}

                        <CategorySelector
                            value={
                                selectedCategoryId
                            }
                            onChange={
                                setSelectedCategoryId
                            }
                        />


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-1.5
                            "
                        >

                            <Typography
                                className="
                                    text-sm
                                    font-medium
                                    text-slate-800
                                "
                                text="Описание"
                            />


                            <textarea
                                rows={3}
                                value={
                                    description
                                }
                                placeholder="Опишите услугу"
                                className="
                                    w-full
                                    resize-none
                                    rounded-lg
                                    border
                                    border-[#d6d4e1]
                                    bg-[#f8f9ff]
                                    px-4
                                    py-3
                                    text-slate-900
                                    placeholder:font-medium
                                    placeholder:text-[#858585]
                                    focus:border-[#5955e8]
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[#5955e8]
                                "
                                onChange={
                                    e =>
                                        setDescription(
                                            e.target.value
                                        )
                                }
                            />

                        </div>


                        {/* =================================================
                            NUMBERS
                        ================================================= */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-5
                                sm:grid-cols-2
                            "
                        >

                            {/* PRICE */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                            >

                                <Typography
                                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                                    text="Цена"
                                />


                                <div
                                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                                >

                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={
                                            price
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-10
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                                        placeholder="0"
                                        onChange={
                                            e =>
                                                handlePriceChange(
                                                    e.target.value
                                                )
                                        }
                                    />


                                    <span
                                        className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        ₸
                                    </span>

                                </div>

                            </div>


                            {/* DURATION */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                            >

                                <Typography
                                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                                    text="Длительность"
                                />


                                <div
                                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                                >

                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            duration
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-12
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                                        placeholder="0"
                                        onChange={
                                            e =>
                                                handleIntegerChange(
                                                    e.target.value,
                                                    setDuration
                                                )
                                        }
                                    />


                                    <span
                                        className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        мин
                                    </span>

                                </div>

                            </div>


                            {/* BUFFER BEFORE */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                            >

                                <Typography
                                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                                    text="Буфер до услуги"
                                />


                                <div
                                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                                >

                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            bufferBefore
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-12
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                                        placeholder="0"
                                        onChange={
                                            e =>
                                                handleIntegerChange(
                                                    e.target.value,
                                                    setBufferBefore
                                                )
                                        }
                                    />


                                    <span
                                        className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        мин
                                    </span>

                                </div>

                            </div>


                            {/* BUFFER AFTER */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-1.5
                                "
                            >

                                <Typography
                                    className="
                                        text-sm
                                        font-medium
                                        text-slate-800
                                    "
                                    text="Буфер после услуги"
                                />


                                <div
                                    className="
                                        relative
                                        flex
                                        items-center
                                    "
                                >

                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            bufferAfter
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-[#d6d4e1]
                                            bg-[#f8f9ff]
                                            py-3
                                            pl-4
                                            pr-12
                                            font-normal
                                            text-slate-900
                                            focus:border-[#5955e8]
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-[#5955e8]
                                        "
                                        placeholder="0"
                                        onChange={
                                            e =>
                                                handleIntegerChange(
                                                    e.target.value,
                                                    setBufferAfter
                                                )
                                        }
                                    />


                                    <span
                                        className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        мин
                                    </span>

                                </div>

                            </div>

                        </div>


                        <hr
                            className="
                                mb-1
                                mt-2
                                border-t
                                border-[#f0f0f5]
                            "
                        />


                        {/* =================================================
                            ADDONS
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-1
                                    "
                                >

                                    <Typography
                                        text="Дополнительные услуги"
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                        "
                                    />


                                    <Typography
                                        text="Клиент сможет выбрать их дополнительно к основной услуге"
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    />

                                </div>


                                <Button
                                    type="button"
                                    onClick={
                                        handleAddAddon
                                    }
                                    className="
                                        flex
                                        shrink-0
                                        items-center
                                        gap-2
                                        rounded-lg
                                        border
                                        border-[#c7c4d8]
                                        bg-white
                                        px-3
                                        py-2
                                        transition-colors
                                        hover:bg-slate-50
                                    "
                                >

                                    <Icon
                                        icon={
                                            Plus
                                        }
                                        size={17}
                                        className="
                                            text-[#4F46E5]
                                        "
                                    />


                                    <Typography
                                        text="Добавить"
                                        className="
                                            text-sm
                                            font-medium
                                            text-[#4F46E5]
                                        "
                                    />

                                </Button>

                            </div>


                            {isAddonsLoading ? (

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-[#d6d4e1]
                                        bg-[#f8f9ff]
                                        px-4
                                        py-5
                                        text-center
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Загрузка дополнительных услуг...
                                </div>

                            ) : addons.length === 0 ? (

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-dashed
                                        border-[#d6d4e1]
                                        bg-[#f8f9ff]
                                        px-4
                                        py-5
                                        text-center
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Дополнительных услуг пока нет
                                </div>

                            ) : (

                                addons.map(
                                    (
                                        addon,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                addon.tempId
                                            }
                                            className="
                                                flex
                                                flex-col
                                                gap-4
                                                rounded-xl
                                                border
                                                border-[#d6d4e1]
                                                bg-white
                                                p-4
                                            "
                                        >

                                            {/* HEADER */}

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <Typography
                                                    text={
                                                        `Доп. услуга ${index + 1}`
                                                    }
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-slate-800
                                                    "
                                                />


                                                <button
                                                    type="button"
                                                    onClick={
                                                        () =>
                                                            handleRemoveAddon(
                                                                addon
                                                            )
                                                    }
                                                    className="
                                                        flex
                                                        h-9
                                                        w-9
                                                        cursor-pointer
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        text-red-500
                                                        transition-colors
                                                        hover:bg-red-50
                                                    "
                                                >

                                                    <Trash2
                                                        size={18}
                                                    />

                                                </button>

                                            </div>


                                            {/* NAME */}

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-1.5
                                                "
                                            >

                                                <Typography
                                                    text="Название"
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                    "
                                                />


                                                <Input
                                                    type="text"
                                                    value={
                                                        addon.name
                                                    }
                                                    placeholder="Например: Снятие покрытия"
                                                    className="
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-[#d6d4e1]
                                                        bg-[#f8f9ff]
                                                        px-4
                                                        py-3
                                                        text-slate-900
                                                        focus:border-[#5955e8]
                                                        focus:outline-none
                                                        focus:ring-1
                                                        focus:ring-[#5955e8]
                                                    "
                                                    onChange={
                                                        e =>
                                                            updateAddon(
                                                                addon.tempId,
                                                                {
                                                                    name:
                                                                        e.target.value
                                                                }
                                                            )
                                                    }
                                                />

                                            </div>


                                            {/* DESCRIPTION */}

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-1.5
                                                "
                                            >

                                                <Typography
                                                    text="Описание"
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                    "
                                                />


                                                <textarea
                                                    rows={2}
                                                    value={
                                                        addon.description
                                                    }
                                                    placeholder="Описание дополнительной услуги"
                                                    className="
                                                        w-full
                                                        resize-none
                                                        rounded-lg
                                                        border
                                                        border-[#d6d4e1]
                                                        bg-[#f8f9ff]
                                                        px-4
                                                        py-3
                                                        text-slate-900
                                                        focus:border-[#5955e8]
                                                        focus:outline-none
                                                        focus:ring-1
                                                        focus:ring-[#5955e8]
                                                    "
                                                    onChange={
                                                        e =>
                                                            updateAddon(
                                                                addon.tempId,
                                                                {
                                                                    description:
                                                                        e.target.value
                                                                }
                                                            )
                                                    }
                                                />

                                            </div>


                                            {/* PRICE / DURATION */}

                                            <div
                                                className="
                                                    grid
                                                    grid-cols-1
                                                    gap-4
                                                    sm:grid-cols-2
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        flex-col
                                                        gap-1.5
                                                    "
                                                >

                                                    <Typography
                                                        text="Доп. цена"
                                                        className="
                                                            text-sm
                                                            font-medium
                                                            text-slate-800
                                                        "
                                                    />


                                                    <div
                                                        className="
                                                            relative
                                                            flex
                                                            items-center
                                                        "
                                                    >

                                                        <Input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={
                                                                addon.price
                                                            }
                                                            placeholder="0"
                                                            className="
                                                                w-full
                                                                rounded-lg
                                                                border
                                                                border-[#d6d4e1]
                                                                bg-[#f8f9ff]
                                                                py-3
                                                                pl-4
                                                                pr-10
                                                                text-slate-900
                                                                focus:border-[#5955e8]
                                                                focus:outline-none
                                                                focus:ring-1
                                                                focus:ring-[#5955e8]
                                                            "
                                                            onChange={
                                                                e =>
                                                                    handleAddonPriceChange(
                                                                        addon.tempId,
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />


                                                        <span
                                                            className="
                                                                pointer-events-none
                                                                absolute
                                                                right-4
                                                                text-sm
                                                                text-slate-500
                                                            "
                                                        >
                                                            ₸
                                                        </span>

                                                    </div>

                                                </div>


                                                <div
                                                    className="
                                                        flex
                                                        flex-col
                                                        gap-1.5
                                                    "
                                                >

                                                    <Typography
                                                        text="Доп. время"
                                                        className="
                                                            text-sm
                                                            font-medium
                                                            text-slate-800
                                                        "
                                                    />


                                                    <div
                                                        className="
                                                            relative
                                                            flex
                                                            items-center
                                                        "
                                                    >

                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={
                                                                addon.duration_minutes
                                                            }
                                                            placeholder="0"
                                                            className="
                                                                w-full
                                                                rounded-lg
                                                                border
                                                                border-[#d6d4e1]
                                                                bg-[#f8f9ff]
                                                                py-3
                                                                pl-4
                                                                pr-12
                                                                text-slate-900
                                                                focus:border-[#5955e8]
                                                                focus:outline-none
                                                                focus:ring-1
                                                                focus:ring-[#5955e8]
                                                            "
                                                            onChange={
                                                                e =>
                                                                    handleAddonDurationChange(
                                                                        addon.tempId,
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />


                                                        <span
                                                            className="
                                                                pointer-events-none
                                                                absolute
                                                                right-4
                                                                text-sm
                                                                text-slate-500
                                                            "
                                                        >
                                                            мин
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* ACTIVE */}

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                "
                                            >

                                                <Typography
                                                    text="Доп. услуга активна"
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                    "
                                                />


                                                <label
                                                    className="
                                                        relative
                                                        inline-flex
                                                        cursor-pointer
                                                        items-center
                                                    "
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            addon.is_active
                                                        }
                                                        onChange={
                                                            e =>
                                                                updateAddon(
                                                                    addon.tempId,
                                                                    {
                                                                        is_active:
                                                                            e.target.checked
                                                                    }
                                                                )
                                                        }
                                                        className="
                                                            peer
                                                            sr-only
                                                        "
                                                    />


                                                    <div
                                                        className="
                                                            peer
                                                            h-6
                                                            w-11
                                                            rounded-full
                                                            bg-gray-200
                                                            after:absolute
                                                            after:left-0.5
                                                            after:top-0.5
                                                            after:h-5
                                                            after:w-5
                                                            after:rounded-full
                                                            after:border
                                                            after:border-gray-300
                                                            after:bg-white
                                                            after:content-['']
                                                            after:transition-all
                                                            peer-checked:bg-[#5955e8]
                                                            peer-checked:after:translate-x-full
                                                            peer-checked:after:border-white
                                                        "
                                                    />

                                                </label>

                                            </div>

                                        </div>
                                    )
                                )

                            )}

                        </div>


                        <hr
                            className="
                                mb-1
                                mt-2
                                border-t
                                border-[#f0f0f5]
                            "
                        />


                        {/* =================================================
                            ACTIVE
                        ================================================= */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <Typography
                                className="
                                    text-sm
                                    font-medium
                                    text-slate-800
                                "
                                text="Услуга активна"
                            />


                            <label
                                className="
                                    relative
                                    inline-flex
                                    cursor-pointer
                                    items-center
                                "
                            >

                                <input
                                    type="checkbox"
                                    checked={
                                        isActive
                                    }
                                    onChange={
                                        e =>
                                            setIsActive(
                                                e.target.checked
                                            )
                                    }
                                    className="
                                        peer
                                        sr-only
                                    "
                                />


                                <div
                                    className="
                                        peer
                                        h-6
                                        w-11
                                        rounded-full
                                        bg-gray-200
                                        after:absolute
                                        after:left-0.5
                                        after:top-0.5
                                        after:h-5
                                        after:w-5
                                        after:rounded-full
                                        after:border
                                        after:border-gray-300
                                        after:bg-white
                                        after:content-['']
                                        after:transition-all
                                        peer-checked:bg-[#5955e8]
                                        peer-checked:after:translate-x-full
                                        peer-checked:after:border-white
                                    "
                                />

                            </label>

                        </div>

                    </div>


                    {/* =====================================================
                        STAFF
                    ===================================================== */}

                    <div
                        className="
                            mt-10
                            flex
                            w-full
                            items-center
                            justify-start
                            gap-5
                        "
                    >

                        {isAssignedLoading ? (

                            <Typography
                                text="Загрузка привязанных мастеров..."
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            />

                        ) : (

                            <SpecialistsList
                                businessId={
                                    businessesId
                                }
                                selectedIds={
                                    selectedStaffIds
                                }
                                onChangeSelected={
                                    setSelectedStaffIds
                                }
                            />

                        )}

                    </div>


                    {/* =====================================================
                        FOOTER
                    ===================================================== */}

                    <div
                        className="
                            sticky
                            bottom-0
                            z-10
                            -mx-6
                            -mb-6
                            mt-8
                            flex
                            items-center
                            justify-end
                            gap-3
                            border-t
                            border-[#f0f0f5]
                            bg-white
                            px-6
                            pb-8
                            pt-5
                        "
                    >

                        <Button
                            type="button"
                            onClick={
                                handleClose
                            }
                            className="
                                rounded-xl
                                border
                                border-[#c7c4d8]
                                bg-white
                                px-6
                                py-2.5
                                transition-colors
                                hover:bg-slate-50
                            "
                        >

                            <Typography
                                text="Отмена"
                                className="
                                    whitespace-nowrap
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            />

                        </Button>


                        <Button
                            type="submit"
                            disabled={
                                editMutation.isPending
                            }
                            className="
                                rounded-xl
                                bg-[#4F46E5]
                                px-6
                                py-2.5
                                shadow-sm
                                transition-colors
                                hover:bg-indigo-600
                                disabled:bg-gray-400
                            "
                        >

                            <Typography
                                text={
                                    editMutation.isPending
                                        ? 'Сохранение...'
                                        : 'Сохранить'
                                }
                                className="
                                    whitespace-nowrap
                                    text-sm
                                    font-semibold
                                    text-white
                                "
                            />

                        </Button>

                    </div>

                </form>

            </SidePage>

        </>
    );
}

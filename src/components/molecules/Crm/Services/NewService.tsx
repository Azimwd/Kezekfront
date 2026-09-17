import {
    useState,
    type Dispatch,
    type FormEvent,
    type SetStateAction
} from 'react';

import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import type {
    AxiosError
} from 'axios';

import {
    CircleAlert,
    Plus,
    Trash2
} from 'lucide-react';

import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';
import Input from '../../../atoms/Input';

import SidePage from '../../../organisms/SidePage';

import {
    useBusiness
} from '../../../../context/BusinessContext';

import {
    createService,
    createServiceAddon,
    deleteService,
    putStaffToService
} from '../../../../api/services';

import SpecialistsList from './SpecialistsList';
import CategorySelector from './CategorySelector';

import {
    getApiErrorMessage
} from '../../../../utils/getApiErrorMessage';


/*
 * ============================================================
 * ADDON DRAFT
 * ============================================================
 */

interface AddonDraft {

    tempId: string;

    name: string;

    description: string;

    price: string;

    duration_minutes: number;

    is_active: boolean;
}

/*
 * ============================================================
 * ADDON ERRORS
 * ============================================================
 */

type AddonErrorMap =
    Record<
        string,
        string[]
    >;


interface AddonApiErrorData {
    message?: unknown;
    detail?: unknown;
    non_field_errors?: unknown;

    name?: unknown;
    price?: unknown;
    duration_minutes?: unknown;
    is_active?: unknown;

    [key: string]:
        unknown;
}


class AddonMutationError
    extends Error {

    tempId: string;

    addonName: string;

    originalError: unknown;


    constructor(
        tempId: string,
        addonName: string,
        originalError: unknown
    ) {

        super(
            `Ошибка дополнительной услуги: ${
                addonName.trim() ||
                'без названия'
            }`
        );


        this.name =
            'AddonMutationError';

        this.tempId =
            tempId;

        this.addonName =
            addonName;

        this.originalError =
            originalError;
    }
}


const collectApiMessages = (
    value: unknown
): string[] => {

    if (
        typeof value ===
        'string'
    ) {

        const prepared =
            value.trim();

        return prepared
            ? [
                prepared
            ]
            : [];
    }


    if (
        Array.isArray(
            value
        )
    ) {

        return value.flatMap(
            collectApiMessages
        );
    }


    if (
        value &&
        typeof value ===
            'object'
    ) {

        return Object.values(
            value as Record<
                string,
                unknown
            >
        ).flatMap(
            collectApiMessages
        );
    }


    return [];
};


const getAddonApiErrorMessages = (
    error: unknown
): string[] => {

    const axiosError =
        error as AxiosError<
            AddonApiErrorData
        >;


    const data =
        axiosError.response
            ?.data;


    const messages =
        data
            ? collectApiMessages(
                data
            )
            : [];


    const uniqueMessages =
        Array.from(
            new Set(
                messages
            )
        );


    if (
        uniqueMessages.length >
        0
    ) {
        return uniqueMessages;
    }


    return [
        getApiErrorMessage(
            error,
            'Не удалось сохранить дополнительную услугу.'
        )
    ];
};


/*
 * ============================================================
 * CREATE EMPTY ADDON
 * ============================================================
 */

const createEmptyAddon =
    (): AddonDraft => ({

        tempId:
            `${Date.now()}-${Math.random()}`,

        name:
            '',

        description:
            '',

        price:
            '',

        duration_minutes:
            0,

        is_active:
            true
    });


export default function NewService() {

    /*
     * ============================================================
     * SIDE PAGE
     * ============================================================
     */

    const [
        isOpen,
        setIsOpen
    ] = useState(false);


    /*
     * ============================================================
     * BUSINESS
     * ============================================================
     */

    const {
        selectedBusiness
    } = useBusiness();


    const queryClient =
        useQueryClient();


    /*
     * ============================================================
     * SERVICE DATA
     * ============================================================
     */

    const [
        serviceName,
        setServiceName
    ] = useState('');


    const [
        serviceDesc,
        setServiceDesc
    ] = useState('');


    const [
        price,
        setPrice
    ] = useState('');


    const [
        duration,
        setDuration
    ] = useState(0);


    const [
        bufferBefore,
        setBufferBefore
    ] = useState(0);


    const [
        bufferAfter,
        setBufferAfter
    ] = useState(0);


    const [
        isActive,
        setIsActive
    ] = useState(true);


    /*
     * ============================================================
     * CATEGORY
     * ============================================================
     */

    const [
        selectedCategoryId,
        setSelectedCategoryId
    ] = useState<number | null>(
        null
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
        []
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
        []
    );


    const [
        addonErrors,
        setAddonErrors
    ] = useState<AddonErrorMap>(
        {}
    );


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
     * INTEGER INPUT
     * ============================================================
     */

    const handleIntegerChange = (
        value: string,
        setter: Dispatch<SetStateAction<number>>
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

            setter(
                0
            );

            return;
        }


        setter(
            Number(
                value
            )
        );
    };


    /*
     * ============================================================
     * PRICE INPUT
     * ============================================================
     */

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
     * ADD ADDON
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


    const clearAddonError = (
        tempId: string
    ) => {

        setAddonErrors(
            current => {

                if (
                    !current[
                        tempId
                    ]
                ) {
                    return current;
                }


                const next = {
                    ...current
                };


                delete next[
                    tempId
                ];


                return next;
            }
        );
    };


    /*
     * ============================================================
     * REMOVE ADDON
     * ============================================================
     */

    const handleRemoveAddon = (
        tempId: string
    ) => {

        setAddons(
            current =>
                current.filter(
                    addon =>
                        addon.tempId !==
                        tempId
                )
        );


        clearAddonError(
            tempId
        );
    };


    /*
     * ============================================================
     * UPDATE ADDON
     * ============================================================
     */

    const updateAddon = (
        tempId: string,
        changes: Partial<AddonDraft>
    ) => {

        clearAddonError(
            tempId
        );


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


    /*
     * ============================================================
     * ADDON PRICE
     * ============================================================
     */

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


    /*
     * ============================================================
     * ADDON DURATION
     * ============================================================
     */

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
     * VALIDATE ADDONS
     * ============================================================
     */

    const validateAddons = () => {

        const nextErrors:
            AddonErrorMap = {};


        const addError = (
            tempId: string,
            message: string
        ) => {

            nextErrors[
                tempId
            ] = [
                ...(
                    nextErrors[
                        tempId
                    ] ?? []
                ),
                message
            ];
        };


        const namesMap =
            new Map<
                string,
                string[]
            >();


        addons.forEach(
            (
                addon,
                index
            ) => {

                const preparedName =
                    addon.name
                        .trim();


                const preparedPrice =
                    addon.price
                        .trim();


                if (
                    !preparedName
                ) {

                    addError(
                        addon.tempId,
                        `Доп. услуга ${
                            index + 1
                        }: введите название.`
                    );
                }
                else {

                    const normalizedName =
                        preparedName
                            .toLocaleLowerCase(
                                'ru'
                            );


                    const ids =
                        namesMap.get(
                            normalizedName
                        ) ?? [];


                    namesMap.set(
                        normalizedName,
                        [
                            ...ids,
                            addon.tempId
                        ]
                    );
                }


                if (
                    preparedPrice ===
                    ''
                ) {

                    addError(
                        addon.tempId,
                        'Введите цену дополнительной услуги.'
                    );
                }
                else {

                    const numericPrice =
                        Number(
                            preparedPrice
                        );


                    if (
                        !Number.isFinite(
                            numericPrice
                        )
                    ) {

                        addError(
                            addon.tempId,
                            'Цена должна быть числом.'
                        );
                    }
                    else if (
                        numericPrice <
                        0
                    ) {

                        addError(
                            addon.tempId,
                            'Цена не может быть отрицательной.'
                        );
                    }
                }


                if (
                    !Number.isFinite(
                        addon
                            .duration_minutes
                    ) ||
                    addon
                        .duration_minutes <
                        0
                ) {

                    addError(
                        addon.tempId,
                        'Дополнительное время не может быть отрицательным.'
                    );
                }
            }
        );


        namesMap.forEach(
            tempIds => {

                if (
                    tempIds.length <
                    2
                ) {
                    return;
                }


                tempIds.forEach(
                    tempId => {

                        addError(
                            tempId,
                            'Название дополнительной услуги должно быть уникальным.'
                        );
                    }
                );
            }
        );


        setAddonErrors(
            nextErrors
        );


        if (
            Object.keys(
                nextErrors
            ).length >
            0
        ) {

            setErrorMessage(
                'Проверьте ошибки в дополнительных услугах ниже.'
            );

            return false;
        }


        return true;
    };


    /*
     * ============================================================
     * RESET FORM
     * ============================================================
     */

    const resetForm = () => {

        setServiceName(
            ''
        );

        setServiceDesc(
            ''
        );

        setPrice(
            ''
        );

        setDuration(
            0
        );

        setBufferBefore(
            0
        );

        setBufferAfter(
            0
        );

        setIsActive(
            true
        );

        setSelectedCategoryId(
            null
        );

        setSelectedStaffIds(
            []
        );

        setAddons(
            []
        );

        setAddonErrors(
            {}
        );

        setErrorMessage(
            ''
        );
    };


    /*
     * ============================================================
     * CREATE SERVICE
     * ============================================================
     */

    const NewServiceMutate =
        useMutation({

            mutationFn:
                async () => {

                    if (
                        !selectedBusiness?.id
                    ) {

                        throw new Error(
                            'Бизнес не выбран.'
                        );
                    }


                    /*
                     * ============================================
                     * 1. CREATE MAIN SERVICE
                     * ============================================
                     */

                    const service =
                        await createService(

                            Number(
                                selectedBusiness.id
                            ),

                            selectedCategoryId,

                            serviceName.trim(),

                            serviceDesc.trim(),

                            Number(
                                price
                            ),

                            duration,

                            bufferBefore,

                            bufferAfter,

                            isActive
                        );


                    /*
                     * Если следующая операция завершится ошибкой,
                     * удаляем созданную услугу.
                     *
                     * Это компенсирующий rollback.
                     */

                    try {

                        const tasks:
                            Promise<unknown>[] =
                            [];


                        /*
                         * ========================================
                         * 2. STAFF
                         * ========================================
                         */

                        if (
                            selectedStaffIds.length >
                            0
                        ) {

                            tasks.push(

                                putStaffToService(
                                    service.id,
                                    selectedStaffIds
                                )
                            );
                        }


                        /*
                         * ========================================
                         * 3. ADDONS
                         * ========================================
                         */

                        for (
                            const addon
                            of addons
                        ) {

                            tasks.push(

                                createServiceAddon(
                                    service.id,
                                    {
                                        name:
                                            addon
                                                .name
                                                .trim(),

                                        description:
                                            addon
                                                .description
                                                .trim(),

                                        price:
                                            Number(
                                                addon.price
                                            ),

                                        duration_minutes:
                                            addon
                                                .duration_minutes,

                                        is_active:
                                            addon
                                                .is_active
                                    }
                                ).catch(
                                    error => {

                                        throw new AddonMutationError(
                                            addon.tempId,
                                            addon.name,
                                            error
                                        );
                                    }
                                )
                            );
                        }


                        /*
                         * Ждём завершения ВСЕХ запросов.
                         *
                         * allSettled нужен, чтобы перед rollback
                         * не осталось выполняющихся запросов.
                         */

                        const results =
                            await Promise.allSettled(
                                tasks
                            );


                        const failedResult =
                            results.find(
                                result =>
                                    result.status ===
                                    'rejected'
                            );


                        if (
                            failedResult &&
                            failedResult.status ===
                            'rejected'
                        ) {

                            throw (
                                failedResult.reason
                            );
                        }


                        return service;

                    }

                    catch (
                        error
                    ) {

                        /*
                         * ========================================
                         * ROLLBACK
                         * ========================================
                         */

                        try {

                            await deleteService(
                                service.id
                            );

                        }

                        catch (
                            rollbackError
                        ) {

                            console.error(
                                'Не удалось удалить услугу после ошибки:',
                                rollbackError
                            );
                        }


                        throw error;
                    }
                },


            /*
             * ====================================================
             * BEFORE
             * ====================================================
             */

            onMutate: () => {

                setErrorMessage(
                    ''
                );
            },


            /*
             * ====================================================
             * SUCCESS
             * ====================================================
             */

            onSuccess:
                async () => {

                    /*
                     * Обновляем список услуг.
                     */

                    if (
                        selectedBusiness?.id
                    ) {

                        await queryClient.invalidateQueries({
                            queryKey: [
                                'services',
                                selectedBusiness.id
                            ]
                        });
                    }


                    resetForm();


                    setIsOpen(
                        false
                    );
                },


            /*
             * ====================================================
             * ERROR
             * ====================================================
             */

            onError:
                (
                    error
                ) => {

                    console.error(
                        'Ошибка создания услуги:',
                        error
                    );


                    if (
                        error instanceof
                        AddonMutationError
                    ) {

                        const messages =
                            getAddonApiErrorMessages(
                                error
                                    .originalError
                            );


                        setAddonErrors(
                            current => ({
                                ...current,
                                [
                                    error
                                        .tempId
                                ]:
                                    messages
                            })
                        );


                        setErrorMessage(
                            `Не удалось сохранить дополнительную услугу «${
                                error.addonName.trim() ||
                                'без названия'
                            }». Исправьте ошибку ниже.`
                        );


                        return;
                    }


                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Не удалось создать услугу.'
                        )
                    );
                }
        });


    /*
     * ============================================================
     * VALIDATE + SUBMIT
     * ============================================================
     */

    const handleCreateService =
        (
            e: FormEvent
        ) => {

            e.preventDefault();


            setErrorMessage(
                ''
            );


            /*
             * ====================================================
             * SERVICE NAME
             * ====================================================
             */

            if (
                !serviceName.trim()
            ) {

                setErrorMessage(
                    'Введите название услуги.'
                );

                return;
            }


            /*
             * ====================================================
             * SERVICE PRICE
             * ====================================================
             */

            if (
                price.trim() === ''
            ) {

                setErrorMessage(
                    'Введите цену услуги.'
                );

                return;
            }


            if (
                Number(
                    price
                ) < 0
            ) {

                setErrorMessage(
                    'Цена не может быть отрицательной.'
                );

                return;
            }


            /*
             * ====================================================
             * SERVICE DURATION
             * ====================================================
             */

            if (
                duration <= 0
            ) {

                setErrorMessage(
                    'Длительность услуги должна быть больше 0 минут.'
                );

                return;
            }


            /*
             * ====================================================
             * BUFFER
             * ====================================================
             */

            if (
                bufferBefore < 0 ||
                bufferAfter < 0
            ) {

                setErrorMessage(
                    'Буфер услуги не может быть отрицательным.'
                );

                return;
            }


            /*
             * ====================================================
             * ADDONS
             * ====================================================
             */

            if (
                !validateAddons()
            ) {
                return;
            }


            NewServiceMutate.mutate();
        };


    /*
     * ============================================================
     * BUSINESS NOT SELECTED
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
     * TOTAL PREVIEW
     * ============================================================
     */

    const addonsTotalPrice =
        addons.reduce(
            (
                total,
                addon
            ) => {

                const addonPrice =
                    Number(
                        addon.price
                    );


                return (
                    total +
                    (
                        Number.isFinite(
                            addonPrice
                        )
                            ? addonPrice
                            : 0
                    )
                );

            },
            0
        );


    const addonsTotalDuration =
        addons.reduce(
            (
                total,
                addon
            ) =>
                total +
                addon.duration_minutes,
            0
        );


    const servicePrice =
        Number(
            price
        ) || 0;


    const finalPricePreview =
        servicePrice +
        addonsTotalPrice;


    const finalDurationPreview =
        duration +
        addonsTotalDuration;


    /*
     * ============================================================
     * JSX
     * ============================================================
     */

    return (
        <>

            {/* =====================================================
                CREATE BUTTON
            ===================================================== */}

            <Button
                type="button"
                className="
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#4F46E5]
                    px-7
                    py-3
                    text-white
                    shadow-sm
                    transition-colors
                    hover:bg-indigo-600

                    md:w-auto
                    md:shrink-0
                "
                onClick={() => {

                    setErrorMessage(
                        ''
                    );

                    setIsOpen(
                        true
                    );
                }}
            >

                <Icon
                    icon={Plus}
                    size={20}
                />

                <Typography
                    text="Создать услугу"
                    className="
                        whitespace-nowrap
                        text-sm
                        font-semibold
                    "
                />

            </Button>


            {/* =====================================================
                SIDE PAGE
            ===================================================== */}

            <SidePage

                isOpen={
                    isOpen
                }

                onClose={() => {

                    setErrorMessage(
                        ''
                    );

                    setIsOpen(
                        false
                    );
                }}

                title="Создать услугу"

                description={
                    "Добавьте новую услугу для выбранного бизнеса"
                }
            >

                <form
                    className="
                        flex
                        h-full
                        flex-col
                    "
                    onSubmit={
                        handleCreateService
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

                        {/* =========================================
                            BUSINESS
                        ========================================= */}

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

                            <Icon
                                icon={
                                    CircleAlert
                                }
                                className="
                                    text-[#4F46E5]
                                "
                            />


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
                                    text={
                                        "Услуга будет создана только для этого бизнеса"
                                    }
                                />

                            </div>

                        </div>


                        {/* =========================================
                            ERROR
                        ========================================= */}

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


                        {/* =========================================
                            SERVICE NAME
                        ========================================= */}

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
                                    serviceName
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
                                        setServiceName(
                                            e.target.value
                                        )
                                }
                            />

                        </div>


                        {/* =========================================
                            CATEGORY
                        ========================================= */}

                        <CategorySelector
                            value={
                                selectedCategoryId
                            }
                            onChange={
                                setSelectedCategoryId
                            }
                        />


                        {/* =========================================
                            DESCRIPTION
                        ========================================= */}

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
                                    serviceDesc
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
                                        setServiceDesc(
                                            e.target.value
                                        )
                                }
                            />

                        </div>


                        {/* =========================================
                            PRICE / DURATION / BUFFER
                        ========================================= */}

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


                        {/* =========================================
                            ADDONS HEADER
                        ========================================= */}

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
                                        text={
                                            "Клиент сможет выбрать их дополнительно к основной услуге"
                                        }
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
                                        icon={Plus}
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


                            {/* =====================================
                                NO ADDONS
                            ===================================== */}

                            {addons.length === 0 && (

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

                            )}


                            {/* =====================================
                                ADDON CARDS
                            ===================================== */}

                            {addons.map(
                                (
                                    addon,
                                    index
                                ) => (

                                    <div
                                        key={
                                            addon.tempId
                                        }
                                        className={`
                                            flex
                                            flex-col
                                            gap-4
                                            rounded-xl
                                            border
                                            p-4

                                            ${
                                                addonErrors[
                                                    addon.tempId
                                                ]?.length
                                                    ? `
                                                        border-red-300
                                                        bg-red-50/30
                                                    `
                                                    : `
                                                        border-[#d6d4e1]
                                                        bg-white
                                                    `
                                            }
                                        `}
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
                                                            addon.tempId
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


                                        {addonErrors[
                                            addon.tempId
                                        ]?.length > 0 && (

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    gap-2
                                                    rounded-lg
                                                    border
                                                    border-red-200
                                                    bg-red-50
                                                    px-3
                                                    py-2.5
                                                    text-xs
                                                    text-red-700
                                                "
                                            >

                                                <CircleAlert
                                                    size={16}
                                                    className="
                                                        mt-0.5
                                                        shrink-0
                                                        text-red-500
                                                    "
                                                />


                                                <div
                                                    className="
                                                        flex
                                                        flex-col
                                                        gap-1
                                                    "
                                                >

                                                    {addonErrors[
                                                        addon.tempId
                                                    ].map(
                                                        (
                                                            message,
                                                            errorIndex
                                                        ) => (

                                                            <div
                                                                key={
                                                                    `${addon.tempId}-${errorIndex}`
                                                                }
                                                            >
                                                                {message}
                                                            </div>
                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        )}


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
                                                placeholder={
                                                    "Например: Снятие покрытия"
                                                }
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
                                                placeholder={
                                                    "Описание дополнительной услуги"
                                                }
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


                                        {/* PRICE + DURATION */}

                                        <div
                                            className="
                                                grid
                                                grid-cols-1
                                                gap-4
                                                sm:grid-cols-2
                                            "
                                        >

                                            {/* ADDON PRICE */}

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


                                            {/* ADDON DURATION */}

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
                                                text={
                                                    "Доп. услуга активна"
                                                }
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
                            )}


                            {/* =====================================
                                TOTAL PREVIEW
                            ===================================== */}

                            {addons.length > 0 && (

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-[#c7c4d8]
                                        bg-[#eff4ff]
                                        p-4
                                    "
                                >

                                    <Typography
                                        text={
                                            "Если клиент выберет все дополнительные услуги:"
                                        }
                                        className="
                                            mb-2
                                            text-sm
                                            font-medium
                                            text-slate-700
                                        "
                                    />


                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            gap-x-6
                                            gap-y-2
                                            text-sm
                                        "
                                    >

                                        <span>
                                            Цена:{' '}
                                            <strong>
                                                {
                                                    finalPricePreview
                                                        .toLocaleString(
                                                            'ru-RU'
                                                        )
                                                } ₸
                                            </strong>
                                        </span>


                                        <span>
                                            Длительность:{' '}
                                            <strong>
                                                {
                                                    finalDurationPreview
                                                } мин
                                            </strong>
                                        </span>

                                    </div>


                                    <Typography
                                        text={
                                            `Буферы применяются один раз: ${bufferBefore} мин до всей записи и ${bufferAfter} мин после всей записи.`
                                        }
                                        className="
                                            mt-2
                                            text-xs
                                            text-slate-500
                                        "
                                    />

                                </div>
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


                        {/* =========================================
                            MAIN SERVICE ACTIVE
                        ========================================= */}

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


                    {/* =============================================
                        STAFF
                    ============================================= */}

                    <div
                        className="
                            mt-10
                            flex
                            items-center
                            justify-start
                            gap-5
                        "
                    >

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

                    </div>


                    {/* =============================================
                        FOOTER
                    ============================================= */}

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
                            onClick={() => {

                                setErrorMessage(
                                    ''
                                );

                                setIsOpen(
                                    false
                                );
                            }}
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
                                NewServiceMutate.isPending
                            }
                            className="
                                cursor-pointer
                                rounded-xl
                                bg-[#4F46E5]
                                px-6
                                py-2.5
                                shadow-sm
                                transition-colors
                                hover:bg-indigo-600
                                disabled:cursor-not-allowed
                                disabled:bg-gray-400
                            "
                        >
                            <Typography
                                text={
                                    NewServiceMutate.isPending
                                        ? 'Создание...'
                                        : 'Создать'
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
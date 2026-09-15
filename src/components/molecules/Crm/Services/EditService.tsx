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
    Pencil
} from 'lucide-react';

import Button from '../../../atoms/Button';
import Typography from '../../../atoms/Typography';
import Icon from '../../../atoms/Icon';
import Input from '../../../atoms/Input';

import SidePage from '../../../organisms/SidePage';

import {
    editService,
    putStaffToService,
    getAssignedStaffForService
} from '../../../../api/services';

import {
    useBusiness
} from '../../../../context/BusinessContext';

import SpecialistsList from './SpecialistsList';
import CategorySelector from './CategorySelector';

import {
    getApiErrorMessage
} from '../../../../utils/getApiErrorMessage';


interface EditServiceProps {
    service: any;
}


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

    const handleIntegerChange = (
        value: string,
        setter: React.Dispatch<React.SetStateAction<number>>
    ) => {

        if (!/^\d*$/.test(value)) {
            return;
        }


        if (value === '') {
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

        if (!/^\d*[.,]?\d{0,2}$/.test(value)) {
            return;
        }


        setPrice(
            value.replace(',', '.')
        );
    };

    /*
     * ============================================================
     * FORM
     * ============================================================
     */

    const [
        name,
        setName
    ] = useState(
        service.name ||
        ''
    );


    const [
        description,
        setDescription
    ] = useState(
        service.description ||
        ''
    );


    const [
        price,
        setPrice
    ] = useState(
        service.price ??
        ''
    );


    const [
        duration,
        setDuration
    ] = useState(
        service.duration_minutes ??
        0
    );


    const [
        bufferBefore,
        setBufferBefore
    ] = useState(
        service.buffer_before_minutes ??
        0
    );


    const [
        bufferAfter,
        setBufferAfter
    ] = useState(
        service.buffer_after_minutes ??
        0
    );


    const [
        isActive,
        setIsActive
    ] = useState(
        service.is_active ??
        true
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
        service.category ??
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
        service.staff_ids ||
        []
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
     * OPEN
     * ============================================================
     */

    const handleOpen =
        () => {

            /*
             * Каждый раз при открытии
             * берём свежие данные service.
             */

            setName(
                service.name ||
                ''
            );


            setDescription(
                service.description ||
                ''
            );


            setPrice(
                service.price ??
                ''
            );


            setDuration(
                service.duration_minutes ??
                0
            );


            setBufferBefore(
                service.buffer_before_minutes ??
                0
            );


            setBufferAfter(
                service.buffer_after_minutes ??
                0
            );


            setIsActive(
                service.is_active ??
                true
            );


            setSelectedCategoryId(
                service.category ??
                null
            );


            setErrorMessage(
                ''
            );


            setIsOpen(
                true
            );
        };


    /*
     * ============================================================
     * EDIT
     * ============================================================
     */

    const editMutation =
        useMutation({

            mutationFn: () =>
                editService(

                    /*
                     * 1
                     */
                    service.id,

                    /*
                     * 2
                     * CATEGORY
                     */
                    selectedCategoryId,

                    /*
                     * 3
                     */
                    name,

                    /*
                     * 4
                     */
                    description,

                    /*
                     * 5
                     */
                    Number(
                        price
                    ),

                    /*
                     * 6
                     */
                    Number(
                        duration
                    ),

                    /*
                     * 7
                     */
                    Number(
                        bufferBefore
                    ),

                    /*
                     * 8
                     */
                    Number(
                        bufferAfter
                    ),

                    /*
                     * 9
                     */
                    isActive
                ),


            onMutate: () => {

                setErrorMessage(
                    ''
                );
            },


            onSuccess:
                async () => {

                    /*
                     * Обновляем привязку мастеров.
                     */

                    try {

                        await putStaffToService(
                            service.id,
                            selectedStaffIds
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            'Ошибка при обновлении мастеров:',
                            error
                        );
                    }


                    /*
                     * Обновляем список услуг.
                     */

                    await queryClient.invalidateQueries({
                        queryKey: [
                            'services',
                            selectedBusiness?.id
                        ]
                    });


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

    const handleSubmit =
        (
            e:
                React.FormEvent
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
                onClose={() => {

                    setErrorMessage(
                        ''
                    );

                    setIsOpen(
                        false
                    );
                }}
                title="Редактировать услугу"
                description="Редактируйте услугу для выбранного бизнеса"
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
                                rows={
                                    3
                                }
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
                                grid-cols-2
                                gap-5
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
                                            onChange={(e) =>
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
                                        onChange={(e) =>
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
                                        onChange={(e) =>
                                            handleIntegerChange(
                                                e.target.value,
                                                setBufferBefore
                                            )
                                        }
                                    />


                                    <Typography
                                        className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                                        text="мин"
                                    />

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
                                        onChange={(e) =>
                                            handleIntegerChange(
                                                e.target.value,
                                                setBufferAfter
                                            )
                                        }
                                    />


                                    <Typography
                                        className="
                                            pointer-events-none
                                            absolute
                                            right-4
                                            text-sm
                                            text-slate-500
                                        "
                                        text="мин"
                                    />

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
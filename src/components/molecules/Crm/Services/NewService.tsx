import {
    useState
} from 'react';

import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import {
    CircleAlert,
    Plus
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
    putStaffToService
} from '../../../../api/services';

import SpecialistsList from './SpecialistsList';
import CategorySelector from './CategorySelector';

import {
    getApiErrorMessage
} from '../../../../utils/getApiErrorMessage';


export default function NewService() {

    const [
        isOpen,
        setIsOpen
    ] = useState(false);


    const {
        selectedBusiness
    } = useBusiness();


    const queryClient =
        useQueryClient();

    const handleIntegerChange = (
        value: string,
        setter: React.Dispatch<React.SetStateAction<number>>
    ) => {

        /*
        * Разрешаем только цифры.
        */

        if (!/^\d*$/.test(value)) {
            return;
        }


        /*
        * Если поле очистили,
        * ставим 0 вместо NaN.
        */

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

        /*
        * Разрешаем:
        *
        * 100
        * 100.5
        * 100.50
        * 100,50
        */

        if (!/^\d*[.,]?\d{0,2}$/.test(value)) {
            return;
        }


        setPrice(
            value.replace(',', '.')
        );
    };
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
     * ERROR
     * ============================================================
     */

    const [
        errorMessage,
        setErrorMessage
    ] = useState('');


    /*
     * ============================================================
     * CREATE SERVICE
     * ============================================================
     */

    const NewServiceMutate =
        useMutation({

            mutationFn: () => {

                if (
                    !selectedBusiness?.id
                ) {

                    throw new Error(
                        'Бизнес не выбран'
                    );
                }


                return createService(
                    Number(
                        selectedBusiness.id
                    ),

                    selectedCategoryId,

                    serviceName,

                    serviceDesc,

                    Number(
                        price
                    ),

                    duration,

                    bufferBefore,

                    bufferAfter,

                    isActive
                );
            },


            onMutate: () => {

                setErrorMessage(
                    ''
                );
            },


            onSuccess:
                async (
                    data
                ) => {

                    /*
                     * Привязка мастеров.
                     */

                    if (
                        selectedStaffIds.length >
                            0 &&
                        data?.id
                    ) {

                        try {

                            await putStaffToService(
                                data.id,
                                selectedStaffIds
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                'Ошибка при привязке мастеров:',
                                error
                            );
                        }
                    }


                    /*
                     * Обновляем список услуг.
                     */

                    if (
                        selectedBusiness?.id
                    ) {

                        queryClient.invalidateQueries({
                            queryKey: [
                                'services',
                                selectedBusiness.id
                            ]
                        });
                    }


                    /*
                     * Сбрасываем форму.
                     */

                    setErrorMessage(
                        ''
                    );

                    setIsOpen(
                        false
                    );

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
                },


            onError:
                (
                    error
                ) => {

                    console.error(
                        'Ошибка создания:',
                        error
                    );


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
     * SUBMIT
     * ============================================================
     */

    const handleCreateService =
        (
            e:
                React.FormEvent
        ) => {

            e.preventDefault();


            setErrorMessage(
                ''
            );


            if (
                !serviceName.trim()
            ) {

                setErrorMessage(
                    'Введите название услуги.'
                );

                return;
            }


            if (
                price.trim() === ''
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
                duration <= 0
            ) {

                setErrorMessage(
                    'Длительность услуги должна быть больше 0 минут.'
                );

                return;
            }


            if (
                bufferBefore < 0 ||
                bufferAfter < 0
            ) {

                setErrorMessage(
                    'Буфер услуги не может быть отрицательным.'
                );

                return;
            }


            NewServiceMutate.mutate();
        };


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
                    setErrorMessage('');
                    setIsOpen(true);
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
                description="Добавьте новую услугу для выбранного бизнеса"
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

                        {/* BUSINESS */}

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
                                    text="Услуга будет создана только для этого бизнеса"
                                />

                            </div>

                        </div>


                        {/* ERROR */}

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


                        {/* NAME */}

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


                        {/* CATEGORY */}

                        <CategorySelector
                            value={
                                selectedCategoryId
                            }
                            onChange={
                                setSelectedCategoryId
                            }
                        />


                        {/* DESCRIPTION */}

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


                        {/* PRICE / DURATION */}

                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-5
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
                                        value={price}
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
                                        value={duration}
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
                                        inputMode="numeric"
                                        value={bufferBefore}
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
                                        inputMode="numeric"
                                        value={bufferAfter}
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


                        {/* ACTIVE */}

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


                    {/* STAFF */}

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


                    {/* FOOTER */}

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
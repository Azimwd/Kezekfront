import {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    Check,
    CircleAlert,
    Mail,
    MapPin,
    Phone,
    UploadCloud,
    X
} from 'lucide-react';

import Cropper
    from 'react-easy-crop';

import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import Button
    from '../../../atoms/Button';

import Icon
    from '../../../atoms/Icon';

import Typography
    from '../../../atoms/Typography';

import Modal
    from '../../../organisms/Modal';

import type {
    SelectOption
} from '../../../atoms/Select';

import Select
    from '../../../atoms/Select';

import Input
    from '../../../atoms/Input';

import {
    editCardBusinesses,
    type Business
} from '../../../../api/businesses';

import {
    getApiErrorMessage
} from '../../../../utils/getApiErrorMessage';


/*
 * ============================================================
 * IMAGE
 * ============================================================
 */

const createImage =
    (
        url: string
    ): Promise<HTMLImageElement> =>
        new Promise(
            (
                resolve,
                reject
            ) => {

                const image =
                    new Image();


                image.addEventListener(
                    'load',
                    () =>
                        resolve(
                            image
                        )
                );


                image.addEventListener(
                    'error',
                    error =>
                        reject(
                            error
                        )
                );


                image.setAttribute(
                    'crossOrigin',
                    'anonymous'
                );


                image.src =
                    url;
            }
        );


async function getCroppedImg(
    imageSrc: string,
    pixelCrop: {
        x: number;
        y: number;
        width: number;
        height: number;
    }
): Promise<File> {

    const image =
        await createImage(
            imageSrc
        );


    const canvas =
        document.createElement(
            'canvas'
        );


    const ctx =
        canvas.getContext(
            '2d'
        );


    if (
        !ctx
    ) {

        throw new Error(
            'Не удалось обработать изображение.'
        );
    }


    canvas.width =
        pixelCrop.width;


    canvas.height =
        pixelCrop.height;


    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );


    return new Promise(
        (
            resolve,
            reject
        ) => {

            canvas.toBlob(
                blob => {

                    if (
                        !blob
                    ) {

                        reject(
                            new Error(
                                'Не удалось сохранить изображение.'
                            )
                        );

                        return;
                    }


                    resolve(
                        new File(
                            [
                                blob
                            ],
                            'cropped_logo.jpg',
                            {
                                type:
                                    'image/jpeg',

                                lastModified:
                                    Date.now()
                            }
                        )
                    );
                },
                'image/jpeg'
            );
        }
    );
}


/*
 * ============================================================
 * CITIES
 * ============================================================
 */

const CITY_OPTIONS:
    SelectOption[] = [

        {
            id: '1',
            label: 'Алматы',
            ru: 'Алматы',
            eng: 'almaty'
        },

        {
            id: '2',
            label: 'Астана',
            ru: 'Астана',
            eng: 'astana'
        },

        {
            id: '3',
            label: 'Шымкент',
            ru: 'Шымкент',
            eng: 'shymkent'
        },

        {
            id: '4',
            label: 'Караганда',
            ru: 'Караганда',
            eng: 'karaganda'
        },

        {
            id: '5',
            label: 'Актобе',
            ru: 'Актобе',
            eng: 'aktobe'
        },

        {
            id: '6',
            label: 'Тараз',
            ru: 'Тараз',
            eng: 'taraz'
        },

        {
            id: '7',
            label: 'Павлодар',
            ru: 'Павлодар',
            eng: 'pavlodar'
        },

        {
            id: '8',
            label: 'Усть-Каменогорск',
            ru: 'Усть-Каменогорск',
            eng: 'ust-kamenogorsk'
        },

        {
            id: '9',
            label: 'Семей',
            ru: 'Семей',
            eng: 'semey'
        },

        {
            id: '10',
            label: 'Атырау',
            ru: 'Атырау',
            eng: 'atyrau'
        },

        {
            id: '11',
            label: 'Костанай',
            ru: 'Костанай',
            eng: 'kostanay'
        },

        {
            id: '12',
            label: 'Кызылорда',
            ru: 'Кызылорда',
            eng: 'kyzylorda'
        },

        {
            id: '13',
            label: 'Уральск',
            ru: 'Уральск',
            eng: 'uralsk'
        },

        {
            id: '14',
            label: 'Петропавловск',
            ru: 'Петропавловск',
            eng: 'petropavlovsk'
        },

        {
            id: '15',
            label: 'Актау',
            ru: 'Актау',
            eng: 'aktau'
        },

        {
            id: '16',
            label: 'Туркестан',
            ru: 'Туркестан',
            eng: 'turkestan'
        },

        {
            id: '17',
            label: 'Кокшетау',
            ru: 'Кокшетау',
            eng: 'kokshetau'
        },

        {
            id: '18',
            label: 'Талдыкорган',
            ru: 'Талдыкорган',
            eng: 'taldykorgan'
        }

    ];


const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';


const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop';


interface EditBusinessProps {
    business: Business;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function EditBusiness({
    business
}: EditBusinessProps) {

    const queryClient =
        useQueryClient();


    const [
        isModalOpen,
        setIsModalOpen
    ] = useState(false);


    /*
     * ============================================================
     * FORM
     * ============================================================
     */

    const [
        name,
        setName
    ] = useState('');


    const [
        description,
        setDescription
    ] = useState('');


    const [
        phone,
        setPhone
    ] = useState('');


    const [
        mail,
        setMail
    ] = useState('');


    const [
        city,
        setCity
    ] = useState<SelectOption>(
        CITY_OPTIONS[0]
    );


    const [
        address,
        setAddress
    ] = useState('');


    const [
        isActiveStatus,
        setIsActiveStatus
    ] = useState(false);


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
     * LOGO
     * ============================================================
     */

    const [
        logo,
        setLogo
    ] = useState<File | null>(
        null
    );


    const [
        logoPreview,
        setLogoPreview
    ] = useState<string | null>(
        null
    );


    const [
        rawImage,
        setRawImage
    ] = useState<string | null>(
        null
    );


    const [
        crop,
        setCrop
    ] = useState({
        x: 0,
        y: 0
    });


    const [
        zoom,
        setZoom
    ] = useState(1);


    const [
        croppedAreaPixels,
        setCroppedAreaPixels
    ] = useState<any>(
        null
    );


    /*
     * ============================================================
     * LOAD CURRENT BUSINESS
     * ============================================================
     */

    useEffect(
        () => {

            if (
                !isModalOpen
            ) {

                return;
            }


            setErrorMessage(
                ''
            );


            setName(
                business.name ||
                ''
            );


            setDescription(
                business.description ||
                ''
            );


            setPhone(
                business.phone ||
                ''
            );


            setMail(
                business.email ||
                ''
            );


            setAddress(
                business.address ||
                ''
            );


            const currentCity =
                CITY_OPTIONS.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            business.city ??
                            ''
                        )
                );


            if (
                currentCity
            ) {

                setCity(
                    currentCity
                );
            }


            setIsActiveStatus(
                business.status ===
                    'active'
            );


            setLogo(
                null
            );


            setRawImage(
                null
            );


            if (
                business.logo
            ) {

                const fullUrl =
                    business.logo.startsWith(
                        'http'
                    )
                        ? business.logo
                        : `${BACKEND_URL}${business.logo}`;


                setLogoPreview(
                    fullUrl
                );

            } else if (
                business.images &&
                business.images.length >
                    0
            ) {

                const image =
                    business.images[0] as any;


                const imageUrl =
                    typeof image ===
                    'string'
                        ? image
                        : image.image;


                if (
                    imageUrl
                ) {

                    const fullUrl =
                        imageUrl.startsWith(
                            'http'
                        )
                            ? imageUrl
                            : `${BACKEND_URL}${imageUrl}`;


                    setLogoPreview(
                        fullUrl
                    );

                } else {

                    setLogoPreview(
                        DEFAULT_IMAGE
                    );
                }

            } else {

                setLogoPreview(
                    DEFAULT_IMAGE
                );
            }

        },
        [
            isModalOpen,
            business
        ]
    );


    /*
     * ============================================================
     * CLEANUP
     * ============================================================
     */

    useEffect(
        () => {

            return () => {

                if (
                    logoPreview &&
                    logoPreview.startsWith(
                        'blob:'
                    )
                ) {

                    URL.revokeObjectURL(
                        logoPreview
                    );
                }


                if (
                    rawImage
                ) {

                    URL.revokeObjectURL(
                        rawImage
                    );
                }
            };

        },
        [
            logoPreview,
            rawImage
        ]
    );


    /*
     * ============================================================
     * UPDATE
     * ============================================================
     */

    const EditBusinessMutation =
        useMutation({

            mutationFn: () =>
                editCardBusinesses(
                    business.id,
                    name.trim(),
                    description.trim(),
                    phone.trim(),
                    mail.trim(),
                    Number(
                        city.id
                    ),
                    address.trim(),
                    isActiveStatus
                        ? 'active'
                        : 'draft',
                    logo
                ),


            onMutate: () => {

                setErrorMessage(
                    ''
                );
            },


            onSuccess:
                (
                    data
                ) => {

                    console.log(
                        'Бизнес обновлен:',
                        data
                    );


                    setIsModalOpen(
                        false
                    );


                    setLogo(
                        null
                    );


                    setRawImage(
                        null
                    );


                    setErrorMessage(
                        ''
                    );


                    queryClient.invalidateQueries({
                        queryKey: [
                            'businesses'
                        ]
                    });


                    queryClient.invalidateQueries({
                        queryKey: [
                            'all-businesses'
                        ]
                    });
                },


            onError:
                (
                    error
                ) => {

                    console.error(
                        'Ошибка при обновлении бизнеса:',
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
                rawImage
            ) {

                setErrorMessage(
                    'Сначала сохраните обрезанное изображение.'
                );

                return;
            }


            if (
                !name.trim()
            ) {

                setErrorMessage(
                    'Введите название бизнеса.'
                );

                return;
            }


            if (
                !phone.trim()
            ) {

                setErrorMessage(
                    'Введите номер телефона.'
                );

                return;
            }


            if (
                !city?.id
            ) {

                setErrorMessage(
                    'Выберите город.'
                );

                return;
            }


            if (
                !address.trim()
            ) {

                setErrorMessage(
                    'Введите адрес бизнеса.'
                );

                return;
            }


            if (
                mail.trim() &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    mail.trim()
                )
            ) {

                setErrorMessage(
                    'Введите корректный Email.'
                );

                return;
            }


            EditBusinessMutation.mutate();
        };


    /*
     * ============================================================
     * FILE
     * ============================================================
     */

    const handleFileChange =
        (
            e:
                React.ChangeEvent<HTMLInputElement>
        ) => {

            setErrorMessage(
                ''
            );


            const file =
                e.target.files?.[0];


            if (
                !file
            ) {

                return;
            }


            const allowedTypes = [
                'image/png',
                'image/jpeg',
                'image/gif'
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                setErrorMessage(
                    'Можно загрузить только PNG, JPG или GIF.'
                );

                e.target.value =
                    '';

                return;
            }


            const maxSize =
                5 *
                1024 *
                1024;


            if (
                file.size >
                maxSize
            ) {

                setErrorMessage(
                    'Размер изображения не должен превышать 5 MB.'
                );

                e.target.value =
                    '';

                return;
            }


            setRawImage(
                URL.createObjectURL(
                    file
                )
            );
        };


    /*
     * ============================================================
     * CROP
     * ============================================================
     */

    const onCropComplete =
        useCallback(
            (
                _croppedArea: any,
                pixels: any
            ) => {

                setCroppedAreaPixels(
                    pixels
                );
            },
            []
        );


    const handleSaveCrop =
        async (
            e:
                React.MouseEvent
        ) => {

            e.preventDefault();

            e.stopPropagation();


            setErrorMessage(
                ''
            );


            try {

                if (
                    !rawImage ||
                    !croppedAreaPixels
                ) {

                    setErrorMessage(
                        'Не удалось определить область изображения.'
                    );

                    return;
                }


                const croppedFile =
                    await getCroppedImg(
                        rawImage,
                        croppedAreaPixels
                    );


                if (
                    logoPreview &&
                    logoPreview.startsWith(
                        'blob:'
                    )
                ) {

                    URL.revokeObjectURL(
                        logoPreview
                    );
                }


                setLogo(
                    croppedFile
                );


                setLogoPreview(
                    URL.createObjectURL(
                        croppedFile
                    )
                );


                URL.revokeObjectURL(
                    rawImage
                );


                setRawImage(
                    null
                );

            } catch (
                error
            ) {

                console.error(
                    'Ошибка при кадрировании:',
                    error
                );


                setErrorMessage(
                    'Не удалось обработать изображение. Попробуйте другое фото.'
                );
            }
        };


    const handleCancelCrop =
        (
            e:
                React.MouseEvent
        ) => {

            e.preventDefault();

            e.stopPropagation();


            if (
                rawImage
            ) {

                URL.revokeObjectURL(
                    rawImage
                );
            }


            setRawImage(
                null
            );


            setCroppedAreaPixels(
                null
            );
        };


    const handleRemoveFile =
        (
            e:
                React.MouseEvent
        ) => {

            e.preventDefault();

            e.stopPropagation();


            if (
                logoPreview &&
                logoPreview.startsWith(
                    'blob:'
                )
            ) {

                URL.revokeObjectURL(
                    logoPreview
                );
            }


            setLogo(
                null
            );


            setLogoPreview(
                DEFAULT_IMAGE
            );
        };


    /*
     * ============================================================
     * CLOSE
     * ============================================================
     */

    const handleClose =
        () => {

            setErrorMessage(
                ''
            );


            if (
                rawImage
            ) {

                URL.revokeObjectURL(
                    rawImage
                );
            }


            setRawImage(
                null
            );


            setLogo(
                null
            );


            setIsModalOpen(
                false
            );
        };


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <>

            <Button
                onClick={() => {

                    setErrorMessage(
                        ''
                    );

                    setIsModalOpen(
                        true
                    );
                }}
                className="flex-1 h-[46px] flex items-center justify-center bg-[#f4f6f9] hover:bg-slate-200 text-slate-800 font-medium rounded-xl text-[14px] transition-colors cursor-pointer"
            >

                <Typography
                    text="Редактировать"
                />

            </Button>


            <Modal
                isOpen={
                    isModalOpen
                }
                onClose={
                    handleClose
                }
            >

                <form
                    className="w-full max-w-3xl bg-white p-2 text-left"
                    onSubmit={
                        handleSubmit
                    }
                >

                    {/* ERROR */}

                    {errorMessage && (

                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                            <CircleAlert
                                size={
                                    19
                                }
                                className="mt-0.5 shrink-0 text-red-500"
                            />


                            <div className="whitespace-pre-line leading-5">
                                {errorMessage}
                            </div>

                        </div>

                    )}


                    {/* MAIN */}

                    <div className="mb-8">

                        <Typography
                            className="text-lg font-semibold text-[#1e293b] border-b pb-3 mb-5 block"
                            text="Редактирование бизнеса"
                        />


                        <div className="space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>

                                    <Typography
                                        className="block text-xs font-semibold text-gray-600 mb-1.5"
                                        text="Название бизнеса *"
                                    />


                                    <Input
                                        type="text"
                                        className="w-full px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:bg-white text-sm"
                                        value={
                                            name
                                        }
                                        onChange={
                                            e =>
                                                setName(
                                                    e.target.value
                                                )
                                        }
                                        placeholder="Название"
                                    />

                                </div>


                                <div className="flex flex-col justify-center">

                                    <Typography
                                        className="block text-xs font-semibold text-gray-600 mb-1.5"
                                        text="Статус"
                                    />


                                    <label className="flex items-center gap-3 cursor-pointer mt-1">

                                        <div className="relative">

                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={
                                                    isActiveStatus
                                                }
                                                onChange={
                                                    e =>
                                                        setIsActiveStatus(
                                                            e.target.checked
                                                        )
                                                }
                                            />


                                            <div
                                                className={`block w-11 h-6 rounded-full transition-colors ${
                                                    isActiveStatus
                                                        ? 'bg-[#3b27b5]'
                                                        : 'bg-gray-300'
                                                }`}
                                            />


                                            <div
                                                className={`absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform ${
                                                    isActiveStatus
                                                        ? 'translate-x-5'
                                                        : ''
                                                }`}
                                            />

                                        </div>


                                        <Typography
                                            className={`text-sm font-medium ${
                                                isActiveStatus
                                                    ? 'text-[#3b27b5]'
                                                    : 'text-gray-500'
                                            }`}
                                            text={
                                                isActiveStatus
                                                    ? 'Активен'
                                                    : 'Черновик'
                                            }
                                        />

                                    </label>

                                </div>

                            </div>


                            <div>

                                <Typography
                                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                                    text="Описание"
                                />


                                <textarea
                                    className="w-full px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:bg-white text-sm min-h-[100px] resize-y"
                                    value={
                                        description
                                    }
                                    onChange={
                                        e =>
                                            setDescription(
                                                e.target.value
                                            )
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    {/* CONTACTS */}

                    <div className="mb-8">

                        <Typography
                            className="text-lg font-semibold text-[#1e293b] border-b pb-3 mb-5 block"
                            text="Контакты и Адрес"
                        />


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>

                                <Typography
                                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                                    text="Телефон *"
                                />


                                <div className="relative">

                                    <Icon
                                        icon={
                                            Phone
                                        }
                                        className="absolute left-3 top-3.5 text-gray-400"
                                        size={
                                            16
                                        }
                                    />


                                    <Input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                                        value={
                                            phone
                                        }
                                        onChange={
                                            e =>
                                                setPhone(
                                                    e.target.value
                                                )
                                        }
                                        placeholder="Номер"
                                    />

                                </div>

                            </div>


                            <div>

                                <Typography
                                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                                    text="Email"
                                />


                                <div className="relative">

                                    <Icon
                                        icon={
                                            Mail
                                        }
                                        className="absolute left-3 top-3.5 text-gray-400"
                                        size={
                                            16
                                        }
                                    />


                                    <Input
                                        type="email"
                                        className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                                        value={
                                            mail
                                        }
                                        onChange={
                                            e =>
                                                setMail(
                                                    e.target.value
                                                )
                                        }
                                        placeholder="Почта"
                                    />

                                </div>

                            </div>


                            <div>

                                <Typography
                                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                                    text="Город *"
                                />


                                <Select
                                    options={
                                        CITY_OPTIONS
                                    }
                                    value={
                                        city
                                    }
                                    onChange={
                                        setCity
                                    }
                                    className="w-full border border-gray-200 rounded-lg bg-gray-50"
                                />

                            </div>


                            <div>

                                <Typography
                                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                                    text="Адрес *"
                                />


                                <div className="relative">

                                    <Icon
                                        icon={
                                            MapPin
                                        }
                                        className="absolute left-3 top-3.5 text-gray-400"
                                        size={
                                            16
                                        }
                                    />


                                    <Input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                                        value={
                                            address
                                        }
                                        onChange={
                                            e =>
                                                setAddress(
                                                    e.target.value
                                                )
                                        }
                                        placeholder="Адрес"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* MEDIA */}

                    <div className="mb-6">

                        <Typography
                            className="text-lg font-semibold text-[#1e293b] border-b pb-3 mb-5 block"
                            text="Медиа и Настройки"
                        />


                        <div className="space-y-5">

                            <div>

                                <Typography
                                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                                    text="Логотип бизнеса"
                                />


                                {rawImage ? (

                                    <div className="relative w-full h-[300px] bg-black rounded-xl overflow-hidden mb-4">

                                        <Cropper
                                            image={
                                                rawImage
                                            }
                                            crop={
                                                crop
                                            }
                                            zoom={
                                                zoom
                                            }
                                            aspect={
                                                4 / 3
                                            }
                                            onCropChange={
                                                setCrop
                                            }
                                            onCropComplete={
                                                onCropComplete
                                            }
                                            onZoomChange={
                                                setZoom
                                            }
                                        />


                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10 px-4">

                                            <Button
                                                type="button"
                                                onClick={
                                                    handleCancelCrop
                                                }
                                                className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg text-sm flex gap-2"
                                            >

                                                <Icon
                                                    icon={
                                                        X
                                                    }
                                                    size={
                                                        16
                                                    }
                                                />

                                                Отмена

                                            </Button>


                                            <Button
                                                type="button"
                                                onClick={
                                                    handleSaveCrop
                                                }
                                                className="bg-[#4F46E5] hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2"
                                            >

                                                <Icon
                                                    icon={
                                                        Check
                                                    }
                                                    size={
                                                        16
                                                    }
                                                />

                                                Сохранить обрезку

                                            </Button>

                                        </div>

                                    </div>

                                ) : (

                                    <label className="relative border border-dashed border-[#a5b4fc] rounded-xl flex flex-col items-center justify-center bg-[#fefeff] hover:bg-indigo-50/30 transition-colors cursor-pointer overflow-hidden min-h-[160px]">

                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg, image/gif"
                                            onChange={
                                                handleFileChange
                                            }
                                        />


                                        {logoPreview ? (

                                            <>

                                                <img
                                                    src={
                                                        logoPreview
                                                    }
                                                    alt="Preview"
                                                    className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                                                />


                                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-all">

                                                    <Typography
                                                        text="Нажмите, чтобы заменить"
                                                        className="text-white text-sm font-medium mb-2"
                                                    />

                                                </div>


                                                {logoPreview !==
                                                    DEFAULT_IMAGE && (

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleRemoveFile
                                                        }
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition z-10 cursor-pointer"
                                                    >

                                                        <Icon
                                                            icon={
                                                                X
                                                            }
                                                            size={
                                                                16
                                                            }
                                                        />

                                                    </button>

                                                )}

                                            </>

                                        ) : (

                                            <>

                                                <div className="w-10 h-10 bg-[#e0e7ff] rounded-full flex items-center justify-center mb-3">

                                                    <Icon
                                                        icon={
                                                            UploadCloud
                                                        }
                                                        className="text-[#4F46E5]"
                                                        size={
                                                            20
                                                        }
                                                    />

                                                </div>


                                                <Typography
                                                    className="text-[#4F46E5] font-medium text-sm"
                                                    text="Нажмите для загрузки"
                                                />

                                            </>

                                        )}

                                    </label>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* SUBMIT */}

                    <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-2">
                    <Button
                        type="submit"
                        disabled={
                            EditBusinessMutation.isPending ||
                            !!rawImage
                        }
                        className={`px-5 py-2 bg-[#3b27b5] rounded-lg transition-colors ${
                            EditBusinessMutation.isPending ||
                            !!rawImage
                                ? 'opacity-70 cursor-not-allowed'
                                : 'hover:bg-indigo-800 cursor-pointer'
                        }`}
                    >
                        <Typography
                            text={
                                EditBusinessMutation.isPending
                                    ? 'Сохранение...'
                                    : 'Сохранить изменения'
                            }
                            className="text-sm font-medium text-white"
                        />
                    </Button>

                    </div>

                </form>

            </Modal>

        </>
    );
}
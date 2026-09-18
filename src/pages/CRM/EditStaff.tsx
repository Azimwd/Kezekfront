import {
    useEffect,
    useState
} from 'react';

import {
    CircleAlert,
    RefreshCw,
    User
} from 'lucide-react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

import {
    editMasters,
    getStaffById
} from '../../api/staff';

import {
    getApiErrorMessage
} from '../../utils/getApiErrorMessage';

import EditImage
    from '../../components/molecules/Crm/Staff/StaffEdit/EditImage';

import EditInfo
    from '../../components/molecules/Crm/Staff/StaffEdit/EditInfo';

import StaffEditHeader
    from '../../components/organisms/Crm/Staff.tsx/StaffEdit/StaffEditHeader';

import Icon
    from '../../components/atoms/Icon';

import Typography
    from '../../components/atoms/Typography';

import StaffActiveStatus
    from '../../components/organisms/Crm/Staff.tsx/StaffEdit/StaffActiveStatus';

import StaffEditButtons
    from '../../components/organisms/Crm/Staff.tsx/StaffEdit/StaffEditButtons';

import Button
    from '../../components/atoms/Button';


const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';


export default function EditStaff() {

    /*
     * ============================================================
     * BASIC
     * ============================================================
     */

    const {
        id
    } = useParams<{
        id: string;
    }>();


    const navigate =
        useNavigate();


    const queryClient =
        useQueryClient();


    const staffId =
        Number(
            id
        );


    /*
     * ============================================================
     * FORM
     * ============================================================
     */

    const [
        fullName,
        setFullName
    ] = useState('');


    const [
        position,
        setPosition
    ] = useState('');


    const [
        description,
        setDescription
    ] = useState('');


    const [
        isActive,
        setIsActive
    ] = useState(true);


    /*
     * ============================================================
     * PHOTO
     * ============================================================
     */

    const [
        currentPhoto,
        setCurrentPhoto
    ] = useState<string | null>(
        null
    );


    const [
        newPhoto,
        setNewPhoto
    ] = useState<File | null>(
        null
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
     * GET STAFF
     * ============================================================
     */

    const {
        data: staffResponse,
        isLoading,
        isError,
        error: staffLoadError,
        refetch
    } = useQuery({

        queryKey: [
            'staff',
            id
        ],

        queryFn: () =>
            getStaffById(
                staffId
            ),

        enabled:
            !!id &&
            Number.isFinite(
                staffId
            ) &&
            staffId > 0,

        retry:
            false
    });


    /*
     * ============================================================
     * FILL FORM
     * ============================================================
     */

    useEffect(
        () => {

            if (
                !staffResponse?.data
            ) {
                return;
            }


            const staff =
                staffResponse.data;


            setFullName(
                `${
                    staff.first_name ||
                    ''
                } ${
                    staff.last_name ||
                    ''
                }`.trim()
            );


            setPosition(
                staff.position ||
                ''
            );


            setDescription(
                staff.description ||
                ''
            );


            setIsActive(
                staff.is_active ??
                true
            );


            /*
             * PHOTO
             */

            if (
                staff.photo
            ) {

                const photoUrl =
                    staff.photo.startsWith(
                        'http'
                    )
                        ? staff.photo
                        : `${BACKEND_URL}${staff.photo}`;


                setCurrentPhoto(
                    photoUrl
                );

            } else {

                setCurrentPhoto(
                    null
                );
            }


            /*
             * При первоначальной загрузке
             * нового файла ещё нет.
             */

            setNewPhoto(
                null
            );


            setErrorMessage(
                ''
            );

        },
        [
            staffResponse
        ]
    );


    /*
     * ============================================================
     * EDIT
     * ============================================================
     */

    const editStaffMutation =
        useMutation({

            mutationFn:
                editMasters,


            onMutate: () => {

                setErrorMessage(
                    ''
                );
            },


            onSuccess:
                async (
                    data
                ) => {

                    console.log(
                        'Мастер успешно обновлен:',
                        data
                    );


                    await queryClient.invalidateQueries({
                        queryKey: [
                            'masters'
                        ]
                    });


                    await queryClient.invalidateQueries({
                        queryKey: [
                            'staff'
                        ]
                    });


                    await queryClient.invalidateQueries({
                        queryKey: [
                            'staff',
                            id
                        ]
                    });


                    navigate(
                        -1
                    );
                },


            onError:
                (
                    error
                ) => {

                    console.error(
                        'Ошибка при сохранении мастера:',
                        error
                    );


                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Не удалось сохранить изменения мастера.'
                        )
                    );
                }
        });


    /*
     * ============================================================
     * SAVE
     * ============================================================
     */

    const handleSave =
        () => {

            if (
                editStaffMutation.isPending
            ) {
                return;
            }


            setErrorMessage(
                ''
            );


            if (
                !id ||
                !Number.isFinite(
                    staffId
                ) ||
                staffId <= 0
            ) {

                setErrorMessage(
                    'Не удалось определить мастера.'
                );

                return;
            }


            const normalizedName =
                fullName
                    .trim()
                    .replace(
                        /\s+/g,
                        ' '
                    );


            if (
                !normalizedName
            ) {

                setErrorMessage(
                    'Введите имя и фамилию мастера.'
                );

                return;
            }


            const nameParts =
                normalizedName.split(
                    ' '
                );


            const first_name =
                nameParts[0] ||
                '';


            const last_name =
                nameParts
                    .slice(
                        1
                    )
                    .join(
                        ' '
                    )
                    .trim();


            if (
                !first_name
            ) {

                setErrorMessage(
                    'Введите имя мастера.'
                );

                return;
            }


            if (
                !position.trim()
            ) {

                setErrorMessage(
                    'Введите должность мастера.'
                );

                return;
            }


            /*
             * ========================================================
             * MUTATE
             * ========================================================
             */

            editStaffMutation.mutate({

                id:
                    staffId,

                first_name:
                    first_name.trim(),

                last_name:
                    last_name.trim(),

                position:
                    position.trim(),

                description:
                    description.trim(),

                is_active:
                    isActive,

                photo:
                    newPhoto
            });
        };


    /*
     * ============================================================
     * INVALID ID
     * ============================================================
     */

    if (
        !id ||
        !Number.isFinite(
            staffId
        ) ||
        staffId <= 0
    ) {

        return (
            <div
                className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-4
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    p-8
                "
            >

                <CircleAlert
                    size={
                        28
                    }
                    className="
                        text-red-500
                    "
                />


                <Typography
                    text="Некорректный идентификатор мастера."
                    className="
                        text-sm
                        font-medium
                        text-red-700
                    "
                />


                <Button
                    onClick={() =>
                        navigate(
                            -1
                        )
                    }
                    className="
                        cursor-pointer
                        rounded-xl
                        bg-[#3B28CC]
                        px-6
                        py-2.5
                        text-white
                    "
                >
                    Назад
                </Button>

            </div>
        );
    }


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
                    flex
                    h-64
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    p-5
                "
            >

                <span
                    className="
                        text-lg
                        text-gray-500
                    "
                >
                    Загрузка данных мастера...
                </span>

            </div>
        );
    }


    /*
     * ============================================================
     * LOAD ERROR
     * ============================================================
     */

    if (
        isError
    ) {

        return (
            <div
                className="
                    flex
                    min-h-64
                    flex-col
                    items-center
                    justify-center
                    gap-4
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    p-8
                    text-center
                "
            >

                <CircleAlert
                    size={
                        30
                    }
                    className="
                        text-red-500
                    "
                />


                <div
                    className="
                        flex
                        max-w-lg
                        flex-col
                        gap-1
                    "
                >

                    <Typography
                        text="Не удалось загрузить мастера"
                        className="
                            text-base
                            font-semibold
                            text-red-700
                        "
                    />


                    <div
                        className="
                            whitespace-pre-line
                            text-sm
                            text-red-600
                        "
                    >

                        {
                            getApiErrorMessage(
                                staffLoadError,
                                'Произошла ошибка при загрузке данных мастера.'
                            )
                        }

                    </div>

                </div>


                <div
                    className="
                        flex
                        gap-3
                    "
                >

                    <Button
                        onClick={() =>
                            refetch()
                        }
                        className="
                            flex
                            cursor-pointer
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#3B28CC]
                            px-5
                            py-2.5
                            text-white
                            hover:bg-[#2b1d96]
                        "
                    >

                        <Icon
                            icon={
                                RefreshCw
                            }
                            size={
                                17
                            }
                        />


                        <Typography
                            text="Повторить"
                            className="
                                text-sm
                                font-medium
                                text-white
                            "
                        />

                    </Button>


                    <Button
                        onClick={() =>
                            navigate(
                                -1
                            )
                        }
                        className="
                            cursor-pointer
                            rounded-xl
                            border
                            border-[#c7c4d8]
                            bg-white
                            px-5
                            py-2.5
                            hover:bg-slate-50
                        "
                    >

                        <Typography
                            text="Назад"
                            className="
                                text-sm
                                font-medium
                                text-slate-700
                            "
                        />

                    </Button>

                </div>

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
                flex-col
                gap-6
            "
        >

            <StaffEditHeader />


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
                        size={
                            19
                        }
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


            <div
                className="
                    grid
                    grid-cols-1
                    items-start
                    gap-10
                    lg:grid-cols-5
                "
            >

                {/* LEFT */}

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-10
                        lg:col-span-3
                    "
                >

                    <div
                        className="
                            w-full
                            rounded-3xl
                            border
                            border-[#c7c4d8]
                            bg-white
                            p-6
                            sm:p-8
                        "
                    >

                        <div
                            className="
                                mb-8
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <Icon
                                icon={
                                    User
                                }
                                className="
                                    h-6
                                    w-6
                                    text-[#3B28CC]
                                "
                            />


                            <Typography
                                className="
                                    text-xl
                                    font-medium
                                    text-[#0F172A]
                                    sm:text-[22px]
                                "
                                text="Основная информация"
                            />

                        </div>


                        <div
                            className="
                                flex
                                flex-col
                                gap-8
                                md:flex-row
                                md:gap-10
                            "
                        >

                            {/* PHOTO */}

                            <div
                                className="
                                    flex
                                    w-full
                                    flex-shrink-0
                                    justify-center
                                    md:w-auto
                                    md:justify-start
                                "
                            >

                                <EditImage
                                    currentPhoto={
                                        currentPhoto
                                    }
                                    photo={
                                        newPhoto
                                    }
                                    onChange={
                                        setNewPhoto
                                    }
                                />

                            </div>


                            {/* INFO */}

                            <div
                                className="
                                    w-full
                                    flex-grow
                                "
                            >

                                <EditInfo
                                    fullName={
                                        fullName
                                    }
                                    onFullNameChange={
                                        setFullName
                                    }
                                    position={
                                        position
                                    }
                                    onPositionChange={
                                        setPosition
                                    }
                                    description={
                                        description
                                    }
                                    onDescriptionChange={
                                        setDescription
                                    }
                                    isActive={
                                        isActive
                                    }
                                    onIsActiveChange={
                                        setIsActive
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    {/* BUTTONS */}

                    <div
                        className="
                            flex
                            w-full
                            justify-end
                            gap-5
                        "
                    >

                        <Button
                            type="button"
                            className="
                                w-full
                                cursor-pointer
                                rounded-xl
                                bg-[#E2E8FF]
                                px-8
                                py-3
                                transition-colors
                                hover:bg-[#D1DBFF]
                                sm:w-auto
                            "
                            onClick={() =>
                                navigate(
                                    -1
                                )
                            }
                        >

                            <Typography
                                text="Отмена"
                                className="
                                    text-[15px]
                                    font-medium
                                    text-[#3B28CC]
                                "
                            />

                        </Button>


                        <Button
                            type="button"
                            onClick={
                                handleSave
                            }
                            disabled={
                                editStaffMutation.isPending
                            }
                            className={`
                                w-full
                                rounded-xl
                                bg-[#3B28CC]
                                px-8
                                py-3
                                text-white
                                transition-colors
                                sm:w-auto

                                ${
                                    editStaffMutation.isPending
                                        ? `
                                            cursor-not-allowed
                                            opacity-50
                                        `
                                        : `
                                            cursor-pointer
                                            hover:bg-[#2b1d96]
                                        `
                                }
                            `}
                        >

                            <Typography
                                text={
                                    editStaffMutation.isPending
                                        ? 'Сохранение...'
                                        : 'Сохранить'
                                }
                                className="
                                    text-[15px]
                                    font-medium
                                    text-white
                                "
                            />

                        </Button>

                    </div>

                </div>


                {/* RIGHT */}

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-10
                        lg:col-span-2
                    "
                >

                    <StaffActiveStatus
                        name={
                            fullName
                        }
                        position={
                            position
                        }
                        isActive={
                            isActive
                        }
                    />


                    <StaffEditButtons
                        fullName={
                            fullName
                        }
                    />

                </div>

            </div>

        </div>
    );
}
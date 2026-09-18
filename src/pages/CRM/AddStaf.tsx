import {
    useState
} from 'react';

import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import {
    CircleAlert
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import StaffActive
    from '../../components/molecules/Crm/Staff/StaffAdd/StaffActive';

import StaffImage
    from '../../components/molecules/Crm/Staff/StaffAdd/StaffImage';

import StaffInfo
    from '../../components/molecules/Crm/Staff/StaffAdd/StaffInfo';

import StaffAddHeader
    from '../../components/organisms/Crm/Staff.tsx/StaffCreate/StaffAddHeader';

import Typography
    from '../../components/atoms/Typography';

import Button
    from '../../components/atoms/Button';

import Icon
    from '../../components/atoms/Icon';

import {
    staffAdd
} from '../../api/staff';

import {
    useBusiness
} from '../../context/BusinessContext';

import {
    getApiErrorMessage
} from '../../utils/getApiErrorMessage';


export default function AddStaf() {

    /*
     * ============================================================
     * FORM
     * ============================================================
     */

    const [
        isStaffActive,
        setIsStaffActive
    ] = useState(true);


    const [
        staffFirstName,
        setStaffFirstName
    ] = useState('');


    const [
        staffLastName,
        setStaffLastName
    ] = useState('');


    const [
        staffPosition,
        setStaffPosition
    ] = useState('');


    const [
        staffDescription,
        setStaffDescription
    ] = useState('');


    /*
     * ============================================================
     * PHOTO
     * ============================================================
     */

    const [
        staffPhoto,
        setStaffPhoto
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
     * BASIC
     * ============================================================
     */

    const {
        selectedBusiness
    } = useBusiness();


    const navigate =
        useNavigate();


    const queryClient =
        useQueryClient();


    /*
     * ============================================================
     * CREATE
     * ============================================================
     */

    const createStaff =
        useMutation({

            mutationFn: () => {

                if (
                    !selectedBusiness
                ) {

                    throw new Error(
                        'Бизнес не выбран.'
                    );
                }


                return staffAdd({

                    id:
                        Number(
                            selectedBusiness.id
                        ),

                    first_name:
                        staffFirstName.trim(),

                    last_name:
                        staffLastName.trim(),

                    position:
                        staffPosition.trim(),

                    is_active:
                        isStaffActive,

                    description:
                        staffDescription.trim(),

                    photo:
                        staffPhoto
                });
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

                    console.log(
                        'Создан мастер:',
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


                    /*
                     * Переходим только после
                     * успешного ответа backend.
                     */

                    navigate(
                        '/crm/staff'
                    );
                },


            onError:
                (
                    error
                ) => {

                    console.error(
                        'Ошибка создания мастера:',
                        error
                    );


                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Не удалось создать мастера.'
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
                createStaff.isPending
            ) {

                return;
            }


            setErrorMessage(
                ''
            );


            if (
                !selectedBusiness
            ) {

                setErrorMessage(
                    'Сначала выберите бизнес.'
                );

                return;
            }


            if (
                !staffFirstName.trim()
            ) {

                setErrorMessage(
                    'Введите имя мастера.'
                );

                return;
            }


            if (
                !staffPosition.trim()
            ) {

                setErrorMessage(
                    'Введите должность мастера.'
                );

                return;
            }


            createStaff.mutate();
        };


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div
            className="
                w-full
                mx-auto
            "
        >

            <StaffAddHeader />


            <div
                className="
                    flex
                    flex-col
                    md:flex-row
                    gap-10
                    py-5
                    items-start
                    w-full
                "
            >

                {/* LEFT */}

                <div
                    className="
                        flex
                        flex-col
                        gap-10
                        w-full
                        md:w-[300px]
                        shrink-0
                    "
                >

                    <StaffImage
                        photo={
                            staffPhoto
                        }
                        onChange={
                            setStaffPhoto
                        }
                    />


                    <StaffActive
                        isActive={
                            isStaffActive
                        }
                        onChange={
                            setIsStaffActive
                        }
                    />

                </div>


                {/* RIGHT */}

                <div
                    className="
                        flex
                        flex-col
                        gap-6
                        w-full
                        flex-1
                    "
                >

                    <StaffInfo
                        first_name={
                            staffFirstName
                        }
                        onNameChange={
                            setStaffFirstName
                        }
                        last_name={
                            staffLastName
                        }
                        onLastNameChange={
                            setStaffLastName
                        }
                        position={
                            staffPosition
                        }
                        onPositionChange={
                            setStaffPosition
                        }
                        description={
                            staffDescription
                        }
                        onDescriptionChange={
                            setStaffDescription
                        }
                    />


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

                            <Icon
                                icon={
                                    CircleAlert
                                }
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


                    {/* BUTTONS */}

                    <div
                        className="
                            flex
                            justify-end
                            gap-4
                            w-full
                        "
                    >

                        <Button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/crm/staff'
                                )
                            }
                            className="
                                px-7
                                py-3
                                rounded-xl
                                bg-[#E2E8FF]
                                hover:bg-[#D1DBFF]
                                transition-colors
                                cursor-pointer
                            "
                        >

                            <Typography
                                text="Отмена"
                                className="
                                    text-[#3B28CC]
                                    font-medium
                                    text-[15px]
                                "
                            />

                        </Button>


                        <Button
                            type="button"
                            onClick={
                                handleSave
                            }
                            disabled={
                                createStaff.isPending
                            }
                            className={`
                                px-8
                                py-3
                                rounded-xl
                                bg-[#3B28CC]
                                text-white
                                transition-colors
                                shadow-sm

                                ${
                                    createStaff.isPending
                                        ? `
                                            opacity-60
                                            cursor-not-allowed
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
                                    createStaff.isPending
                                        ? 'Сохранение...'
                                        : 'Сохранить'
                                }
                                className="
                                    text-white
                                    font-medium
                                    text-[15px]
                                "
                            />

                        </Button>

                    </div>

                </div>

            </div>

        </div>
    );
}
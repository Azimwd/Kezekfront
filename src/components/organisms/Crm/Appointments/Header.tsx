import {
    useEffect
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    Plus
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import Select, {
    type SelectOption
} from '../../../atoms/Select';

import Typography from '../../../atoms/Typography';
import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';

import {
    listAllBusinesses
} from '../../../../api/businesses';

import {
    useBusiness
} from '../../../../context/BusinessContext';


export default function Header() {

    /*
     * ============================================================
     * NAVIGATION
     * ============================================================
     */

    const navigate =
        useNavigate();


    /*
     * ============================================================
     * BUSINESS CONTEXT
     * ============================================================
     */

    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    /*
     * ============================================================
     * BUSINESSES
     * ============================================================
     */

    const {
        data: businessOptions = [],
        isPending: isBusinessesPending
    } = useQuery({

        queryKey: [
            'all-businesses'
        ],

        queryFn:
            listAllBusinesses,

        retry:
            false,

        select: (
            businesses
        ): SelectOption[] =>

            businesses.map(
                (
                    business
                ) => ({

                    id:
                        business.id,

                    label:
                        business.name

                })
            )

    });


    /*
     * ============================================================
     * AUTO SELECT BUSINESS
     * ============================================================
     */

    useEffect(
        () => {

            if (
                businessOptions.length === 0
            ) {
                return;
            }


            const selectedExists =
                selectedBusiness

                    ? businessOptions.some(
                        (
                            business
                        ) =>
                            String(
                                business.id
                            ) ===
                            String(
                                selectedBusiness.id
                            )
                    )

                    : false;


            if (
                !selectedExists
            ) {

                setSelectedBusiness(
                    businessOptions[0]
                );

            }

        },
        [
            businessOptions,
            selectedBusiness,
            setSelectedBusiness
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
                    text-sm
                    text-slate-500
                "
            >
                Загрузка бизнесов...
            </div>
        );

    }


    /*
     * ============================================================
     * CREATE APPOINTMENT
     * ============================================================
     */

    const handleCreateAppointment =
        () => {

            navigate(
                '/crm/appointments/create'
            );

        };


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
                flex-col
                items-start
                justify-between
                gap-5
                md:flex-row
                md:items-center
            "
        >

            {/* =====================================================
                LEFT
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                "
            >

                <Typography
                    text="Записи"
                    className="
                        mb-1
                        text-3xl
                        font-bold
                    "
                />


                <Typography
                    text="Управляйте бронированиями клиентов, статусами и переносом времени."
                    className="
                        text-sm
                        text-slate-500
                    "
                />

            </div>


            {/* =====================================================
                RIGHT
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    items-stretch
                    gap-5
                    sm:flex-row
                    sm:items-center
                "
            >

                {/* =================================================
                    BUSINESS SELECT
                ================================================= */}

                <div
                    className="
                        w-full
                        bg-white
                        sm:w-[250px]
                    "
                >

                    {businessOptions.length > 0 &&
                    selectedBusiness ? (

                        <Select
                            options={
                                businessOptions
                            }
                            value={
                                selectedBusiness
                            }
                            onChange={
                                setSelectedBusiness
                            }
                            className="
                                w-full
                                rounded-xl
                                border
                                border-[#c7c4d8]
                            "
                        />

                    ) : (

                        <div
                            className="
                                flex
                                h-11
                                items-center
                                rounded-xl
                                border
                                border-[#c7c4d8]
                                px-3
                                text-sm
                                text-slate-500
                            "
                        >
                            Нет бизнесов
                        </div>

                    )}

                </div>


                {/* =================================================
                    CREATE APPOINTMENT
                ================================================= */}

                <Button
                    onClick={
                        handleCreateAppointment
                    }
                    className="
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-[#4031d0]
                        bg-white
                        px-6
                        py-3
                        font-medium
                        text-[#4031d0]
                        transition-colors
                        hover:bg-[#F5F3FF]
                        active:bg-[#EDE9FE]
                        sm:w-auto
                    "
                >

                    <Icon
                        icon={
                            Plus
                        }
                        size={
                            20
                        }
                    />


                    <Typography
                        className="
                            mr-2
                            text-sm
                            font-medium
                        "
                        text="Создать запись"
                    />

                </Button>

            </div>

        </div>
    );
}
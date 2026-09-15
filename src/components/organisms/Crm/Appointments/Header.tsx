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
                business => ({
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
                businessOptions.length ===
                0
            ) {
                return;
            }


            const selectedExists =
                selectedBusiness
                    ? businessOptions.some(
                        business =>
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
                min-w-0
                flex-col
                gap-3

                sm:flex-row
                sm:items-center
                sm:justify-end
                sm:gap-4
            "
        >

            {/* =====================================================
                BUSINESS SELECT
            ===================================================== */}

            <div
                className="
                    w-full
                    min-w-0

                    sm:w-[250px]
                    sm:shrink-0
                "
            >

                {isBusinessesPending ? (

                    <div
                        className="
                            flex
                            h-[46px]
                            w-full
                            items-center
                            rounded-xl
                            border
                            border-[#c7c4d8]
                            bg-white
                            px-4
                            text-sm
                            text-slate-500
                        "
                    >
                        Загрузка бизнесов...
                    </div>

                ) : businessOptions.length > 0 &&
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
                            min-w-0
                            rounded-xl
                            border
                            border-[#c7c4d8]
                            bg-white
                        "
                    />

                ) : (

                    <div
                        className="
                            flex
                            h-[46px]
                            w-full
                            items-center
                            rounded-xl
                            border
                            border-[#c7c4d8]
                            bg-white
                            px-4
                            text-sm
                            text-slate-500
                        "
                    >
                        Нет бизнесов
                    </div>

                )}

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

                    sm:block
                "
            />


            {/* =====================================================
                CREATE APPOINTMENT
            ===================================================== */}

            <Button
                type="button"
                onClick={
                    handleCreateAppointment
                }
                className="
                    flex
                    h-[46px]
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#4031d0]
                    bg-white
                    px-5
                    text-[#4031d0]
                    transition-colors

                    hover:bg-[#F5F3FF]
                    active:bg-[#EDE9FE]

                    sm:w-auto
                    sm:shrink-0
                    sm:px-6
                "
            >

                <Icon
                    icon={
                        Plus
                    }
                    size={
                        20
                    }
                    className="
                        shrink-0
                        text-[#4031d0]
                    "
                />


                <Typography
                    text="Создать запись"
                    className="
                        whitespace-nowrap
                        text-sm
                        font-medium
                        text-[#4031d0]
                    "
                />

            </Button>

        </div>
    );
}
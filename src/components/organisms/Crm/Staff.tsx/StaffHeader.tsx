import {
    useNavigate
} from 'react-router-dom';

import {
    Plus
} from 'lucide-react';

import Button
    from '../../../atoms/Button';

import Icon
    from '../../../atoms/Icon';

import Typography
    from '../../../atoms/Typography';

import ServiceSelector
    from '../../../molecules/Crm/Services/ServiceSelector';


export default function StaffHeader() {

    const navigate =
        useNavigate();


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

            {/* SELECT */}

            <div
                className="
                    w-full
                    min-w-0

                    sm:w-auto
                "
            >
                <ServiceSelector />
            </div>


            {/* DIVIDER */}

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


            {/* ADD STAFF */}

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
                    px-5
                    py-3
                    text-white
                    shadow-sm
                    transition-colors
                    hover:bg-indigo-600

                    sm:w-auto
                    sm:shrink-0
                    sm:px-6
                "
                onClick={() =>
                    navigate(
                        '/crm/staff/add'
                    )
                }
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
                    text="Добавить мастера"
                    className="
                        whitespace-nowrap
                        text-sm
                        font-semibold
                        text-white
                    "
                />

            </Button>

        </div>
    );
}
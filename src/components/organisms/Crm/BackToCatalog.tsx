import {
    useNavigate
} from 'react-router-dom';

import {
    ArrowLeft
} from 'lucide-react';

import Button
    from '../../atoms/Button';

import Icon
    from '../../atoms/Icon';

import Typography
    from '../../atoms/Typography';


export default function Logout() {

    const navigate =
        useNavigate();


    const handleBack =
        () => {

            navigate(
                '/catalog'
            );
        };


    return (
        <Button
            type="button"
            onClick={
                handleBack
            }
            className="
                flex
                w-full
                cursor-pointer
                items-center
                gap-3
                rounded-xl
                bg-transparent
                px-4
                py-3
                text-[#4F46E5]
                transition-colors

                hover:bg-[#EEF2FF]
            "
        >
            <Icon
                icon={
                    ArrowLeft
                }
                size={
                    22
                }
            />

            <Typography
                className="
                    text-lg
                    font-medium
                "
                text="Назад"
            />
        </Button>
    );
}
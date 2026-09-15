import {
    useState,
    type ReactNode
} from 'react';

import {
    ChevronDown
} from 'lucide-react';

import Typography from '../../atoms/Typography';
import Icon from '../../atoms/Icon';


interface DropDownQueryProps {
    title: string;

    children: ReactNode;

    defaultOpen?: boolean;
}


export default function DropDownQuery({
    title,
    children,
    defaultOpen = true
}: DropDownQueryProps) {

    const [
        isOpen,
        setIsOpen
    ] = useState<boolean>(
        defaultOpen
    );


    const handleToggle =
        () => {

            setIsOpen(
                previous =>
                    !previous
            );
        };


    return (
        <div
            className="
                w-full
                min-w-0
            "
        >

            {/* HEADER */}

            <button
                type="button"

                onClick={
                    handleToggle
                }

                aria-expanded={
                    isOpen
                }

                className="
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    justify-between
                    gap-3
                    py-3
                    text-left
                    transition-colors
                "
            >

                <Typography
                    text={
                        title
                    }

                    className="
                        text-base
                        font-semibold
                        text-[#222222]
                    "
                />


                <div
                    className={`
                        shrink-0
                        transition-transform
                        duration-200

                        ${
                            isOpen
                                ? 'rotate-180'
                                : 'rotate-0'
                        }
                    `}
                >

                    <Icon
                        icon={
                            ChevronDown
                        }

                        size={
                            20
                        }

                        className="
                            text-[#6B7280]
                        "
                    />

                </div>

            </button>


            {/* CONTENT */}

            {isOpen && (

                <div
                    className="
                        w-full
                        min-w-0
                        pb-3
                    "
                >
                    {children}
                </div>

            )}

        </div>
    );
}
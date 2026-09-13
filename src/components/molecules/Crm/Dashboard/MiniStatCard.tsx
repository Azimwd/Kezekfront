import {
    Circle
} from 'lucide-react';

import type {
    LucideIcon
} from 'lucide-react';


interface MiniStatCardProps {
    title: string;
    value: string | number;

    icon?: LucideIcon;

    highlight?: boolean;
}


export default function MiniStatCard({
    title,
    value,
    icon,
    highlight = false
}: MiniStatCardProps) {

    /*
     * Если переданная иконка undefined,
     * используем безопасную стандартную иконку.
     */
    const Icon =
        icon ?? Circle;


    return (
        <div
            className={`
                min-h-[96px]
                rounded-2xl
                border
                p-4
                shadow-sm
                transition

                ${
                    highlight
                        ? `
                            border-[#C9D7FF]
                            bg-[#E8EFFF]
                        `
                        : `
                            border-[#E2E5EC]
                            bg-white
                        `
                }
            `}
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-3
                "
            >

                {/* VALUE + TITLE */}

                <div
                    className="
                        min-w-0
                    "
                >

                    <div
                        className={`
                            text-[26px]
                            font-bold
                            leading-none

                            ${
                                highlight
                                    ? 'text-[#4338CA]'
                                    : 'text-[#101828]'
                            }
                        `}
                    >
                        {value}
                    </div>


                    <div
                        className="
                            mt-2
                            text-[12px]
                            font-medium
                            text-[#667085]
                        "
                    >
                        {title}
                    </div>

                </div>


                {/* ICON */}

                <div
                    className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        ${
                            highlight
                                ? `
                                    bg-white/70
                                    text-[#4F46E5]
                                `
                                : `
                                    bg-[#F2F4F7]
                                    text-[#667085]
                                `
                        }
                    `}
                >

                    <Icon
                        size={17}
                        strokeWidth={1.8}
                    />

                </div>

            </div>

        </div>
    );
}
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
    const Icon =
        icon ?? Circle;


    return (
        <div
            className={`
                w-full
                min-w-0
                min-h-[92px]
                rounded-2xl
                border
                p-3.5
                shadow-sm
                transition

                sm:min-h-[96px]
                sm:p-4

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
                    min-w-0
                    items-start
                    justify-between
                    gap-2.5
                "
            >
                <div
                    className="
                        min-w-0
                        flex-1
                    "
                >
                    <div
                        className={`
                            break-words
                            text-[24px]
                            font-bold
                            leading-none

                            sm:text-[26px]

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
                            break-words
                            text-[11px]
                            font-medium
                            leading-4
                            text-[#667085]

                            sm:text-[12px]
                        "
                    >
                        {title}
                    </div>
                </div>


                <div
                    className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        sm:h-9
                        sm:w-9

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
                        size={16}
                        strokeWidth={1.8}
                    />
                </div>
            </div>
        </div>
    );
}

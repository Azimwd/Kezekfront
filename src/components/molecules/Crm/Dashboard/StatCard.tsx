import type {
    LucideIcon
} from 'lucide-react';


interface StatCardProps {
    title: string;

    value: string | number;

    subtitle?: string;

    icon: LucideIcon;

    variant?:
        | 'default'
        | 'orange'
        | 'green';
}


export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = 'default'
}: StatCardProps) {

    const isGreen =
        variant === 'green';


    return (
        <div
            className={`
                min-h-[108px]
                rounded-2xl
                border
                p-4
                shadow-sm

                ${
                    isGreen
                        ? `
                            border-[#D7E9DB]
                            bg-[#F2FBF4]
                        `
                        : `
                            border-[#D9DDEC]
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

                <div
                    className="
                        text-[12px]
                        font-medium
                        text-[#667085]
                    "
                >
                    {title}
                </div>


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
                            variant === 'orange'
                                ? `
                                    bg-[#FFF7ED]
                                    text-[#F97316]
                                `

                                : isGreen
                                    ? `
                                        bg-[#ECFDF3]
                                        text-[#16A34A]
                                    `

                                    : `
                                        bg-[#EEF2FF]
                                        text-[#4F46E5]
                                    `
                        }
                    `}
                >
                    <Icon
                        size={17}
                    />
                </div>

            </div>


            <div
                className="
                    mt-3
                    flex
                    items-end
                    gap-2
                "
            >

                <span
                    className={`
                        text-[32px]
                        font-bold
                        leading-none

                        ${
                            isGreen
                                ? 'text-[#166534]'
                                : 'text-[#101828]'
                        }
                    `}
                >
                    {value}
                </span>


                {subtitle && (

                    <span
                        className="
                            mb-1
                            text-[11px]
                            text-[#98A2B3]
                        "
                    >
                        {subtitle}
                    </span>

                )}

            </div>

        </div>
    );
}
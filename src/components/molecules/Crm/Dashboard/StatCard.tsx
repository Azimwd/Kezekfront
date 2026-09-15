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


    const accentColor =
        variant === 'orange'
            ? 'bg-[#F59E0B]'
            : isGreen
                ? 'bg-[#10B981]'
                : 'bg-[#4F46E5]';


    return (
        <div
            className={`
                relative
                w-full
                min-w-0
                min-h-[116px]
                overflow-hidden
                rounded-2xl
                border
                shadow-sm

                sm:min-h-[125px]

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
                className={`
                    absolute
                    inset-x-0
                    top-0
                    h-[4px]
                    ${accentColor}
                `}
            />


            <div
                className="
                    flex
                    min-h-[116px]
                    min-w-0
                    flex-col
                    px-4
                    pb-4
                    pt-5

                    sm:min-h-[125px]
                "
            >
                <div
                    className="
                        flex
                        min-w-0
                        items-start
                        justify-between
                        gap-3
                    "
                >
                    <div
                        className="
                            min-w-0
                            flex-1
                            break-words
                            text-[13px]
                            font-medium
                            leading-5
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
                            size={18}
                        />
                    </div>
                </div>


                <div
                    className="
                        mt-auto
                        min-w-0
                        pt-3
                    "
                >
                    <div
                        className={`
                            break-words
                            text-[30px]
                            font-bold
                            leading-none

                            sm:text-[32px]

                            ${
                                isGreen
                                    ? 'text-[#166534]'
                                    : 'text-[#101828]'
                            }
                        `}
                    >
                        {value}
                    </div>


                    {subtitle && (
                        <div
                            className="
                                mt-2
                                break-words
                                text-[11px]
                                leading-4
                                text-[#98A2B3]
                            "
                        >
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

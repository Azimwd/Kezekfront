import type {
    LucideIcon
} from 'lucide-react';


interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;

    icon: LucideIcon;

    variant?:
        | 'blue'
        | 'orange'
        | 'green'
        | 'purple';

    badge?: string;
}


const variants = {
    blue: {
        wrapper:
            'bg-white border-[#D9DDED]',

        icon:
            'bg-[#EEF2FF] text-[#4F46E5]'
    },

    orange: {
        wrapper:
            'bg-white border-[#D9DDED]',

        icon:
            'bg-orange-50 text-orange-500'
    },

    green: {
        wrapper:
            'bg-[#F3FBF5] border-[#D8EBDD]',

        icon:
            'bg-green-100 text-green-600'
    },

    purple: {
        wrapper:
            'bg-white border-[#D9DDED]',

        icon:
            'bg-purple-50 text-purple-500'
    }
};


export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = 'blue',
    badge
}: StatCardProps) {

    const styles =
        variants[variant];


    return (
        <div
            className={`
                relative
                min-h-[102px]
                rounded-2xl
                border
                p-4
                shadow-sm
                ${styles.wrapper}
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

                <div>

                    <div
                        className="
                            text-[11px]
                            font-medium
                            text-slate-500
                        "
                    >
                        {title}
                    </div>


                    <div
                        className="
                            mt-2
                            flex
                            items-end
                            gap-2
                        "
                    >

                        <span
                            className="
                                text-[30px]
                                font-bold
                                leading-none
                                text-[#0F172A]
                            "
                        >
                            {value}
                        </span>


                        {subtitle && (
                            <span
                                className="
                                    pb-0.5
                                    text-[10px]
                                    text-slate-400
                                "
                            >
                                {subtitle}
                            </span>
                        )}

                    </div>


                    {badge && (
                        <div
                            className="
                                mt-2
                                inline-flex
                                rounded-md
                                bg-orange-50
                                px-1.5
                                py-0.5
                                text-[9px]
                                font-medium
                                text-orange-500
                            "
                        >
                            {badge}
                        </div>
                    )}

                </div>


                <div
                    className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        ${styles.icon}
                    `}
                >
                    <Icon
                        size={16}
                    />
                </div>

            </div>

        </div>
    );
}
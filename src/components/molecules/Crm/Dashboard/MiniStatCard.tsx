import type {
    LucideIcon
} from 'lucide-react';


interface MiniStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;

    highlight?: boolean;
}


export default function MiniStatCard({
    title,
    value,
    icon: Icon,
    highlight = false
}: MiniStatCardProps) {

    return (
        <div
            className={`
                rounded-2xl
                border
                p-4

                ${
                    highlight
                        ? `
                            border-[#CEDBFF]
                            bg-[#E9F0FF]
                        `
                        : `
                            border-[#E6E8F0]
                            bg-white
                        `
                }
            `}
        >

            <Icon
                size={15}
                className={
                    highlight
                        ? 'text-[#4F46E5]'
                        : 'text-slate-500'
                }
            />


            <div
                className="
                    mt-2
                    text-xl
                    font-bold
                    text-[#0F172A]
                "
            >
                {value}
            </div>


            <div
                className="
                    mt-0.5
                    text-[10px]
                    text-slate-400
                "
            >
                {title}
            </div>

        </div>
    );
}
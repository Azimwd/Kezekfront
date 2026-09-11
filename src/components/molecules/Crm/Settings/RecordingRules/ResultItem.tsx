import type {
    ReactNode
} from 'react';


interface Props {
    icon: ReactNode;
    children: ReactNode;
}


export default function ResultItem({
    icon,
    children
}: Props) {
    return (
        <div className="flex items-start gap-3 text-xs leading-relaxed">

            <div
                className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/15
                "
            >
                {icon}
            </div>


            <div className="pt-1">
                {children}
            </div>

        </div>
    );
}
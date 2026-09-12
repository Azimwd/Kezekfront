import { Search } from 'lucide-react';

interface SearchbarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function Searchbar({
    value,
    onChange
}: SearchbarProps) {
    return (
        <div className="relative w-full sm:max-w-[320px]">
            <Search
                size={18}
                className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    pointer-events-none
                "
            />

            <input
                type="text"
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                placeholder="Поиск специалиста..."
                className="
                    w-full
                    rounded-xl
                    border
                    border-[#c7c4d8]
                    bg-white
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#4F46E5]
                    focus:ring-1
                    focus:ring-[#4F46E5]
                "
            />
        </div>
    );
}
import type {
    StaffStatus
} from '../../../organisms/Crm/Staff.tsx/StaffControl';


interface FilterProps {
    value: StaffStatus;

    onChange: (
        value: StaffStatus
    ) => void;
}


export default function Filter({
    value,
    onChange
}: FilterProps) {
    return (
        <div className="flex items-center gap-2">

            <button
                type="button"
                onClick={() =>
                    onChange(
                        'all'
                    )
                }
                className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition

                    ${
                        value === 'all'
                            ? 'bg-[#4F46E5] text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                    }
                `}
            >
                Все
            </button>


            <button
                type="button"
                onClick={() =>
                    onChange(
                        'active'
                    )
                }
                className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition

                    ${
                        value === 'active'
                            ? 'bg-[#4F46E5] text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                    }
                `}
            >
                Активные
            </button>


            <button
                type="button"
                onClick={() =>
                    onChange(
                        'inactive'
                    )
                }
                className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition

                    ${
                        value === 'inactive'
                            ? 'bg-[#4F46E5] text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                    }
                `}
            >
                Отключённые
            </button>

        </div>
    );
}
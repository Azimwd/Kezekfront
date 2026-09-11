import { useState } from 'react';

import Select, {
    type SelectOption
} from '../../../atoms/Select';


const businessOptions: SelectOption[] = [
    {
        id: 1,
        label: 'Prime Barber Almaty'
    },
    {
        id: 2,
        label: 'Beauty Studio'
    }
];


export default function BusinessHeaderSelect() {
    const [
        selectedBusiness,
        setSelectedBusiness
    ] = useState<SelectOption>(
        businessOptions[0]
    );


    return (
        <div className="flex items-end gap-3">

            <div>
                <div className="mb-1.5 text-right text-xs font-medium text-slate-500">
                    Выбранный бизнес
                </div>

                <Select
                    options={businessOptions}
                    value={selectedBusiness}
                    onChange={setSelectedBusiness}
                    className="
                        w-[250px]
                        rounded-xl
                        border
                        border-[#c7c4d8]
                        bg-white
                    "
                />
            </div>


            <div
                className="
                    mb-1
                    flex
                    h-9
                    items-center
                    gap-2
                    rounded-full
                    bg-emerald-50
                    px-4
                    text-xs
                    font-semibold
                    text-emerald-600
                "
            >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                Активен
            </div>

        </div>
    );
}
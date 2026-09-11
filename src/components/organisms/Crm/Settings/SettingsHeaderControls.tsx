import { useEffect } from 'react';

import Select, {
    type SelectOption
} from '../../../atoms/Select';

import { useBusiness } from '../../../../context/BusinessContext';


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


export default function SettingsHeaderControls() {
    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    useEffect(() => {
        if (
            !selectedBusiness &&
            businessOptions.length > 0
        ) {
            setSelectedBusiness(
                businessOptions[0]
            );
        }
    }, [
        selectedBusiness,
        setSelectedBusiness
    ]);


    const currentBusiness =
        selectedBusiness ??
        businessOptions[0];


    return (
        <div className="flex items-end gap-3">

            <div className="w-[250px]">


                <Select
                    options={businessOptions}
                    value={currentBusiness}
                    onChange={
                        setSelectedBusiness
                    }
                    className="
                        w-full
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
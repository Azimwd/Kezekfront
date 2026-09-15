import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { listAllBusinesses } from '../../../../api/businesses';

import Select from '../../../atoms/Select';

import { useBusiness } from '../../../../context/BusinessContext';


export default function ServiceSelector() {
    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    const {
        data: businessOptions = [],
        isLoading
    } = useQuery({
        queryKey: ['all-businesses'],
        queryFn: listAllBusinesses,
        retry: false,

        select: (businesses) =>
            businesses.map((business) => ({
                id: business.id,
                label: business.name
            }))
    });


    useEffect(() => {
        if (businessOptions.length === 0) {
            return;
        }

        const selectedExists = selectedBusiness
            ? businessOptions.some(
                  (business) =>
                      String(business.id) ===
                      String(selectedBusiness.id)
              )
            : false;

        if (!selectedExists) {
            setSelectedBusiness(
                businessOptions[0]
            );
        }
    }, [
        businessOptions,
        selectedBusiness,
        setSelectedBusiness
    ]);


    if (
        isLoading ||
        !selectedBusiness
    ) {
        return (
            <div
                className="
                    flex
                    h-[46px]
                    w-full
                    items-center
                    rounded-2xl
                    border
                    border-[#c7c4d8]
                    bg-[#eff4ff]
                    px-4
                    text-sm
                    text-slate-500

                    sm:w-[200px]
                "
            >
                Загрузка...
            </div>
        );
    }


    return (
        <div
            className="
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-[#eff4ff]

                transition-colors

                focus-within:border-[#4F46E5]
                focus-within:ring-1
                focus-within:ring-[#4F46E5]/20

                sm:w-[200px]
                sm:shrink-0
            "
        >
            <Select
                options={businessOptions}
                value={selectedBusiness}
                onChange={setSelectedBusiness}
                className="
                    w-full
                    min-w-0
                "
            />
        </div>
    );
}
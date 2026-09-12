import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
    listAllBusinesses
} from '../../../../api/businesses';

import Select from '../../../atoms/Select';

import {
    useBusiness
} from '../../../../context/BusinessContext';


export default function ServiceSelector() {
    const {
        selectedBusiness,
        setSelectedBusiness
    } = useBusiness();


    const {
        data: businessOptions = [],
        isLoading
    } = useQuery({
        queryKey: [
            'all-businesses'
        ],

        queryFn: listAllBusinesses,

        retry: false,

        select: (businesses) =>
            businesses.map(
                (business) => ({
                    id: business.id,
                    label: business.name
                })
            )
    });


    useEffect(() => {
        if (
            businessOptions.length === 0
        ) {
            return;
        }


        const selectedExists =
            selectedBusiness
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
            <div className="p-3 text-sm text-slate-500">
                Загрузка...
            </div>
        );
    }


    return (
        <div
            className="
                flex
                w-full
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-[#eff4ff]
            "
        >
            <Select
                options={
                    businessOptions
                }
                value={
                    selectedBusiness
                }
                onChange={
                    setSelectedBusiness
                }
                className="w-[200px]"
            />
        </div>
    );
}
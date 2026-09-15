import {
    useMemo
} from 'react';

import {
    useQuery
} from '@tanstack/react-query';

import {
    MapPin
} from 'lucide-react';

import Select, {
    type SelectOption
} from '../../atoms/Select';

import {
    getCatalogCities,
    type CatalogCity
} from '../../../api/catalog';


interface LocationSelectProps {
    value: number | null;

    onChange: (
        cityId: number | null
    ) => void;
}


export default function LocationSelect({
    value,
    onChange
}: LocationSelectProps) {

    const {
        data: cities = [],
        isLoading
    } = useQuery<
        CatalogCity[],
        Error
    >({
        queryKey: [
            'catalog-cities'
        ],

        queryFn:
            getCatalogCities,

        retry:
            false
    });


    const cityOptions =
        useMemo<
            SelectOption[]
        >(
            () => [

                {
                    id: 0,
                    label:
                        isLoading
                            ? 'Загрузка...'
                            : 'Все города'
                },

                ...cities.map(
                    (
                        city:
                            CatalogCity
                    ): SelectOption => ({
                        id:
                            city.id,

                        label:
                            city.name
                    })
                )

            ],
            [
                cities,
                isLoading
            ]
        );


    const selectedOption =
        cityOptions.find(
            option =>
                Number(
                    option.id
                ) ===
                Number(
                    value ?? 0
                )
        ) ??
        cityOptions[0];


    const handleCityChange = (
        option:
            SelectOption
    ) => {

        const cityId =
            Number(
                option.id
            );


        onChange(
            cityId === 0
                ? null
                : cityId
        );
    };


    return (
        <Select
            options={
                cityOptions
            }

            value={
                selectedOption
            }

            onChange={
                handleCityChange
            }

            leftIcon={
                MapPin
            }

            className="
                w-full
                rounded-xl
                md:w-44
            "
        />
    );
}
import Icon from '../../atoms/Icon';
import Input from '../../atoms/Input';

import {
    MapPin,
    Search,
    ChevronDown
} from 'lucide-react';


export interface CatalogCityOption {
    id: number;
    name: string;
}


interface SearchBarProps {
    value: string;

    onChange: (
        value: string
    ) => void;

    cities: CatalogCityOption[];

    selectedCityId:
        number | null;

    onCityChange: (
        cityId:
            number | null
    ) => void;
}


export default function SearchBar({
    value,
    onChange,
    cities,
    selectedCityId,
    onCityChange
}: SearchBarProps) {

    return (
        <div
            className="
                flex
                w-full
                min-w-0
                flex-col
                gap-3

                sm:flex-row
            "
        >

            {/* SEARCH */}

            <div
                className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    rounded-xl
                    border
                    border-[#c7c4d8]
                    bg-[#F7F8FD]
                    px-4
                    py-3
                    transition-all

                    focus-within:border-[#4F46E5]
                    focus-within:ring-1
                    focus-within:ring-[#4F46E5]
                "
            >

                <Icon
                    icon={
                        Search
                    }

                    size={
                        18
                    }

                    className="
                        shrink-0
                        text-[#64748B]
                    "
                />


                <Input
                    type="text"

                    placeholder="Например: Мужская стрижка"

                    value={
                        value
                    }

                    onChange={
                        event =>
                            onChange(
                                event.target.value
                            )
                    }

                    className="
                        ml-3
                        min-w-0
                        flex-1
                        bg-transparent
                        text-sm
                        text-[#1E293B]
                    "
                />

            </div>


            {/* CITY */}

            <div
                className="
                    relative
                    w-full
                    shrink-0

                    sm:w-[180px]
                    md:w-[200px]
                "
            >

                {/* LOCATION ICON */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        left-0
                        z-10
                        flex
                        items-center
                        pl-3
                    "
                >

                    <Icon
                        icon={
                            MapPin
                        }

                        size={
                            17
                        }

                        className="
                            text-[#64748B]
                        "
                    />

                </div>


                {/* SELECT */}

                <select
                    value={
                        selectedCityId ??
                        ''
                    }

                    onChange={
                        event => {

                            const value =
                                event.target.value;


                            onCityChange(
                                value
                                    ? Number(
                                          value
                                      )
                                    : null
                            );
                        }
                    }

                    className="
                        h-full
                        min-h-[46px]
                        w-full
                        cursor-pointer
                        appearance-none
                        rounded-xl
                        border
                        border-[#c7c4d8]
                        bg-[#F7F8FD]
                        py-3
                        pl-10
                        pr-10
                        text-sm
                        font-medium
                        text-[#1E293B]
                        outline-none
                        transition-all

                        focus:border-[#4F46E5]
                        focus:ring-1
                        focus:ring-[#4F46E5]
                    "
                >

                    <option value="">
                        Все города
                    </option>


                    {cities.map(
                        city => (

                            <option
                                key={
                                    city.id
                                }

                                value={
                                    city.id
                                }
                            >
                                {
                                    city.name
                                }
                            </option>

                        )
                    )}

                </select>


                {/* ARROW */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        right-0
                        flex
                        items-center
                        pr-3
                    "
                >

                    <Icon
                        icon={
                            ChevronDown
                        }

                        size={
                            16
                        }

                        className="
                            text-[#64748B]
                        "
                    />

                </div>

            </div>

        </div>
    );
}
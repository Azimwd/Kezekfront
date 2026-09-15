import {
    useState
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import {
    ArrowRight
} from 'lucide-react';

import Button from '../../atoms/Button';
import Icon from '../../atoms/Icon';
import Typography from '../../atoms/Typography';

import Searchbar from '../../molecules/Home/Searchbar';
import LocationSelect from '../../molecules/Home/LocationSelect';


export default function GlobalSearchBar() {

    const navigate =
        useNavigate();


    const [
        search,
        setSearch
    ] =
        useState<string>(
            ''
        );


    const [
        selectedCityId,
        setSelectedCityId
    ] =
        useState<
            number | null
        >(
            null
        );


    /*
     * ============================================================
     * FIND
     * ============================================================
     */

    const handleFind =
        () => {

            const params =
                new URLSearchParams();


            const preparedSearch =
                search.trim();


            if (
                preparedSearch
            ) {

                params.set(
                    'search',
                    preparedSearch
                );
            }


            if (
                selectedCityId !==
                null
            ) {

                params.set(
                    'city',
                    String(
                        selectedCityId
                    )
                );
            }


            const query =
                params.toString();


            navigate(
                query
                    ? `/catalog?${query}`
                    : '/catalog'
            );
        };


    return (
        <div
            className="
                flex
                w-full
                max-w-5xl
                flex-col
                items-center
                gap-3
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-transparent
                p-3
                shadow-xl

                md:flex-row
                md:gap-5
            "
        >

            {/* SEARCH */}

            <div
                className="
                    w-full
                    flex-1
                "
            >

                <Searchbar
                    placeholder="Например: Мужская стрижка"

                    value={
                        search
                    }

                    onChange={
                        setSearch
                    }

                    onSearch={
                        handleFind
                    }

                    className="
                        w-full
                    "
                />

            </div>


            {/* CITY + BUTTON */}

            <div
                className="
                    flex
                    w-full
                    gap-3

                    md:w-auto
                    md:shrink-0
                "
            >

                <div
                    className="
                        flex
                        flex-1
                        items-center

                        md:flex-none
                    "
                >

                    <LocationSelect
                        value={
                            selectedCityId
                        }

                        onChange={
                            setSelectedCityId
                        }
                    />

                </div>


                <Button
                    onClick={
                        handleFind
                    }

                    className="
                        flex
                        flex-1
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#4F46E5]
                        px-4

                        hover:bg-[#3731aa]

                        md:flex-none
                        md:px-10
                    "
                >

                    <Typography
                        text="Найти"

                        className="
                            text-md
                            text-white
                        "
                    />


                    <Icon
                        icon={
                            ArrowRight
                        }

                        className="
                            text-white
                        "
                    />

                </Button>

            </div>

        </div>
    );
}
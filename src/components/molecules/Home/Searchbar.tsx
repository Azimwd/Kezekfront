import {
    useEffect,
    useState,
    type FormEvent
} from 'react';

import {
    Search
} from 'lucide-react';

import {
    useLocation,
    useNavigate,
    useSearchParams
} from 'react-router-dom';

import Icon from '../../atoms/Icon';
import Input from '../../atoms/Input';


interface SearchbarProps {
    placeholder: string;

    className?: string;

    value?: string;

    onChange?: (
        value: string
    ) => void;

    onSearch?: (
        value: string
    ) => void;

    onSubmitted?: () => void;
}


export default function Searchbar({
    placeholder,
    className = '',
    value,
    onChange,
    onSearch,
    onSubmitted
}: SearchbarProps) {

    const navigate =
        useNavigate();


    const location =
        useLocation();


    const [
        searchParams
    ] =
        useSearchParams();


    const searchFromUrl =
        searchParams.get(
            'search'
        ) ?? '';


    const [
        localSearch,
        setLocalSearch
    ] =
        useState<string>(
            location.pathname ===
                '/catalog'
                ? searchFromUrl
                : ''
        );


    const isControlled =
        value !== undefined;


    const currentValue =
        isControlled
            ? value
            : localSearch;


    /*
     * Header синхронизируется
     * с поиском каталога.
     */

    useEffect(
        () => {

            if (
                isControlled
            ) {
                return;
            }


            if (
                location.pathname ===
                '/catalog'
            ) {

                setLocalSearch(
                    searchFromUrl
                );

            } else {

                setLocalSearch(
                    ''
                );
            }

        },
        [
            isControlled,
            location.pathname,
            searchFromUrl
        ]
    );


    const handleChange = (
        newValue: string
    ) => {

        if (
            isControlled
        ) {

            onChange?.(
                newValue
            );

            return;
        }


        setLocalSearch(
            newValue
        );
    };


    const handleSubmit = (
        event:
            FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        const preparedSearch =
            currentValue.trim();


        /*
         * На главной GlobalSearchBar
         * передаёт собственную функцию.
         */

        if (
            onSearch
        ) {

            onSearch(
                preparedSearch
            );

            onSubmitted?.();

            return;
        }


        /*
         * Header.
         */

        const params =
            new URLSearchParams();


        if (
            preparedSearch
        ) {

            params.set(
                'search',
                preparedSearch
            );
        }


        const query =
            params.toString();


        navigate(
            query
                ? `/catalog?${query}`
                : '/catalog'
        );


        onSubmitted?.();
    };


    return (
        <form
            onSubmit={
                handleSubmit
            }

            className={`
                flex
                w-full
                min-w-0
                ${className}
            `}
        >

            <div
                className="
                    flex
                    w-full
                    min-w-0
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-[#E2E8F0]
                    bg-white
                    px-4
                    py-3
                    transition-all

                    focus-within:border-indigo-500
                    focus-within:ring-1
                    focus-within:ring-indigo-500
                "
            >

                <button
                    type="submit"

                    aria-label="Найти"

                    className="
                        flex
                        shrink-0
                        cursor-pointer
                        items-center
                        justify-center
                        text-[#64748B]
                        transition-colors

                        hover:text-[#4F46E5]
                    "
                >

                    <Icon
                        icon={
                            Search
                        }

                        size={
                            20
                        }
                    />

                </button>


                <Input
                    type="text"

                    placeholder={
                        placeholder
                    }

                    value={
                        currentValue
                    }

                    onChange={
                        event =>
                            handleChange(
                                event.target.value
                            )
                    }

                    className="
                        w-full
                        min-w-0
                        border-none
                        bg-transparent
                        p-0
                        text-[15px]
                        text-[#1E293B]
                        outline-none
                        focus:ring-0
                    "
                />

            </div>

        </form>
    );
}
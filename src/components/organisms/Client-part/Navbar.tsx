import { useState } from 'react';
import {
    NavLink,
    useNavigate
} from 'react-router-dom';

import {
    Menu,
    X
} from 'lucide-react';

import Typography
    from '../../atoms/Typography';

import Searchbar
    from '../../molecules/Home/Searchbar';

import {
    logout
} from '../../../api/auth';

import {
    useUser
} from '../../../context/UserContext';


const navigation = [
    {
        id: 1,
        NavLink: '/catalog',
        Typography: 'Каталог'
    },
    {
        id: 2,
        NavLink: '/favorites',
        Typography: 'Избранное'
    },
    {
        id: 3,
        NavLink: '/my-bookings',
        Typography: 'Мои Брони'
    }
];


export default function Navbar() {

    const [
        isMenuOpen,
        setIsMenuOpen
    ] = useState(false);


    const {
        user,
        setUser
    } = useUser();


    const navigate =
        useNavigate();


    /*
     * ============================================================
     * LOGOUT
     * ============================================================
     */

    const handleLogout =
        async () => {

            try {

                await logout();


                setUser(
                    null
                );


                setIsMenuOpen(
                    false
                );


                navigate(
                    '/'
                );

            } catch (
                error
            ) {

                console.error(
                    'Ошибка выхода:',
                    error
                );
            }
        };


    /*
     * ============================================================
     * CLOSE MOBILE MENU
     * ============================================================
     */

    const closeMenu =
        () => {

            setIsMenuOpen(
                false
            );
        };


    return (
        <header
            className="
                w-full
                border-b
                border-[#EEF0F5]
                bg-white
            "
        >

            <div
                className="
                    mx-auto
                    flex
                    w-full
                    max-w-[1600px]
                    flex-col
                    px-4
                    py-3

                    sm:px-6

                    lg:px-10
                    lg:py-4

                    xl:px-16
                "
            >

                {/* =====================================================
                    MAIN ROW
                ===================================================== */}

                <div
                    className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-4
                    "
                >

                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-4

                            lg:gap-8
                            xl:gap-12
                        "
                    >

                        {/* LOGO */}

                        <NavLink
                            to="/"

                            onClick={
                                closeMenu
                            }

                            className="
                                shrink-0
                                cursor-pointer
                            "
                        >

                            <Typography
                                text="Kezek.kz"

                                className="
                                    select-none
                                    text-2xl
                                    font-bold
                                    tracking-tight
                                    text-[#4F46E5]

                                    md:text-3xl
                                "
                            />

                        </NavLink>


                        {/* DESKTOP SEARCH */}

                        <div
                            className="
                                hidden
                                w-[320px]
                                lg:block
                                xl:w-[420px]
                            "
                        >

                            <Searchbar
                                placeholder="Поиск услуг..."
                            />

                        </div>

                    </div>


                    {/* =================================================
                        DESKTOP RIGHT
                    ================================================= */}

                    <div
                        className="
                            hidden
                            items-center
                            gap-8

                            lg:flex

                            xl:gap-12
                        "
                    >

                        {/* NAVIGATION */}

                        <nav
                            className="
                                flex
                                items-center
                                gap-6
                            "
                        >

                            {navigation.map(
                                item => (

                                    <NavLink
                                        key={
                                            item.id
                                        }

                                        to={
                                            item.NavLink
                                        }

                                        className={({
                                            isActive
                                        }) => `
                                            border-b-2
                                            pb-1
                                            transition-colors

                                            ${
                                                isActive
                                                    ? `
                                                        border-[#4F46E5]
                                                        text-[#4F46E5]
                                                    `
                                                    : `
                                                        border-transparent
                                                        text-[#858585]
                                                        hover:border-[#4F46E5]
                                                        hover:text-[#4F46E5]
                                                    `
                                            }
                                        `}
                                    >

                                        <Typography
                                            text={
                                                item.Typography
                                            }

                                            className="
                                                select-none
                                                whitespace-nowrap
                                                text-base
                                                font-medium
                                                tracking-tight

                                                xl:text-lg
                                            "
                                        />

                                    </NavLink>

                                )
                            )}


                            {/* BUSINESS OWNER */}

                            {user?.role ===
                                'business_owner' && (

                                <NavLink
                                    to="/crm/dashboard"

                                    className={({
                                        isActive
                                    }) => `
                                        border-b-2
                                        pb-1
                                        transition-colors

                                        ${
                                            isActive
                                                ? `
                                                    border-[#4F46E5]

                                                `
                                                : `
                                                    border-transparent

                                                    hover:border-[#4F46E5]
                                                `
                                        }
                                    `}
                                >

                                    <Typography
                                        text="Панель управления"

                                        className="
                                            select-none
                                            whitespace-nowrap
                                            text-base
                                            font-medium
                                            tracking-tight

                                            xl:text-lg
                                        "
                                    />

                                </NavLink>

                            )}

                        </nav>


                        {/* LOGIN / LOGOUT */}

                        {user ? (

                            <button
                                type="button"

                                onClick={
                                    handleLogout
                                }

                                className="
                                    cursor-pointer
                                    border-b-2
                                    border-transparent
                                    pb-1
                                    text-[#4F46E5]
                                    transition-colors
                                    hover:border-[#4F46E5]
                                "
                            >

                                <Typography
                                    text="Выйти"

                                    className="
                                        select-none
                                        whitespace-nowrap
                                        text-base
                                        font-medium
                                        tracking-tight

                                        xl:text-lg
                                    "
                                />

                            </button>

                        ) : (

                            <NavLink
                                to="/auth/login"

                                className="
                                    border-b-2
                                    border-transparent
                                    pb-1
                                    text-[#4F46E5]
                                    transition-colors
                                    hover:border-[#4F46E5]
                                "
                            >

                                <Typography
                                    text="Начать"

                                    className="
                                        select-none
                                        whitespace-nowrap
                                        text-base
                                        font-medium
                                        tracking-tight

                                        xl:text-lg
                                    "
                                />

                            </NavLink>

                        )}

                    </div>


                    {/* =================================================
                        MOBILE BURGER
                    ================================================= */}

                    <button
                        type="button"

                        onClick={() =>
                            setIsMenuOpen(
                                previous =>
                                    !previous
                            )
                        }

                        aria-label={
                            isMenuOpen
                                ? 'Закрыть меню'
                                : 'Открыть меню'
                        }

                        aria-expanded={
                            isMenuOpen
                        }

                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-[#E5E7EB]
                            bg-white
                            text-[#4F46E5]
                            transition-colors
                            hover:bg-[#F8F9FF]

                            lg:hidden
                        "
                    >

                        {isMenuOpen ? (

                            <X
                                size={
                                    25
                                }
                            />

                        ) : (

                            <Menu
                                size={
                                    25
                                }
                            />

                        )}

                    </button>

                </div>


                {/* =====================================================
                    MOBILE MENU
                ===================================================== */}

                {isMenuOpen && (

                    <div
                        className="
                            mt-4
                            flex
                            w-full
                            flex-col
                            gap-5
                            border-t
                            border-[#EEF0F5]
                            pt-4

                            lg:hidden
                        "
                    >

                        {/* MOBILE SEARCH */}

                        <div
                            className="
                                w-full
                            "
                        >

                            <Searchbar
                                placeholder="Поиск услуг..."
                            />

                        </div>


                        {/* MOBILE NAVIGATION */}

                        <nav
                            className="
                                flex
                                w-full
                                flex-col
                                gap-2
                            "
                        >

                            {navigation.map(
                                item => (

                                    <NavLink
                                        key={
                                            item.id
                                        }

                                        to={
                                            item.NavLink
                                        }

                                        onClick={
                                            closeMenu
                                        }

                                        className={({
                                            isActive
                                        }) => `
                                            flex
                                            w-full
                                            items-center
                                            rounded-xl
                                            px-4
                                            py-3
                                            transition-colors

                                            ${
                                                isActive
                                                    ? `
                                                        bg-[#EEF2FF]
                                                        text-[#4F46E5]
                                                    `
                                                    : `
                                                        text-[#4B5563]
                                                        hover:bg-[#F8F9FF]
                                                        hover:text-[#4F46E5]
                                                    `
                                            }
                                        `}
                                    >

                                        <Typography
                                            text={
                                                item.Typography
                                            }

                                            className="
                                                text-base
                                                font-medium
                                            "
                                        />

                                    </NavLink>

                                )
                            )}


                            {/* BUSINESS OWNER */}

                            {user?.role ===
                                'business_owner' && (

                                <NavLink
                                    to="/crm/dashboard"

                                    onClick={
                                        closeMenu
                                    }

                                    className={({
                                        isActive
                                    }) => `
                                        flex
                                        w-full
                                        items-center
                                        rounded-xl
                                        px-4
                                        py-3
                                        transition-colors

                                        ${
                                            isActive
                                                ? `
                                                    bg-[#EEF2FF]
                                                    text-[#4F46E5]
                                                `
                                                : `
                                                    text-[#4F46E5]
                                                    hover:bg-[#F8F9FF]
                                                `
                                        }
                                    `}
                                >

                                    <Typography
                                        text="Панель управления"

                                        className="
                                            text-base
                                            font-medium
                                        "
                                    />

                                </NavLink>

                            )}

                        </nav>


                        {/* DIVIDER */}

                        <div
                            className="
                                h-px
                                w-full
                                bg-[#EEF0F5]
                            "
                        />


                        {/* MOBILE LOGIN / LOGOUT */}

                        <div
                            className="
                                w-full
                                pb-2
                            "
                        >

                            {user ? (

                                <button
                                    type="button"

                                    onClick={
                                        handleLogout
                                    }

                                    className="
                                        flex
                                        w-full
                                        cursor-pointer
                                        items-center
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-left
                                        text-[#4F46E5]
                                        transition-colors
                                        hover:bg-[#F8F9FF]
                                    "
                                >

                                    <Typography
                                        text="Выйти"

                                        className="
                                            text-base
                                            font-medium
                                        "
                                    />

                                </button>

                            ) : (

                                <NavLink
                                    to="/auth/login"

                                    onClick={
                                        closeMenu
                                    }

                                    className="
                                        flex
                                        w-full
                                        items-center
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-[#4F46E5]
                                        transition-colors
                                        hover:bg-[#F8F9FF]
                                    "
                                >

                                    <Typography
                                        text="Начать"

                                        className="
                                            text-base
                                            font-medium
                                        "
                                    />

                                </NavLink>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </header>
    );
}
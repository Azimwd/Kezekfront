import {
    Outlet,
    useLocation
} from 'react-router-dom';

import {
    LayoutDashboard,
    Building2,
    CalendarDays,
    Layers,
    Users,
    Settings,
    MessageSquareText,
    CalendarClock
} from 'lucide-react';

import Sidebar
    from '../../organisms/Crm/Sidebar';

import Header
    from '../../organisms/Crm/Header';

import BusinessHeader
    from '../../organisms/Crm/Businesses/BusinessHeader';

import ServicesHeader
    from '../../organisms/Crm/Services/ServicesHeader';

import StaffHeader
    from '../../organisms/Crm/Staff.tsx/StaffHeader';

import SettingsHeaderControls
    from '../../organisms/Crm/Settings/SettingsHeaderControls';

import {
    BusinessProvider
} from '../../../context/BusinessContext';


const navigationData = [
    {
        id: 1,
        navigator: 'dashboard',
        label: 'Дашборд',
        icon: LayoutDashboard
    },

    {
        id: 2,
        navigator: 'appointments',
        label: 'Записи',
        icon: CalendarDays
    },

    {
        id: 3,
        navigator: 'my-businesses',
        label: 'Мои бизнесы',
        icon: Building2,
        rightElement: (
            <BusinessHeader />
        )
    },

    {
        id: 4,
        navigator: 'staff',
        label: 'Персонал',
        icon: Users,
        rightElement: (
            <StaffHeader />
        )
    },

    {
        id: 5,
        navigator: 'services',
        label: 'Услуги',
        icon: Layers,
        rightElement: (
            <ServicesHeader />
        )
    },

    {
        id: 6,
        navigator: 'schedule',
        label: 'График работы',
        icon: CalendarClock
    },

    {
        id: 7,
        navigator: 'settings',
        label: 'Настройки',
        icon: Settings,
        rightElement: (
            <SettingsHeaderControls />
        )
    },

    {
        id: 8,
        navigator: 'reviews',
        label: 'Отзывы',
        icon: MessageSquareText
    }
];


export default function Crm() {
    const location =
        useLocation();


    /*
     * ============================================================
     * ACTIVE PAGE
     * ============================================================
     */

    const activeItem =
        navigationData.find(
            item =>
                location.pathname.includes(
                    item.navigator
                )
        );


    const headerLabel =
        activeItem
            ? activeItem.label
            : 'Дашборд';


    const headerRightElement =
        activeItem?.rightElement;


    /*
     * ============================================================
     * PAGE TYPES
     * ============================================================
     */

    const isSettingsPage =
        location.pathname.includes(
            'settings'
        );


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <BusinessProvider>

            <main
                className="
                    relative
                    flex
                    h-dvh
                    min-h-dvh
                    w-full
                    min-w-0
                    overflow-hidden
                    bg-[#f8f9ff]
                "
            >

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside
                    className="
                        fixed
                        inset-y-0
                        left-0
                        z-50
                        h-dvh
                        max-h-dvh

                        md:static
                        md:z-auto
                        md:h-full
                        md:flex-none
                        md:overflow-y-auto
                        md:border-r
                        md:border-[#c7c4d8]
                    "
                >
                    <Sidebar
                        navigationItems={
                            navigationData
                        }
                    />
                </aside>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div
                    className="
                        flex
                        h-full
                        w-full
                        min-w-0
                        flex-1
                        flex-col
                        overflow-hidden

                        md:w-auto
                    "
                >

                    {/* =============================================
                        HEADER
                    ============================================= */}

                    <header
                        className="
                            relative
                            z-20
                            w-full
                            min-w-0
                            shrink-0
                            bg-white
                        "
                    >
                        <Header
                            label={
                                headerLabel
                            }
                            rightElement={
                                headerRightElement
                            }
                        />
                    </header>


                    {/* =============================================
                        PAGE CONTENT
                    ============================================= */}

                    <section
                        className={`
                            min-w-0
                            flex-1
                            overflow-x-hidden
                            overflow-y-auto

                            ${
                                isSettingsPage
                                    ? `
                                        p-0
                                    `
                                    : `
                                        px-4
                                        py-5

                                        sm:px-5
                                        sm:py-6

                                        md:px-7
                                        md:py-7

                                        lg:px-10
                                        lg:py-9
                                    `
                            }
                        `}
                    >
                        <div
                            className="
                                w-full
                                min-w-0
                                max-w-full
                            "
                        >
                            <Outlet />
                        </div>
                    </section>

                </div>

            </main>
        </BusinessProvider>
    );
}
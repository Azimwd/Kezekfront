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

import Sidebar from '../../organisms/Crm/Sidebar';
import Header from '../../organisms/Crm/Header';

import BusinessHeader from '../../organisms/Crm/Businesses/BusinessHeader';
import ServicesHeader from '../../organisms/Crm/Services/ServicesHeader';
import StaffHeader from '../../organisms/Crm/Staff.tsx/StaffHeader';

import SettingsHeaderControls from '../../organisms/Crm/Settings/SettingsHeaderControls';

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
        label: 'Назначения',
        icon: CalendarDays
    },

    {
        id: 3,
        navigator: 'my-businesses',
        label: 'Мои бизнесы',
        icon: Building2,
        rightElement: <BusinessHeader />
    },

    {
        id: 4,
        navigator: 'staff',
        label: 'Персонал',
        icon: Users,
        rightElement: <StaffHeader />
    },

    {
        id: 5,
        navigator: 'services',
        label: 'Услуги',
        icon: Layers,
        rightElement: <ServicesHeader />
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

        // ВОТ ЗДЕСЬ ДОБАВИЛИ
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


    const activeItem =
        navigationData.find(
            (item) =>
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


    const isSettingsPage =
        location.pathname.includes(
            'settings'
        );


    return (
        <BusinessProvider>

            <main
                className="
                    flex
                    h-screen
                    w-full
                    overflow-hidden
                    bg-[#f8f9ff]
                "
            >

                {/* SIDEBAR */}

                <aside
                    className="
                        flex-none
                        h-full
                        overflow-y-auto
                        border-r
                        border-[#c7c4d8]
                    "
                >
                    <Sidebar
                        navigationItems={
                            navigationData
                        }
                    />
                </aside>


                {/* RIGHT SIDE */}

                <div
                    className="
                        flex
                        h-full
                        min-w-0
                        flex-1
                        flex-col
                        overflow-hidden
                    "
                >

                    {/* HEADER */}

                    <header className="shrink-0">

                        <Header
                            label={
                                headerLabel
                            }
                            rightElement={
                                headerRightElement
                            }
                        />

                    </header>


                    {/* PAGE CONTENT */}

                    <section
                        className={`
                            flex-1
                            overflow-y-auto
                            ${
                                isSettingsPage
                                    ? 'p-0'
                                    : 'py-9 px-10'
                            }
                        `}
                    >
                        <Outlet />
                    </section>

                </div>

            </main>

        </BusinessProvider>
    );
}
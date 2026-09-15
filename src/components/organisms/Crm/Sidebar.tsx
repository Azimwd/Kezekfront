import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../molecules/Crm/Logo';
import Typography from '../../atoms/Typography';
import Icon from '../../atoms/Icon';
import { Menu, LogOut, type LucideIcon } from 'lucide-react';
import Logout from './BackToCatalog';

export interface NavType {
    id: number;
    navigator: string;
    label: string;
    icon: LucideIcon;
}

interface SideBarProps {
    navigationItems: NavType[];
}

export default function Sidebar({ navigationItems }: SideBarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openSidebar = () => setIsOpen(true);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {!isOpen && (
                <button
                    onClick={openSidebar}
                    className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white text-[#222222] rounded-xl shadow-md border border-gray-100 transition-opacity"
                >
                    <Icon icon={Menu} size={24} />
                </button>
            )}

            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            <div
                className={`
                    fixed md:static inset-y-0 left-0 z-50 w-80 bg-white h-full py-6 px-6 
                    transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                    md:translate-x-0 md:shadow-none
                `}
            >
                <div className="flex flex-col items-start px-4 mt-12 md:mt-0 mb-14 shrink-0">
                    <Logo />
                </div>

                <div className="flex flex-col gap-3 w-full overflow-y-auto flex-1">
                    {navigationItems.map((item) => (
                        <nav key={item.id} className="w-full">
                            <NavLink
                                to={item.navigator}
                                onClick={closeSidebar}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 w-full rounded-xl gap-3 transition-colors ${
                                        isActive
                                            ? 'bg-[#4F46E5] text-white'
                                            : 'bg-transparent text-[#222222] hover:bg-[#4F46E5] hover:text-white'
                                    }`
                                }
                            >
                                <Icon icon={item.icon} size={24} />
                                <Typography
                                    className="text-lg font-medium"
                                    text={item.label}
                                />
                            </NavLink>
                        </nav>
                    ))}
                </div>

                <div className="w-full mt-auto pt-6 shrink-0">
                    <Logout />
                </div>
            </div>
        </>
    );
}

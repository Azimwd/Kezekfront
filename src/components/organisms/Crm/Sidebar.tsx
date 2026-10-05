import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CircleHelp,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import Logo from "../../molecules/Crm/Logo";
import Icon from "../../atoms/Icon";
import BackToCatalog from "./BackToCatalog";
import { useBusiness } from "../../../context/BusinessContext";
import { BUSINESS_LIST_PATH } from "../../../utils/crmPaths";
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
  const { selectedBusiness } = useBusiness();
  const location = useLocation();
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [isOpen]);
  return (
    <>
      {!isOpen && (
        <button
          type="button"
          aria-label="Открыть меню CRM"
          aria-expanded={false}
          onClick={() => setIsOpen(true)}
          className="fixed left-3 top-4 z-50 rounded-xl border border-gray-100 bg-white p-2 text-[#222222] shadow-md md:hidden"
        >
          <Menu size={24} />
        </button>
      )}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-80 max-w-[100vw] flex-col bg-white px-6 py-6 transition-transform duration-300 md:static md:translate-x-0 ${isOpen ? "translate-x-0 shadow-2xl" : "invisible -translate-x-full md:visible"}`}
      >
        <div className="mb-6 flex shrink-0 items-center justify-between px-4">
          <Logo />
          <button
            type="button"
            aria-label="Закрыть меню CRM"
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 text-slate-500 md:hidden"
          >
            <X size={24} />
          </button>
        </div>
        {selectedBusiness && (
          <div className="mb-5 shrink-0">
            <Link
              to={BUSINESS_LIST_PATH}
              className="mb-3 flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-[#6c667e] hover:bg-[#f6f4ff]"
              onClick={() => setIsOpen(false)}
            >
              <ArrowLeft size={16} />
              Все бизнесы
            </Link>
            <div className="flex items-center gap-3 rounded-2xl border border-[#e7e3f0] bg-[#f6f4ff] p-4">
              <Building2 className="shrink-0 text-[#4F46E5]" size={22} />
              <div className="min-w-0">
                <p className="text-xs text-[#8b8499]">Кабинет бизнеса</p>
                <p className="mt-1 break-words text-sm font-semibold text-[#30295c]">
                  {selectedBusiness.label}
                </p>
              </div>
            </div>
          </div>
        )}
        <nav
          data-tour="workspace-menu"
          aria-label={
            selectedBusiness
              ? `Разделы бизнеса ${selectedBusiness.label}`
              : "Управление бизнесами"
          }
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.navigator}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isActive ? "bg-[#4F46E5] text-white" : "text-[#222222] hover:bg-[#f1efff] hover:text-[#4F46E5]"}`
              }
            >
              <Icon icon={item.icon} size={23} />
              <span className="text-base font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto w-full shrink-0 pt-6">
          {selectedBusiness && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new Event("kezek:tour:restart"));
              }}
              className="mb-3 flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-[#6c667e] hover:bg-[#f6f4ff]"
            >
              <CircleHelp size={18} />
              Обучение по кабинету
            </button>
          )}
          <BackToCatalog />
        </div>
      </div>
    </>
  );
}

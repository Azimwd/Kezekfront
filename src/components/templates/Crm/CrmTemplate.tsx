import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Layers,
  Users,
  Settings,
  MessageSquareText,
  CalendarClock,
  BarChart3,
  Images,
} from "lucide-react";
import Sidebar from "../../organisms/Crm/Sidebar";
import Header from "../../organisms/Crm/Header";
import FreePeriodBanner from "../../organisms/Crm/FreePeriod/FreePeriodBanner";
import ServicesHeader from "../../organisms/Crm/Services/ServicesHeader";
import StaffHeader from "../../organisms/Crm/Staff.tsx/StaffHeader";
import { useBusiness } from "../../../context/BusinessContext";
import { businessPath, BUSINESS_LIST_PATH } from "../../../utils/crmPaths";

const sections = [
  {
    id: 1,
    navigator: "dashboard",
    label: "Панель управления",
    icon: LayoutDashboard,
  },
  { id: 2, navigator: "appointments", label: "Записи", icon: CalendarDays },
  { id: 4, navigator: "staff", label: "Персонал", icon: Users },
  { id: 5, navigator: "services", label: "Услуги", icon: Layers },
  { id: 10, navigator: "gallery", label: "Галерея работ", icon: Images },
  { id: 6, navigator: "schedule", label: "График работы", icon: CalendarClock },
  { id: 7, navigator: "settings", label: "Настройки бизнеса", icon: Settings },
  { id: 8, navigator: "reviews", label: "Отзывы", icon: MessageSquareText },
  { id: 9, navigator: "analytics", label: "Аналитика", icon: BarChart3 },
];
export default function CrmTemplate() {
  const location = useLocation();
  const { selectedBusiness } = useBusiness();
  const section = location.pathname.split("/")[4];
  const activeItem = sections.find((item) => item.navigator === section);
  const isList = location.pathname.replace(/\/+$/, "") === BUSINESS_LIST_PATH;
  const navigation = selectedBusiness
    ? sections.map((item) => ({
        ...item,
        navigator: businessPath(selectedBusiness.id, item.navigator),
      }))
    : [
        {
          id: 3,
          navigator: BUSINESS_LIST_PATH,
          label: "Мои бизнесы",
          icon: Building2,
        },
      ];
  const isSectionRoot =
    location.pathname ===
    (selectedBusiness ? businessPath(selectedBusiness.id, section) : "");
  const rightElement =
    selectedBusiness && isSectionRoot ? (
      section === "staff" ? (
        <StaffHeader />
      ) : section === "services" ? (
        <ServicesHeader />
      ) : undefined
    ) : undefined;
  return (
    <main className="relative flex h-dvh min-h-dvh w-full min-w-0 overflow-hidden bg-[#f8f9ff]">
      {!isList && (
        <aside className="contents md:block md:h-full md:flex-none md:border-r md:border-[#c7c4d8]">
          <Sidebar navigationItems={navigation} />
        </aside>
      )}
      <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden md:w-auto">
        {!isList && (
          <header className="relative z-20 w-full min-w-0 shrink-0 bg-white">
            <Header
              showSidebar={!isList}
              label={
                isList
                  ? "Мои бизнесы"
                  : selectedBusiness
                    ? (activeItem?.label ?? "Кабинет бизнеса")
                    : "CRM"
              }
              rightElement={rightElement}
            />
          </header>
        )}
        <section
          data-crm-scroll
          className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto ${section === "settings" && selectedBusiness ? "p-0" : "px-4 py-5 sm:px-5 sm:py-6 md:px-7 md:py-7 lg:px-10 lg:py-9"}`}
        >
          <div className="w-full min-w-0 max-w-full">
            <FreePeriodBanner />
            <Outlet key={selectedBusiness?.id ?? "business-list"} />
          </div>
        </section>
      </div>
    </main>
  );
}

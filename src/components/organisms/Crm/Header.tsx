import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useBusiness } from "../../../context/BusinessContext";
import { BUSINESS_LIST_PATH, businessPath } from "../../../utils/crmPaths";
const descriptions: Record<string, string> = {
  "Панель управления": "Ключевые показатели и ближайшие записи вашего бизнеса",
  "Мои бизнесы":
    "Откройте бизнес, чтобы управлять его записями, услугами и командой",
  Записи: "Расписание, записи клиентов и предстоящие встречи",
  Услуги: "Настройте услуги, стоимость и назначенных мастеров",
  Персонал: "Сотрудники, графики работы и права доступа",
  "График работы": "Рабочее время, перерывы и свободные слоты специалистов",
  "Настройки бизнеса": "Правила записи и параметры выбранного бизнеса",
  Отзывы: "Оценки клиентов и ответы на их комментарии",
  Аналитика: "Показатели бизнеса за выбранный период и экспорт в Excel",
};
export default function Header({
  label,
  rightElement,
  showSidebar = true,
}: {
  label: string;
  rightElement?: ReactNode;
  showSidebar?: boolean;
}) {
  const { selectedBusiness } = useBusiness();
  return (
    <div
      className={`flex w-full flex-col items-start justify-between gap-4 border-b border-[#c7c4d8] bg-white py-4 ${showSidebar ? "pl-16 pr-5" : "px-4 sm:px-5"} md:px-8 lg:flex-row lg:items-center lg:gap-5 lg:px-10 lg:py-5`}
    >
      <div className="min-w-0 flex-1">
        {!showSidebar && (
          <Link
            to="/catalog"
            className="mb-2 inline-flex items-center gap-2 rounded-md text-sm font-medium text-[#4F46E5] hover:text-[#4031d0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F46E5]"
          >
            <ArrowLeft size={16} aria-hidden="true" />В каталог
          </Link>
        )}
        {selectedBusiness && (
          <nav
            data-tour="workspace-context"
            aria-label="Путь в CRM"
            className="mb-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8b8499]"
          >
            <Link to={BUSINESS_LIST_PATH} className="hover:text-[#4F46E5]">
              Мои бизнесы
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={businessPath(selectedBusiness.id)}
              className="break-words font-medium text-[#6950b9]"
            >
              {selectedBusiness.label}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{label}</span>
          </nav>
        )}
        <h1 className="text-2xl font-bold text-[#222222] lg:text-3xl">
          {label}
        </h1>
        {descriptions[label] && (
          <p className="mt-1 text-sm text-[#6d6d6d] md:text-base">
            {descriptions[label]}
          </p>
        )}
      </div>
      {rightElement && (
        <div className="w-full shrink-0 lg:w-auto">{rightElement}</div>
      )}
    </div>
  );
}

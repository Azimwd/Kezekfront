import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  FilePenLine,
  ShieldAlert,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useBusiness } from "../../context/BusinessContext";
import BusinessCard from "../../components/organisms/Crm/Businesses/BusinessCard";
import BusinessHeader from "../../components/organisms/Crm/Businesses/BusinessHeader";
import NewBusiness from "../../components/molecules/Crm/Businesses/NewBusiness";

const PAGE_SIZE = 9;

export default function Mybusinesses() {
  const {
    businesses,
    isBusinessesPending,
    isBusinessesFetching,
    businessesError,
    refetchBusinesses,
  } = useBusiness();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const cities = useMemo(
    () =>
      Array.from(
        new Map(
          businesses
            .filter((b) => b.city_name)
            .map((b) => [
              String(b.city),
              { id: String(b.city), name: b.city_name },
            ]),
        ).values(),
      ).sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [businesses],
  );
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("ru");
    return businesses.filter(
      (b) =>
        (!city || String(b.city) === city) &&
        (!status || b.status === status) &&
        (!term ||
          [b.name, b.address, b.city_name, b.phone].some((value) =>
            (value ?? "").toLocaleLowerCase("ru").includes(term),
          )),
    );
  }, [businesses, search, city, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(offset, offset + PAGE_SIZE);
  const active = businesses.filter((b) => b.status === "active").length;
  const stats = [
    {
      title: "Всего бизнесов",
      count: businesses.length,
      icon: Building2,
      value: "",
      note: businesses.length
        ? `${Math.round((active / businesses.length) * 100)}% активных`
        : "Начните с первого бизнеса",
      tone: "text-[#6554ed] bg-[#eeebff]",
    },
    {
      title: "Активные",
      count: active,
      icon: CheckCircle2,
      value: "active",
      note: "Опубликованы",
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Черновики",
      count: businesses.filter((b) => b.status === "draft").length,
      icon: FilePenLine,
      value: "draft",
      note: "Ещё не опубликованы",
      tone: "text-amber-600 bg-amber-50",
    },
    {
      title: "Заблокированные",
      count: businesses.filter((b) => b.status === "blocked").length,
      icon: ShieldAlert,
      value: "blocked",
      note: "Доступ ограничен",
      tone: "text-rose-500 bg-rose-50",
    },
  ];
  const resetFilters = () => {
    setSearch("");
    setCity("");
    setStatus("");
    setPage(1);
  };
  const setFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) =>
      Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + index,
  );

  return (
    <div className="mx-auto flex w-full max-w-[1280px] min-w-0 flex-col gap-7 sm:gap-8">
      <nav
        aria-label="Навигация страницы бизнесов"
        className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
      >
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 rounded-lg py-1 text-[#6554ed] hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
        >
          <ArrowLeft size={16} aria-hidden="true" />В каталог
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("kezek:tour:restart"))}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg py-1 text-[#7a8197] hover:text-[#6554ed]"
        >
          <BookOpen size={16} aria-hidden="true" />
          Руководство по запуску бизнеса
        </button>
      </nav>
      <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 xl:max-w-[330px] xl:shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#202840] sm:text-3xl">
            Мои бизнесы
          </h1>
          <p className="mt-2 max-w-[400px] text-sm leading-6 text-[#7a8197]">
            Откройте бизнес, чтобы управлять его записями, услугами и командой
          </p>
        </div>
        <BusinessHeader
          search={search}
          onSearchChange={setFilter(setSearch)}
          city={city}
          onCityChange={setFilter(setCity)}
          cities={cities}
          status={status}
          onStatusChange={setFilter(setStatus)}
        />
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
          {stats.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setStatus(item.value);
                setPage(1);
              }}
              aria-pressed={status === item.value}
              aria-label={`Показать: ${item.title.toLocaleLowerCase("ru")}`}
              className={`flex min-w-0 cursor-pointer flex-col rounded-2xl border bg-white/60 p-4 text-left transition hover:border-[#d2cbff] hover:bg-white sm:p-5 ${status === item.value ? "border-[#dcd6ff]" : "border-[#ecedf5]"}`}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="text-xs leading-5 text-[#7a8197] sm:text-sm">
                  {item.title}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.tone}`}
                >
                  <item.icon size={17} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl font-bold tabular-nums text-[#202840]">
                  {isBusinessesPending || businessesError ? "—" : item.count}
                </span>
                <span className="text-xs leading-5 text-[#7a8197]">
                  {isBusinessesPending
                    ? "Загрузка…"
                    : businessesError
                      ? "Данные недоступны"
                      : item.note}
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#9a9fb1]">По всем вашим бизнесам</p>
      </div>
      <section
        aria-label="Ваши бизнесы"
        aria-busy={isBusinessesFetching}
        className="min-w-0"
      >
        {isBusinessesPending ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <p role="status" className="sr-only">
              Загрузка бизнесов...
            </p>
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                aria-hidden="true"
                className="h-[420px] animate-pulse rounded-2xl border border-[#ecedf5] bg-[#eeeff8]"
              />
            ))}
          </div>
        ) : businessesError ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-100 bg-white p-8 text-center"
          >
            <p className="font-medium text-[#202840]">
              Не удалось загрузить бизнесы
            </p>
            <p className="mt-2 text-sm text-[#7a8197]">Попробуйте ещё раз.</p>
            <button
              type="button"
              onClick={refetchBusinesses}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-medium text-white"
            >
              <RotateCcw size={16} />
              Повторить
            </button>
          </div>
        ) : (
          <>
            {filtered.length === 0 && (
              <div
                role="status"
                className="mb-5 rounded-2xl border border-dashed border-[#dedbef] bg-white/40 p-6 text-center"
              >
                <h2 className="font-semibold text-[#202840]">
                  {businesses.length
                    ? "Бизнесы не найдены"
                    : "Ваш первый бизнес начинается здесь"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#7a8197]">
                  {businesses.length
                    ? "Попробуйте другое название или измените фильтры."
                    : "Добавьте бизнес, укажите направления услуг и настройте свой кабинет."}
                </p>
                {businesses.length > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-sm font-medium text-[#6554ed] hover:text-indigo-700"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            )}
            <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
              <NewBusiness appearance="card" showHelpLink={false} />
            </div>
            {filtered.length > 0 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#ecedf5] pt-5 sm:flex-row">
                <p className="text-xs text-[#8a90a5] sm:text-sm">
                  Показано {offset + 1}–
                  {Math.min(offset + PAGE_SIZE, filtered.length)} из{" "}
                  {filtered.length} бизнесов
                  {isBusinessesFetching ? " · Обновление…" : ""}
                </p>
                {totalPages > 1 && (
                  <nav
                    aria-label="Страницы бизнесов"
                    className="flex items-center gap-1.5"
                  >
                    <button
                      type="button"
                      aria-label="Предыдущая страница"
                      disabled={currentPage <= 1}
                      onClick={() => setPage(currentPage - 1)}
                      className="rounded-lg border border-[#e5e4f0] bg-white p-2 text-[#7a8197] disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        type="button"
                        aria-current={
                          number === currentPage ? "page" : undefined
                        }
                        onClick={() => setPage(number)}
                        className={`h-9 min-w-9 rounded-lg text-sm font-medium ${number === currentPage ? "bg-[#4F46E5] text-white" : "bg-white text-[#7a8197] hover:bg-indigo-50"}`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="Следующая страница"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage(currentPage + 1)}
                      className="rounded-lg border border-[#e5e4f0] bg-white p-2 text-[#7a8197] disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </nav>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

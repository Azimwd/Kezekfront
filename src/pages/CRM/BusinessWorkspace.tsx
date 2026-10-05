import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useBusiness } from "../../context/BusinessContext";
import { BUSINESS_LIST_PATH, businessPath } from "../../utils/crmPaths";

export function BusinessLoading() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[#e7e3f0] bg-white p-6 text-slate-500"
    >
      Загружаем ваши бизнесы…
    </div>
  );
}
export function BusinessLoadError() {
  const { refetchBusinesses } = useBusiness();
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-800"
    >
      <p>Не удалось загрузить бизнесы. Попробуйте ещё раз.</p>
      <button
        type="button"
        onClick={refetchBusinesses}
        className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-2"
      >
        Повторить
      </button>
    </div>
  );
}
export default function BusinessWorkspace() {
  const {
    selectedBusiness,
    isBusinessesPending,
    isBusinessesFetching,
    businessesError,
  } = useBusiness();
  if (isBusinessesPending || (!selectedBusiness && isBusinessesFetching))
    return <BusinessLoading />;
  if (businessesError) return <BusinessLoadError />;
  if (!selectedBusiness)
    return (
      <div className="rounded-2xl border border-[#e7e3f0] bg-white p-6">
        <h1 className="text-xl font-semibold">Бизнес недоступен</h1>
        <p className="mt-2 text-slate-500">
          Бизнес не найден или у вас нет доступа к нему.
        </p>
        <Link
          to={BUSINESS_LIST_PATH}
          className="mt-4 inline-flex rounded-xl bg-[#4F46E5] px-5 py-3 text-white"
        >
          Все бизнесы
        </Link>
      </div>
    );
  return <Outlet key={String(selectedBusiness.id)} />;
}
export function CrmEntry({ legacySection }: { legacySection?: string }) {
  const {
    businesses,
    lastBusinessId,
    isBusinessesPending,
    isBusinessesFetching,
    businessesError,
  } = useBusiness();
  const location = useLocation();
  if (isBusinessesPending || isBusinessesFetching) return <BusinessLoading />;
  if (businessesError) return <BusinessLoadError />;
  const business =
    businesses.find((item) => item.id === lastBusinessId) ??
    (businesses.length === 1 ? businesses[0] : null);
  if (!business) return <Navigate to={BUSINESS_LIST_PATH} replace />;
  return (
    <Navigate
      to={`${businessPath(business.id, legacySection || "dashboard")}${location.search}${location.hash}`}
      replace
    />
  );
}
export function MissingBusinessPage() {
  const { selectedBusiness } = useBusiness();
  return (
    <div className="rounded-2xl border border-[#e7e3f0] bg-white p-6">
      <h1 className="text-xl font-semibold">Страница не найдена</h1>
      <Link
        className="mt-4 inline-block text-indigo-600 underline"
        to={
          selectedBusiness
            ? businessPath(selectedBusiness.id)
            : BUSINESS_LIST_PATH
        }
      >
        Вернуться в кабинет
      </Link>
    </div>
  );
}

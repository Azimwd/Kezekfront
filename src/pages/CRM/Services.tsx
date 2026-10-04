import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "../../context/BusinessContext";
import { categoryPath } from "../../api/categories";
import { updateBusinessDirections } from "../../api/businesses";
import {
  getServiceLibrary,
  setServiceState,
  type LibraryRow,
} from "../../api/serviceLibrary";
import BusinessCategoryPicker from "../../components/molecules/Crm/Businesses/BusinessCategoryPicker";
import { deleteService, type ServiceItem } from "../../api/services";
import NewService from "../../components/molecules/Crm/Services/NewService";
import EditService from "../../components/molecules/Crm/Services/EditService";
function apiError(error: unknown): string {
  const collect = (v: unknown): string[] =>
    typeof v === "string"
      ? [v]
      : Array.isArray(v)
        ? v.flatMap(collect)
        : v && typeof v === "object"
          ? Object.values(v).flatMap(collect)
          : [];
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return (
    collect(data).join(" ") ||
    "Не удалось сохранить изменения. Попробуйте ещё раз."
  );
}
const control =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const button =
  "rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50";
export default function Services() {
  const { selectedBusiness } = useBusiness();
  if (!selectedBusiness)
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
        Выберите бизнес, чтобы настроить услуги.
      </div>
    );
  return (
    <ServiceLibrary
      key={String(selectedBusiness.id)}
      businessKey={selectedBusiness.id}
      businessId={Number(selectedBusiness.id)}
    />
  );
}
function ServiceLibrary({
  businessId,
  businessKey,
}: {
  businessId: number;
  businessKey: string | number;
}) {
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [config, setConfig] = useState<LibraryRow | "new" | null>(null);
  const [editDirections, setEditDirections] = useState(false);
  const [directions, setDirections] = useState<number[]>([]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);
  const query = useQuery({
    queryKey: [
      "services",
      businessKey,
      "library",
      debounced,
      category,
      active,
      page,
    ],
    queryFn: ({ signal }) =>
      getServiceLibrary(
        businessId,
        {
          page,
          search: debounced,
          category: category ? Number(category) : undefined,
          active,
        },
        signal,
      ),
  });
  const refresh = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ["services", businessKey] }),
      cache.invalidateQueries({ queryKey: ["businesses"] }),
      cache.invalidateQueries({ queryKey: ["booking-services", businessId] }),
    ]);
  };
  const toggle = useMutation({
    mutationFn: (row: LibraryRow) => {
      if (!row.service) throw new Error("Нужны настройки услуги");
      return setServiceState(row.service.id, !row.is_active);
    },
    onMutate: () => setError(""),
    onSuccess: async () => {
      setPage(1);
      await refresh();
    },
    onError: (error) => setError(apiError(error)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteService(id),
    onMutate: () => {
      setError("");
      setNotice("");
    },
    onSuccess: async (result) => {
      setNotice(result.message || "Услуга удалена.");
      setDeleteTarget(null);
      setPage(1);
      await refresh();
    },
    onError: (error) => setError(apiError(error)),
  });
  const saveDirections = useMutation({
    mutationFn: () => updateBusinessDirections(businessId, directions),
    onSuccess: async () => {
      setEditDirections(false);
      setCategory("");
      setPage(1);
      await refresh();
    },
    onError: (error) => setError(apiError(error)),
  });
  useEffect(() => {
    const apiData = (
      query.error as { response?: { data?: { page?: unknown } } } | null
    )?.response?.data;
    if (page > 1 && apiData?.page) setPage(1);
  }, [page, query.error]);
  const data = query.data;
  const onToggle = (row: LibraryRow) => {
    const validStaff = new Set(data?.staff.map((s) => s.id));
    if (
      !row.service ||
      (!row.is_active &&
        !row.service.assigned_staff_ids?.some((id) => validStaff.has(id)))
    ) {
      setConfig(row);
      setError("");
    } else toggle.mutate(row);
  };
  const groups = new Map<string, LibraryRow[]>();
  data?.data.forEach((row) =>
    groups.set(row.category_path, [
      ...(groups.get(row.category_path) ?? []),
      row,
    ]),
  );
  return (
    <div className="space-y-5 text-slate-800">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-medium">Направления бизнеса</span>
            <p className="mt-1 text-slate-500">
              {data?.business_categories.length
                ? data.categories
                    .filter((c) => data.business_categories.includes(c.id))
                    .map((c) => c.name)
                    .join(", ")
                : "Выберите направления для библиотеки шаблонов."}
            </p>
          </div>
          <button
            type="button"
            className={button}
            disabled={!data || saveDirections.isPending}
            onClick={() => {
              setDirections(data?.business_categories ?? []);
              setEditDirections(!editDirections);
              setError("");
            }}
          >
            {editDirections ? "Скрыть" : "Настроить направления"}
          </button>
        </div>
        {editDirections && (
          <div className="mt-4 space-y-3">
            <BusinessCategoryPicker
              value={directions}
              onChange={setDirections}
              disabled={saveDirections.isPending}
            />
            <p className="text-xs text-slate-500">
              Ваши существующие услуги останутся доступны при смене направлений.
            </p>
            <button
              type="button"
              disabled={!directions.length || saveDirections.isPending}
              className={`${button} bg-indigo-600 text-white`}
              onClick={() => saveDirections.mutate()}
            >
              {saveDirections.isPending
                ? "Сохраняем…"
                : "Сохранить направления"}
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Поиск услуг"
          className={`${control} min-w-48 flex-1`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Название услуги или ключевое слово"
        />
        <select
          aria-label="Категория услуг"
          className={`${control} sm:max-w-xs`}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Все категории</option>
          {data?.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryPath(c, data.categories)}
            </option>
          ))}
        </select>
        <select
          aria-label="Статус услуг"
          className={`${control} sm:max-w-48`}
          value={active}
          onChange={(e) => {
            setActive(e.target.value as typeof active);
            setPage(1);
          }}
        >
          <option value="all">Все статусы</option>
          <option value="true">Включены</option>
          <option value="false">Выключены</option>
        </select>
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {notice}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {query.isPending && (
        <p role="status" className="py-6 text-sm text-slate-500">
          Загружаем библиотеку услуг…
        </p>
      )}
      {query.isError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          Не удалось загрузить библиотеку.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => query.refetch()}
          >
            Повторить
          </button>
        </div>
      )}
      {data && (
        <>
          <p className="text-sm text-slate-500">
            Включено: {data.counts.active} · Найдено: {data.pagination.count}
            {query.isFetching ? " · Обновляем…" : ""}
          </p>
          {!data.data.length && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              {data.business_categories.length
                ? "Услуг по выбранным фильтрам нет. Измените поиск или создайте свою услугу."
                : "Настройте направления выше или создайте первую услугу самостоятельно."}
            </div>
          )}
          {[...groups].map(([name, rows]) => (
            <section
              key={name}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <h2 className="bg-slate-50 px-4 py-3 text-sm font-semibold">
                {name}
              </h2>
              <div className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-wrap items-center gap-3 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-sm font-medium">
                        {(row.service ?? row.template)?.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.service
                          ? `${Number(row.service.price).toLocaleString("ru-KZ")} ₸ · ${row.service.duration_minutes} мин · ${row.is_active ? "Включена" : "Выключена"}`
                          : "Шаблон · настройте цену, время и мастеров"}
                      </p>
                      <span className="mt-1 block text-xs text-slate-400">
                        {row.template ? "Из библиотеки" : "Своя услуга"}
                      </span>
                    </div>
                    {row.service && <EditService service={row.service} />}
                    {row.service && (
                      <button
                        type="button"
                        className="text-xs text-red-600 disabled:opacity-50"
                        aria-label={`Удалить ${row.service.name}`}
                        disabled={remove.isPending || toggle.isPending}
                        onClick={() => {
                          setDeleteTarget(row.service);
                          setError("");
                        }}
                      >
                        Удалить
                      </button>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.is_active}
                      aria-label={`${row.is_active ? "Выключить" : "Включить"} ${(row.service ?? row.template)?.name}`}
                      disabled={toggle.isPending || query.isFetching}
                      onClick={() => onToggle(row)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${row.is_active ? "bg-indigo-600" : "bg-slate-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${row.is_active ? "left-0.5 translate-x-5" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <nav
            aria-label="Страницы библиотеки"
            className="flex items-center justify-end gap-3"
          >
            <button
              type="button"
              className={button}
              disabled={page === 1 || query.isFetching}
              onClick={() => setPage(page - 1)}
            >
              Назад
            </button>
            <span className="text-sm">
              {page} / {data.pagination.total_pages}
            </span>
            <button
              type="button"
              className={button}
              disabled={page >= data.pagination.total_pages || query.isFetching}
              onClick={() => setPage(page + 1)}
            >
              Далее
            </button>
          </nav>
        </>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            className="w-full max-w-md rounded-xl bg-white p-5"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !remove.isPending)
                setDeleteTarget(null);
            }}
          >
            <h2 id="delete-service-title" className="font-semibold">
              Удалить услугу «{deleteTarget.name}»?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Если по услуге были записи, она будет выключена и сохранена в
              истории. Услуга без записей будет удалена. Шаблон останется в
              библиотеке.
            </p>
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                disabled={remove.isPending}
                className={button}
                onClick={() => setDeleteTarget(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={remove.isPending}
                className={`${button} bg-red-600 text-white`}
                onClick={() => remove.mutate(deleteTarget.id)}
              >
                {remove.isPending ? "Удаляем…" : "Удалить услугу"}
              </button>
            </div>
          </div>
        </div>
      )}
      {config && data && (
        <NewService
          key={config === "new" ? "new" : config.key}
          open
          showTrigger={false}
          row={config === "new" ? undefined : config}
          availableStaffIds={data.staff.map((staff) => staff.id)}
          onClose={() => setConfig(null)}
          onSaved={async () => {
            setConfig(null);
            setPage(1);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

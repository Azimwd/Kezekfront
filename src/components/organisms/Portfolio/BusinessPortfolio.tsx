import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPortfolio,
  PUBLIC_PORTFOLIO_PAGE_SIZE,
  type PortfolioPage,
  type PortfolioPhoto,
} from "../../../api/portfolio";
import PortfolioPagination from "./PortfolioPagination";

function PhotoDialog({
  photo,
  onClose,
}: {
  photo: PortfolioPhoto;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      aria-label={photo.caption || "Результат работы"}
      onCancel={onClose}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white p-4 shadow-xl backdrop:bg-black/60"
    >
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          Закрыть
        </button>
      </div>
      <img
        src={photo.image}
        alt={photo.caption || "Результат работы"}
        className="max-h-[65dvh] w-full object-contain"
      />
      <p className="mt-3 whitespace-pre-wrap break-words text-sm">
        {photo.caption}
      </p>
      {photo.staff_name && (
        <p className="mt-1 break-words text-xs text-slate-500">
          Мастер: {photo.staff_name}
        </p>
      )}
    </dialog>,
    document.body,
  );
}

export default function BusinessPortfolio({
  businessId,
}: {
  businessId: number;
}) {
  return <PortfolioContents key={businessId} businessId={businessId} />;
}

function PortfolioContents({ businessId }: { businessId: number }) {
  const [page, setPage] = useState(1);
  const [staff, setStaff] = useState<number | undefined>();
  const [photo, setPhoto] = useState<PortfolioPhoto | null>(null);
  const [staffOptions, setStaffOptions] = useState<PortfolioPage["staff"]>([]);
  const query = useQuery({
    queryKey: [
      "public-portfolio",
      businessId,
      PUBLIC_PORTFOLIO_PAGE_SIZE,
      page,
      staff,
    ],
    queryFn: ({ signal }) =>
      getPortfolio(businessId, page, true, staff, signal),
    placeholderData: keepPreviousData,
    enabled: Number.isSafeInteger(businessId) && businessId > 0,
  });
  useEffect(() => {
    if (query.data?.staff) setStaffOptions(query.data.staff);
  }, [query.data?.staff]);

  // Hide only a genuinely empty gallery, keeping filter controls for empty results.
  if (query.data?.count === 0 && !staff && !query.isFetching && !query.isError)
    return null;
  const fetchingPage = query.isPending || query.isPlaceholderData;
  const options = query.data?.staff ?? staffOptions;
  function changeStaff(value: string) {
    setStaff(value ? Number(value) : undefined);
    setPage(1);
    setPhoto(null);
  }
  function changePage(value: number) {
    setPage(value);
    setPhoto(null);
  }

  return (
    <section
      className="mb-10 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5"
      aria-label="Галерея работ"
      aria-busy={query.isFetching}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Результаты работ
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Работы бизнеса и портфолио мастеров
          </p>
        </div>
        <label className="flex w-full flex-col gap-1.5 text-xs font-medium text-slate-500 sm:w-auto">
          Мастер
          <select
            aria-label="Работы мастера"
            value={staff ?? ""}
            onChange={(event) => changeStaff(event.target.value)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-normal text-slate-700 focus-visible:outline-indigo-500 sm:min-w-52"
          >
            <option value="">Все мастера</option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.first_name} {item.last_name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {query.isError ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          Не удалось загрузить работы.
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="cursor-pointer font-medium underline"
              onClick={() => void query.refetch()}
            >
              Повторить
            </button>
            {page > 1 && (
              <button
                type="button"
                className="cursor-pointer font-medium underline"
                onClick={() => changePage(1)}
              >
                На первую страницу
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {fetchingPage
              ? Array.from(
                  { length: PUBLIC_PORTFOLIO_PAGE_SIZE },
                  (_, index) => (
                    <div
                      key={index}
                      aria-hidden="true"
                      className="overflow-hidden rounded-2xl border border-slate-100"
                    >
                      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
                      <div className="h-20 animate-pulse bg-slate-50" />
                    </div>
                  ),
                )
              : query.data?.data.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPhoto(item)}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white text-left transition hover:border-indigo-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <img
                      src={item.image}
                      loading="lazy"
                      alt={item.caption || "Результат работы"}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="line-clamp-2 min-h-10 break-words text-sm text-slate-800">
                        {item.caption || "Результат работы"}
                      </p>
                      <p
                        className="mt-1 truncate text-xs text-slate-500"
                        title={item.staff_name || undefined}
                      >
                        {item.staff_name || "Работа бизнеса"}
                      </p>
                    </div>
                  </button>
                ))}
          </div>
          {fetchingPage && (
            <p
              role="status"
              className="mt-3 text-center text-xs text-slate-400"
            >
              Загружаем работы…
            </p>
          )}
          {!fetchingPage && query.data?.count === 0 && (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                У этого мастера пока нет опубликованных работ.
              </p>
              <button
                type="button"
                onClick={() => changeStaff("")}
                className="mt-3 cursor-pointer text-sm font-medium text-indigo-600 hover:underline"
              >
                Показать всех мастеров
              </button>
            </div>
          )}
          {query.data && (
            <PortfolioPagination
              page={page}
              count={query.data.count}
              pageSize={query.data.page_size ?? PUBLIC_PORTFOLIO_PAGE_SIZE}
              totalPages={query.data.total_pages}
              busy={query.isFetching}
              onChange={changePage}
            />
          )}
        </>
      )}
      {photo && <PhotoDialog photo={photo} onClose={() => setPhoto(null)} />}
    </section>
  );
}

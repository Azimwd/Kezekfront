import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  count: number;
  pageSize: number;
  totalPages?: number;
  busy?: boolean;
  onChange: (page: number) => void;
}

export default function PortfolioPagination({
  page,
  count,
  pageSize,
  totalPages,
  busy = false,
  onChange,
}: Props) {
  const pages = Math.max(1, totalPages ?? Math.ceil(count / pageSize));
  const start = count ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, count);
  const visible =
    pages <= 5
      ? Array.from({ length: pages }, (_, index) => index + 1)
      : [...new Set([1, page - 1, page, page + 1, pages])]
          .filter((value) => value >= 1 && value <= pages)
          .sort((a, b) => a - b);
  const items: (number | string)[] = [];
  visible.forEach((value, index) => {
    if (index && value - visible[index - 1] > 1) items.push(`gap-${value}`);
    items.push(value);
  });
  const button =
    "flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-5 space-y-3">
      <p className="text-center text-xs text-slate-500">
        {count ? `Фото ${start}–${end} из ${count}` : "Нет фотографий"}
      </p>
      {pages > 1 && (
        <nav
          aria-label="Страницы галереи"
          className="flex flex-wrap items-center justify-center gap-1.5"
        >
          <button
            type="button"
            aria-label="Предыдущая страница галереи"
            disabled={busy || page <= 1}
            onClick={() => onChange(page - 1)}
            className={button}
          >
            <ChevronLeft size={17} />
          </button>
          {items.map((item) =>
            typeof item === "string" ? (
              <span
                key={item}
                className="px-1 text-sm text-slate-400"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Страница ${item}`}
                aria-current={item === page ? "page" : undefined}
                disabled={busy}
                onClick={() => {
                  if (item !== page) onChange(item);
                }}
                className={`${button} ${item === page ? "border-indigo-600! bg-indigo-600! font-semibold text-white! hover:bg-indigo-600!" : ""}`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Следующая страница галереи"
            disabled={busy || page >= pages}
            onClick={() => onChange(page + 1)}
            className={button}
          >
            <ChevronRight size={17} />
          </button>
        </nav>
      )}
    </div>
  );
}

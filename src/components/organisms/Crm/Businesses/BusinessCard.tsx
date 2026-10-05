import { useState } from "react";
import { Link } from "react-router-dom";
import { businessPath } from "../../../../utils/crmPaths";
import { ArrowRight, Building2, MapPin, Phone, Star } from "lucide-react";
import type { Business } from "../../../../api/businesses";
import EditBusiness from "../../../molecules/Crm/Businesses/EditBusiness";
import DeleteBusiness from "./DeleteBusiness";

const BACKEND_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const imageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  try {
    return new URL(path, BACKEND_URL).href;
  } catch {
    return null;
  }
};
const statuses: Record<string, { text: string; color: string }> = {
  active: { text: "Активен", color: "bg-emerald-500" },
  draft: { text: "Черновик", color: "bg-amber-400" },
  blocked: { text: "Заблокирован", color: "bg-rose-500" },
  archived: { text: "В архиве", color: "bg-slate-400" },
};
export default function BusinessCard({ business }: { business: Business }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const cover = imageUrl(business.images?.[0]) || imageUrl(business.logo);
  const status = statuses[business.status] ?? {
    text: "Статус не указан",
    color: "bg-slate-400",
  };
  const address = [business.city_name, business.address]
    .filter(Boolean)
    .join(", ");
  const directions =
    business.category_details?.length || business.categories?.length || 0;
  const rating = business.rating == null ? null : Number(business.rating);
  const price = business.min_price == null ? null : Number(business.min_price);
  return (
    <article className="relative isolate flex h-full min-w-0 flex-col rounded-[20px] border border-[#e8e9f3] bg-white/70 transition hover:border-[#dad5fa] hover:shadow-[0_12px_35px_-20px_rgba(79,70,229,0.35)]">
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden rounded-t-[20px] bg-linear-to-br from-[#e4e0ff] via-[#b2a7ef] to-[#7262cd]">
        {cover && failedImage !== cover ? (
          <img
            src={cover}
            alt={business.name}
            loading="lazy"
            onError={() => setFailedImage(cover)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2
              size={54}
              strokeWidth={1.25}
              className="text-white/60"
              aria-hidden="true"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#121c37]/85 via-[#121c37]/10 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex max-w-[70%] items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#35415b]">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.color}`}
            aria-hidden="true"
          />
          {status.text}
        </span>
        {rating !== null && Number.isFinite(rating) && rating > 0 && (
          <span
            aria-label={`Рейтинг ${rating}`}
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1.5 text-[11px] font-semibold text-[#35415b]"
          >
            <Star
              size={12}
              className="fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            {rating.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}
          </span>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="line-clamp-2 text-lg font-bold leading-snug text-white">
            {business.name}
          </h2>
          {price !== null && Number.isFinite(price) && price >= 0 && (
            <p className="mt-1 text-xs text-white/80">
              Услуги от {price.toLocaleString("ru-RU")} ₸
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
        <div className="space-y-3 text-xs leading-5 text-[#75809b] sm:text-sm">
          <p className="flex items-start gap-2">
            <MapPin
              size={15}
              className="mt-0.5 shrink-0 text-[#7160ed]"
              aria-hidden="true"
            />
            <span className="line-clamp-2" title={address}>
              {address || "Адрес не указан"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Phone
              size={14}
              className="shrink-0 text-[#7160ed]"
              aria-hidden="true"
            />
            <span className="break-all text-[#43516e]">
              {business.phone || "Телефон не указан"}
            </span>
          </p>
        </div>
        <div className="mt-auto grid grid-cols-2 divide-x divide-[#e5e7f2] rounded-xl bg-[#f3f4fa] px-2 py-3 text-center">
          <div className="min-w-0 px-2">
            <p className="text-base font-semibold tabular-nums text-[#6554ed]">
              {directions}
            </p>
            <p className="mt-1 text-[10px] text-[#9199ad]">Направления</p>
          </div>
          <div className="min-w-0 px-2">
            <p
              className="truncate text-sm font-semibold text-[#6554ed]"
              title={business.business_type_display}
            >
              {business.business_type_display || "Не указан"}
            </p>
            <p className="mt-1 text-[10px] text-[#9199ad]">Тип бизнеса</p>
          </div>
        </div>
        <div>
          <Link
            to={businessPath(business.id)}
            aria-label={`Открыть кабинет ${business.name}`}
            className="mb-2.5 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-3 text-sm font-semibold text-white transition hover:bg-indigo-600 after:absolute after:inset-0 after:z-0 after:rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
          >
            Открыть кабинет
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <div className="relative z-10 flex items-center gap-2">
            <EditBusiness business={business} />
            <DeleteBusiness businessId={business.id} />
          </div>
        </div>
      </div>
    </article>
  );
}

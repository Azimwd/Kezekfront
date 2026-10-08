import { serviceFinalPrice, type PricedService } from "../../utils/servicePrice";
export default function ServicePrice({ service }: { service: PricedService }) {
  return <span className="inline-flex flex-wrap items-center gap-2">
    {!!service.discount_percent && <><span className="text-xs font-normal text-slate-400 line-through">{Number(service.price).toLocaleString("ru-KZ")} ₸</span><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">−{service.discount_percent}%</span></>}
    <span>{serviceFinalPrice(service).toLocaleString("ru-KZ")} ₸</span>
  </span>;
}

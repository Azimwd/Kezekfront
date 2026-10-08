import { previewDiscount } from "../../../../utils/servicePrice";
export default function ServiceDiscountField({ value, onChange, price }: { value: number; onChange: (value: number) => void; price: string }) {
  return <div className="col-span-full rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
    <label className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-800">Скидка на услугу, %
      <input aria-label="Скидка на услугу, %" type="number" min="0" max="100" step="1" value={value} onChange={e => onChange(Math.max(0, Math.min(100, Math.trunc(Number(e.target.value) || 0))))} className="w-24 rounded-lg border border-indigo-200 bg-white px-3 py-2" />
      <span className="text-indigo-700">Итого: {previewDiscount(price || 0, value)} ₸</span>
    </label>
    <p className="mt-2 text-xs text-slate-500">0% — без скидки. Скидка применяется только к основной услуге, дополнения оплачиваются отдельно. Уже созданные записи сохраняют прежнюю стоимость.</p>
  </div>;
}

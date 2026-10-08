import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio, type PortfolioPhoto } from "../../../api/portfolio";

function PhotoDialog({ photo, onClose }: { photo: PortfolioPhoto; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return createPortal(<dialog ref={dialog} aria-label={photo.caption || "Результат работы"} onCancel={onClose} className="m-auto w-[calc(100%_-_2rem)] max-w-3xl rounded-2xl border-0 bg-white p-4 shadow-xl backdrop:bg-black/60">
    <button type="button" onClick={onClose} className="mb-3 float-right rounded-lg border px-4 py-2">Закрыть</button>
    <img src={photo.image} alt={photo.caption || "Результат работы"} className="max-h-[70dvh] w-full object-contain" />
    <p className="mt-3 whitespace-pre-wrap text-sm">{photo.caption}</p>{photo.staff_name && <p className="mt-1 text-xs text-slate-500">Мастер: {photo.staff_name}</p>}
  </dialog>, document.body);
}
export default function BusinessPortfolio({ businessId }: { businessId: number }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [staff, setStaff] = useState<number | undefined>();
  const [photo, setPhoto] = useState<PortfolioPhoto | null>(null);
  const query = useQuery({ queryKey: ["public-portfolio", businessId, page, staff], queryFn: () => getPortfolio(businessId, page, true, staff) });
  useEffect(() => { setPage(1); setStaff(undefined); setPhoto(null); setExpanded(false); }, [businessId]);
  if (query.isPending) return <p role="status" className="mb-8 text-sm text-slate-400">Загружаем работы…</p>;
  if (query.isError) return <div className="mb-8 rounded-xl border p-4 text-sm text-slate-500">Не удалось загрузить галерею. <button type="button" className="text-indigo-600" onClick={() => void query.refetch()}>Повторить</button></div>;
  if (!query.data.count && !staff) return null;
  return <section className="mb-10" aria-label="Галерея работ">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold text-slate-900">Результаты работ</h2><p className="mt-1 text-sm text-slate-500">Посмотрите работы бизнеса и его мастеров</p></div>
      <select aria-label="Работы мастера" value={staff ?? ""} onChange={e => { setStaff(e.target.value ? Number(e.target.value) : undefined); setPage(1); setExpanded(false); }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="">Все мастера</option>{query.data.staff.map(item => <option key={item.id} value={item.id}>{item.first_name} {item.last_name}</option>)}</select>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{(expanded ? query.data.data : query.data.data.slice(0, 4)).map(item => <button type="button" key={item.id} onClick={() => setPhoto(item)} className="overflow-hidden rounded-2xl border border-slate-100 bg-white text-left transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500"><img src={item.image} loading="lazy" alt={item.caption || "Результат работы"} className="aspect-square w-full object-cover" /><div className="p-3"><p className="line-clamp-2 text-sm text-slate-800">{item.caption || "Результат работы"}</p><p className="mt-1 text-xs text-slate-500">{item.staff_name || "Работа бизнеса"}</p></div></button>)}</div>
    {!query.data.count && <p className="py-8 text-sm text-slate-500">У этого мастера пока нет опубликованных работ.</p>}
    {query.data.count > 4 && <button type="button" onClick={() => { setExpanded(!expanded); setPage(1); }} className="mt-4 rounded-xl border border-indigo-200 px-4 py-2 text-sm text-indigo-700">{expanded ? "Свернуть галерею" : `Все работы (${query.data.count})`}</button>}
    {expanded && (query.data.next || query.data.previous) && <div className="mt-5 flex items-center justify-center gap-4"><button type="button" disabled={!query.data.previous} onClick={() => setPage(page - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-30">Назад</button><span className="text-sm">{page}</span><button type="button" disabled={!query.data.next} onClick={() => setPage(page + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-30">Далее</button></div>}
    {photo && <PhotoDialog photo={photo} onClose={() => setPhoto(null)} />}
  </section>;
}

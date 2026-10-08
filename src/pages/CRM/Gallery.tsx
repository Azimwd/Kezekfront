import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Images, Upload, Pencil, Trash2 } from "lucide-react";
import { useBusiness } from "../../context/BusinessContext";
import { getPortfolio, savePortfolioPhoto, deletePortfolioPhoto, type PortfolioPhoto } from "../../api/portfolio";
import ConfirmationDialog from "../../components/molecules/Feedback/ConfirmationDialog";
import { isAxiosError } from "axios";

function errorMessage(error: unknown) {
  if (isAxiosError(error)) { const data = error.response?.data; if (data && typeof data === "object") return Object.values(data).flat().filter(item => typeof item === "string").join(" ") || "Не удалось сохранить изменения. Попробуйте ещё раз."; }
  return error instanceof Error ? error.message : "Не удалось сохранить изменения. Попробуйте ещё раз.";
}
export default function Gallery() {
  const { selectedBusiness } = useBusiness();
  const businessId = Number(selectedBusiness?.id);
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<PortfolioPhoto | null>(null);
  const [deleting, setDeleting] = useState<PortfolioPhoto | null>(null);
  const [caption, setCaption] = useState("");
  const [staff, setStaff] = useState("");
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const query = useQuery({ queryKey: ["owner-portfolio", businessId, page], queryFn: () => getPortfolio(businessId, page), enabled: !!businessId });
  async function refresh() { await Promise.all([client.invalidateQueries({ queryKey: ["owner-portfolio", businessId] }), client.invalidateQueries({ queryKey: ["public-portfolio", businessId] })]); }
  function reset() { setEditing(null); setCaption(""); setStaff(""); setPublished(true); setFile(null); if (input.current) input.current.value = ""; }
  const save = useMutation({ mutationFn: async () => {
    if (!file && !editing) throw new Error("Выберите фотографию.");
    if (file && file.size > 10 * 1024 * 1024) throw new Error("Размер фото — не более 10 МБ.");
    const data = new FormData(); if (file) data.append("image", file);
    data.append("caption", caption.trim()); data.append("staff", staff); data.append("is_published", String(published));
    await savePortfolioPhoto(businessId, data, editing?.id);
  }, onSuccess: async () => { reset(); setMessage("Фото сохранено."); setError(""); setPage(1); await refresh(); }, onError: e => setError(errorMessage(e)) });
  function submit(event: FormEvent) { event.preventDefault(); if (save.isPending) return; setError(""); setMessage(""); save.mutate(); }
  function edit(photo: PortfolioPhoto) { setEditing(photo); setCaption(photo.caption); setStaff(photo.staff ? String(photo.staff) : ""); setPublished(photo.is_published); setFile(null); if (input.current) input.current.value = ""; setError(""); setMessage(""); form.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  return <div className="space-y-6">
    <div className="flex items-start gap-4"><div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600"><Images size={26} /></div><div><h1 className="text-2xl font-semibold text-slate-900">Галерея работ</h1><p className="mt-1 text-sm text-slate-500">Все результаты в одной галерее. Укажите мастера, чтобы клиент мог посмотреть его портфолио.</p></div></div>
    <form ref={form} onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">{editing ? "Редактировать фото" : "Добавить результат работы"}</h2>
      <fieldset disabled={save.isPending} className="grid gap-4 md:grid-cols-2 disabled:opacity-70">
        <label className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-sm"><span className="mb-2 flex items-center gap-2 font-medium text-indigo-700"><Upload size={18} />{editing ? "Заменить фото (необязательно)" : "Выберите фото"}</span><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" required={!editing} onChange={e => setFile(e.target.files?.[0] ?? null)} className="w-full text-xs" /><span className="mt-2 block text-xs text-slate-500">JPG, PNG, WebP · до 10 МБ</span></label>
        <label className="text-sm font-medium">Мастер<select value={staff} onChange={e => setStaff(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3"><option value="">Общая работа бизнеса</option>{query.data?.staff.map(item => <option value={item.id} key={item.id}>{item.first_name} {item.last_name}</option>)}</select></label>
        <label className="text-sm font-medium md:col-span-2">Подпись<textarea value={caption} maxLength={300} onChange={e => setCaption(e.target.value)} placeholder="Например: окрашивание и укладка" className="mt-2 block w-full rounded-xl border border-slate-200 p-3 font-normal" rows={2} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />Показывать клиентам</label>
        <div className="flex flex-wrap gap-3 md:col-span-2"><button type="submit" disabled={!businessId || query.isPending || query.isError} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{save.isPending ? "Сохраняем…" : editing ? "Сохранить изменения" : "Добавить фото"}</button>{editing && <button type="button" onClick={reset} className="rounded-xl border px-5 py-3 text-sm">Отмена</button>}</div>
      </fieldset>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
    </form>
    {query.isPending ? <p role="status">Загружаем галерею…</p> : query.isError ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Не удалось загрузить фото. <button type="button" onClick={() => void query.refetch()} className="underline">Повторить</button></div> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{query.data.data.map(photo => <article key={photo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><img src={photo.image} alt={photo.caption || "Результат работы"} loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="p-4"><p className="break-words text-sm font-medium">{photo.caption || "Без подписи"}</p><p className="mt-1 text-xs text-slate-500">{photo.staff_name || "Общая работа бизнеса"} · {photo.is_published ? "Опубликовано" : "Скрыто"}</p><div className="mt-4 flex gap-4"><button type="button" disabled={save.isPending} onClick={() => edit(photo)} className="flex items-center gap-1 text-sm text-indigo-600 disabled:opacity-50"><Pencil size={15} />Изменить</button><button type="button" disabled={save.isPending} onClick={() => setDeleting(photo)} className="flex items-center gap-1 text-sm text-red-600 disabled:opacity-50"><Trash2 size={15} />Удалить</button></div></div></article>)}</div>
      {!query.data.count && <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">Пока нет фотографий. Добавьте первую работу выше.</div>}
      {(query.data.next || query.data.previous) && <div className="flex items-center justify-center gap-4"><button type="button" disabled={!query.data.previous} onClick={() => setPage(page - 1)} className="rounded-xl border px-4 py-2 disabled:opacity-30">Назад</button><span>{page}</span><button type="button" disabled={!query.data.next} onClick={() => setPage(page + 1)} className="rounded-xl border px-4 py-2 disabled:opacity-30">Далее</button></div>}
    </>}
    {deleting && <ConfirmationDialog title="Удалить фотографию?" description="Она исчезнет из галереи бизнеса и портфолио мастера." confirmLabel="Удалить" tone="danger" formatError={errorMessage} onClose={() => setDeleting(null)} onConfirm={async () => { await deletePortfolioPhoto(deleting.id); if (editing?.id === deleting.id) reset(); setDeleting(null); setPage(1); await refresh(); }} />}
  </div>;
}

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, LoaderCircle, ShieldAlert, X } from "lucide-react";

export interface ConfirmationContent {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  details?: { label: string; value: string }[];
}
interface ConfirmationDialogProps extends ConfirmationContent {
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  formatError: (error: unknown) => string;
}

export default function ConfirmationDialog({
  title,
  description,
  confirmLabel,
  tone = "primary",
  details,
  onConfirm,
  onClose,
  formatError,
}: ConfirmationDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  const dangerous = tone === "danger";
  const StatusIcon = dangerous ? ShieldAlert : CircleCheck;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    cancelButton.current?.focus({ preventScroll: true });
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function close() {
    if (!running.current) onClose();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await onConfirm();
    } catch (e) {
      setError(formatError(e));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      aria-modal="true"
      aria-busy={busy}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[460px] overflow-y-auto rounded-[24px] border border-[#e7e3f0] bg-white p-0 text-[#282237] shadow-[0_24px_90px_rgba(35,24,59,0.24)] backdrop:bg-[#251b39]/45 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          close();
      }}
    >
      <form onSubmit={submit}>
        <div className="relative px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
          <button
            type="button"
            aria-label="Закрыть подтверждение"
            disabled={busy}
            onClick={close}
            className="absolute cursor-pointer disabled:cursor-not-allowed right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-[#8b8499] transition hover:bg-[#f5f2fb] hover:text-[#282237] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7655bb] disabled:opacity-40"
          >
            <X size={19} />
          </button>
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${dangerous ? "border-red-100 bg-red-50 text-red-600" : "border-[#e7dcfb] bg-[#f3edfc] text-[#7655bb]"}`}
          >
            <StatusIcon size={27} strokeWidth={1.7} />
          </div>
          <h2
            id={`${id}-title`}
            className="pr-3 text-[22px] font-semibold leading-tight tracking-tight"
          >
            {title}
          </h2>
          <p
            id={`${id}-description`}
            className="mt-3 text-sm leading-6 text-[#746c83]"
          >
            {description}
          </p>
          {!!details?.length && (
            <dl className="mt-5 space-y-3 rounded-2xl border border-[#eae5f3] bg-[#faf8fd] p-4">
              {details.map((detail, index) => (
                <div key={index}>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-[#92899f]">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-medium text-[#45394f]">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-800"
            >
              <p className="font-medium">Действие не выполнено</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#eee9f6] bg-[#fcfbfe] px-6 py-5 sm:flex-row sm:px-7">
          <button
            ref={cancelButton}
            type="button"
            disabled={busy}
            onClick={close}
            className="flex cursor-pointer disabled:cursor-not-allowed min-h-11 flex-1 items-center justify-center rounded-xl border border-[#e1dbe9] bg-white px-4 py-2.5 text-sm font-medium text-[#6c607a] transition hover:bg-[#f5f1fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7655bb] disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={busy}
            className={`flex cursor-pointer min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70 ${dangerous ? "bg-red-600 hover:bg-red-700 focus-visible:outline-red-500" : "bg-[#7655bb] hover:bg-[#6544a6] focus-visible:outline-[#7655bb]"}`}
          >
            {busy && (
              <LoaderCircle size={17} className="shrink-0 animate-spin" />
            )}
            {busy ? "Выполняем…" : confirmLabel}
          </button>
        </div>
        {busy && (
          <p
            role="status"
            className="bg-[#fcfbfe] px-6 pb-4 text-center text-xs text-[#92899f]"
          >
            Дождитесь завершения действия
          </p>
        )}
      </form>
    </dialog>,
    document.body,
  );
}

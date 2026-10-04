import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

interface FeedbackNoticeProps {
  tone?: "success" | "error" | "info";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
}
export default function FeedbackNotice({
  tone = "info",
  title,
  children,
  action,
  onClose,
}: FeedbackNoticeProps) {
  const Icon =
    tone === "success" ? CircleCheck : tone === "error" ? CircleAlert : Info;
  const colors =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50/80 text-emerald-900"
      : tone === "error"
        ? "border-red-100 bg-red-50/80 text-red-900"
        : "border-[#e7dcfb] bg-[#f6f2fc] text-[#60428f]";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-2xl border p-4 ${colors}`}
    >
      <Icon size={21} className="mt-0.5 shrink-0" strokeWidth={1.8} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {children && (
          <div className="mt-1 break-words text-sm leading-5 opacity-85">
            {children}
          </div>
        )}
        {action && <div className="mt-2 text-sm font-medium">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Закрыть уведомление"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-65 hover:bg-white/60 hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

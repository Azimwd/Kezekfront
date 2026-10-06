import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import {
  accountSecurity,
  getAuthReturnPath,
  securityError,
} from "../../api/accountSecurity";
import { getCurrentUser } from "../../api/auth";
import { useUser } from "../../context/UserContext";

const field =
  "mt-2 h-12 w-full rounded-xl border border-[#BEC0D4] bg-[#FCFCFE] px-4 text-[#172033] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10";
const primary =
  "flex min-h-12 w-full items-center justify-center rounded-xl bg-[#4F46E5] px-5 py-3 font-semibold text-white hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50";
type AuthState = { email?: string; queued?: boolean; from?: string };
function useAuthState() {
  const location = useLocation();
  const state = (location.state ?? {}) as AuthState;
  const from = getAuthReturnPath(state.from);
  return { state, from };
}
function usePrivatePage() {
  useEffect(() => {
    const added: HTMLMetaElement[] = [];
    const previous: [HTMLMetaElement, string][] = [];
    for (const [name, content] of [
      ["referrer", "no-referrer"],
      ["robots", "noindex, nofollow"],
    ]) {
      let meta = document.querySelector<HTMLMetaElement>(
        `meta[name="${name}"]`,
      );
      if (meta) previous.push([meta, meta.content]);
      else {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
        added.push(meta);
      }
      meta.content = content;
    }
    return () => {
      added.forEach((meta) => meta.remove());
      previous.forEach(([meta, value]) => {
        meta.content = value;
      });
    };
  }, []);
}
function useToken() {
  const location = useLocation();
  return new URLSearchParams(location.hash.slice(1)).get("token") ?? "";
}
function clearToken() {
  window.history.replaceState(
    window.history.state,
    "",
    window.location.pathname + window.location.search,
  );
}
function Frame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  usePrivatePage();
  const { from } = useAuthState();
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#F8F9FF] px-4 py-10 sm:py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#E0E3EC] bg-white p-6 shadow-[0_12px_35px_rgba(40,48,90,0.08)] sm:p-9">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEECFF] text-[#4F46E5]">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[#14213D]">{title}</h1>
        <p className="mb-6 mt-3 text-sm leading-6 text-[#646879]">
          {description}
        </p>
        {children}
        <Link
          to="/auth/login"
          state={{ from }}
          className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#4F46E5]"
        >
          <ArrowLeft size={16} />
          Вернуться ко входу
        </Link>
      </div>
    </section>
  );
}
function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`my-4 rounded-xl px-4 py-3 text-sm leading-6 ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}
    >
      {children}
    </div>
  );
}
function EmailRequest({ verification = false }: { verification?: boolean }) {
  const { state } = useAuthState();
  const { user } = useUser();
  const [email, setEmail] = useState(
    state.email ?? (verification ? user?.email : "") ?? "",
  );
  const [sent, setSent] = useState(verification && Boolean(state.queued));
  const [seconds, setSeconds] = useState(sent ? 60 : 0);
  useEffect(() => {
    if (!seconds) return;
    const timer = window.setTimeout(
      () => setSeconds((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [seconds]);
  const request = useMutation({
    mutationFn: () =>
      verification
        ? accountSecurity.requestVerification(email.trim())
        : accountSecurity.requestReset(email.trim()),
    onSuccess: () => {
      setSent(true);
      setSeconds(60);
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    request.mutate();
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {sent && (
        <Notice>
          <Mail className="mb-2" size={20} />
          {state.queued && !request.isSuccess
            ? "Письмо поставлено в очередь отправки."
            : "Если для этого адреса требуется письмо, мы отправим его."}{" "}
          Проверьте входящие и папку «Спам». При повторной отправке используйте
          последнюю ссылку.
        </Notice>
      )}
      <label className="block text-sm font-medium text-[#172033]">
        Email
        <input
          className={field}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            request.reset();
          }}
          placeholder="you@example.com"
        />
      </label>
      {request.isError && <Notice error>{securityError(request.error)}</Notice>}
      <button className={primary} disabled={request.isPending || seconds > 0}>
        {request.isPending
          ? "Отправляем…"
          : seconds > 0
            ? `Повторить через ${seconds} с`
            : sent
              ? "Отправить повторно"
              : "Отправить письмо"}
      </button>
    </form>
  );
}
export function ForgotPasswordPage() {
  return (
    <Frame
      title="Забыли пароль?"
      description="Укажите почту аккаунта. Мы отправим ссылку, по которой можно установить новый пароль."
    >
      <EmailRequest />
    </Frame>
  );
}
export function VerifyEmailPage() {
  const token = useToken();
  const { from } = useAuthState();
  const { user, setUser } = useUser();
  const [done, setDone] = useState(false);
  const verify = useMutation({
    mutationFn: () => accountSecurity.verify(token),
    onSuccess: async () => {
      setDone(true);
      clearToken();
      if (user) {
        try {
          const response = await getCurrentUser();
          setUser(response.data ?? response);
        } catch {
          setUser(null);
        }
      }
    },
  });
  return (
    <Frame
      title={done ? "Почта подтверждена" : "Подтвердите почту"}
      description={
        done
          ? "Спасибо! Теперь ваш адрес подтверждён."
          : "Подтверждение помогает защитить аккаунт и восстановить доступ, если вы забудете пароль."
      }
    >
      {done ? (
        <>
          <Notice>
            <CheckCircle2 className="mb-2" />
            Почта успешно подтверждена.
          </Notice>
          <Link
            className={primary}
            to={user ? (from ?? "/") : "/auth/login"}
            state={{ from }}
          >
            {user ? "Продолжить" : "Войти в аккаунт"}
          </Link>
        </>
      ) : (
        <>
          {token && !verify.isError && (
            <>
              <p className="mb-5 text-sm text-[#646879]">
                Нажмите кнопку, чтобы подтвердить адрес. Просто открытие ссылки
                не подтверждает почту. Если вы регистрируетесь по приглашению
                мастера, после подтверждения вернитесь к приглашению.
              </p>
              <button
                className={primary}
                disabled={verify.isPending}
                onClick={() => verify.mutate()}
              >
                {verify.isPending ? "Подтверждаем…" : "Подтвердить почту"}
              </button>
            </>
          )}
          {verify.isError && (
            <Notice error>{securityError(verify.error)}</Notice>
          )}
          {(!token || verify.isError) && <EmailRequest verification />}
        </>
      )}
    </Frame>
  );
}
export function ResetPasswordPage() {
  const token = useToken();
  const { from } = useAuthState();
  const { setUser } = useUser();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validation, setValidation] = useState("");
  const [done, setDone] = useState(false);
  const reset = useMutation({
    mutationFn: () => accountSecurity.reset(token, password, confirm),
    onSuccess: async () => {
      setDone(true);
      setPassword("");
      setConfirm("");
      clearToken();
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(null);
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setValidation("Пароли не совпадают.");
      return;
    }
    setValidation("");
    reset.mutate();
  }
  return (
    <Frame
      title={done ? "Пароль изменён" : "Новый пароль"}
      description={
        done
          ? "Старые сеансы завершены. Войдите с новым паролем."
          : "Используйте минимум 8 символов. Пароль должен отличаться от предыдущего и не быть слишком простым."
      }
    >
      {done ? (
        <>
          <Notice>Пароль успешно изменён.</Notice>
          <Link className={primary} to="/auth/login" state={{ from }}>
            Войти в аккаунт
          </Link>
        </>
      ) : !token ? (
        <>
          <Notice error>В ссылке нет кода восстановления.</Notice>
          <Link className={primary} to="/auth/forgot-password" state={{ from }}>
            Запросить новую ссылку
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-medium">
            Новый пароль
            <input
              className={field}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Повторите пароль
            <input
              className={field}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </label>
          {(validation || reset.isError) && (
            <Notice error>{validation || securityError(reset.error)}</Notice>
          )}
          <button className={primary} disabled={reset.isPending}>
            {reset.isPending ? "Сохраняем…" : "Сохранить пароль"}
          </button>
          <Link
            className="block text-center text-sm text-[#4F46E5]"
            to="/auth/forgot-password"
            state={{ from }}
          >
            Запросить новую ссылку
          </Link>
        </form>
      )}
    </Frame>
  );
}

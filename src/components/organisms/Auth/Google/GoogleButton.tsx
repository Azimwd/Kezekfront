import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  googleChallenge,
  googleLogin,
  type GoogleRole,
} from "../../../../api/googleAuth";
import {
  clearAuthReturnPath,
  getAuthReturnPath,
  securityError,
} from "../../../../api/accountSecurity";
import { useUser } from "../../../../context/UserContext";

type GoogleSDK = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        nonce: string;
        callback: (value: { credential: string }) => void;
        auto_select: boolean;
      }) => void;
      renderButton: (
        element: HTMLElement,
        config: {
          theme: string;
          size: string;
          text: string;
          width: number;
          locale: string;
        },
      ) => void;
    };
  };
};
declare global {
  interface Window {
    google?: GoogleSDK;
  }
}
let sdkPromise: Promise<GoogleSDK> | undefined;
function loadGoogle(): Promise<GoogleSDK> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (sdkPromise) return sdkPromise;
  const promise = new Promise<GoogleSDK>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client?hl=ru";
    script.async = true;
    const timer = window.setTimeout(() => {
      script.remove();
      reject(new Error("timeout"));
    }, 15000);
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.google?.accounts?.id) resolve(window.google);
      else {
        script.remove();
        reject(new Error("Google unavailable"));
      }
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error("Google unavailable"));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    sdkPromise = undefined;
    throw error;
  });
  sdkPromise = promise;
  return promise;
}
// Serialize challenge requests when React remounts a page. The latest nonce must match the latest cookie.
let challengeQueue: Promise<unknown> = Promise.resolve();
function nextChallenge() {
  const request = challengeQueue.then(googleChallenge, googleChallenge);
  challengeQueue = request.catch(() => undefined);
  return request;
}

type Props = {
  mode?: "login" | "register";
  role?: GoogleRole;
  acceptedTerms?: boolean;
  disabled?: boolean;
  returnTo?: string;
};
export default function GoogleButton({
  mode = "login",
  role = "client",
  acceptedTerms = false,
  disabled = false,
  returnTo,
}: Props) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const host = useRef<HTMLDivElement>(null);
  const live = useRef(true);
  const busy = useRef(false);
  const credential = useRef("");
  const latest = useRef<(value: string, password?: string) => Promise<void>>(
    async () => {},
  );
  const [step, setStep] = useState<"google" | "register" | "link">("google");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<GoogleRole>("client");
  const [agreement, setAgreement] = useState(false);
  const [reload, setReload] = useState(0);
  const { setUser } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      credential.current = "";
    };
  }, []);
  latest.current = async (value, linkPassword) => {
    if (busy.current || disabled || (mode === "register" && !acceptedTerms))
      return;
    busy.current = true;
    setPending(true);
    setError("");
    credential.current = value;
    try {
      const result = await googleLogin(
        value,
        step === "register" ? newRole : role,
        mode === "register" ? acceptedTerms : agreement,
        linkPassword,
      );
      if (!live.current) return;
      credential.current = "";
      setPassword("");
      setUser(result.data);
      await queryClient.invalidateQueries({ queryKey: ["staff-account"] });
      const from = getAuthReturnPath(
        returnTo ?? (location.state as { from?: unknown } | null)?.from,
      );
      clearAuthReturnPath();
      navigate(
        from ??
          (result.data.role === "business_owner" ? "/crm/my-businesses" : "/"),
        { replace: true },
      );
    } catch (cause) {
      if (!live.current) return;
      const data = axios.isAxiosError(cause) ? cause.response?.data : undefined;
      if (data?.code === "google_registration_required") {
        setStep("register");
        setError("");
      } else if (data?.code === "google_link_required") {
        setStep("link");
        setError("");
      } else if (data?.code === "email_verification_required") {
        credential.current = "";
        setUser(null);
        navigate("/auth/verify-email", {
          state: {
            email: data.email,
            queued: data.verification_email_queued,
            from: getAuthReturnPath(
              returnTo ?? (location.state as { from?: unknown } | null)?.from,
            ),
          },
        });
      } else if (
        data?.code === "google_challenge_expired" ||
        data?.code === "google_invalid_token"
      ) {
        credential.current = "";
        setPassword("");
        setStep("google");
        setReload((value) => value + 1);
        setError(securityError(cause));
      } else setError(securityError(cause));
    } finally {
      busy.current = false;
      if (live.current) setPending(false);
    }
  };

  useEffect(() => {
    if (!clientId || step !== "google") return;
    let disposed = false;
    setReady(false);
    void (async () => {
      const google = await loadGoogle();
      if (disposed) return;
      const { nonce } = await nextChallenge();
      if (disposed || !host.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        nonce,
        auto_select: false,
        callback: (result) => {
          if (!disposed) void latest.current(result.credential);
        },
      });
      host.current.replaceChildren();
      google.accounts.id.renderButton(host.current, {
        theme: "outline",
        size: "large",
        text: mode === "register" ? "signup_with" : "continue_with",
        width: Math.min(320, host.current.clientWidth || 280),
        locale: "ru",
      });
      setReady(true);
    })().catch((cause) => {
      if (!disposed)
        setError(
          axios.isAxiosError(cause)
            ? securityError(cause)
            : "Не удалось загрузить Google. Проверьте соединение и попробуйте снова.",
        );
    });
    return () => {
      disposed = true;
      host.current?.replaceChildren();
    };
  }, [clientId, mode, step, reload]);

  function restart() {
    credential.current = "";
    setPassword("");
    setError("");
    setStep("google");
    setReload((value) => value + 1);
  }
  if (!clientId) return null;
  const blocked =
    disabled || pending || (mode === "register" && !acceptedTerms);
  return (
    <div className="w-full space-y-3">
      {step === "google" ? (
        <>
          {!ready && !error && (
            <p role="status" className="text-center text-sm text-slate-500">
              Загрузка Google…
            </p>
          )}
          <div
            ref={host}
            inert={blocked}
            className="flex min-h-10 w-full justify-center overflow-hidden"
          />
          {mode === "register" && !acceptedTerms && (
            <p className="text-center text-xs text-slate-500">
              Для регистрации через Google примите условия.
            </p>
          )}
          {pending && (
            <p role="status" className="text-center text-sm text-slate-500">
              Вход через Google…
            </p>
          )}
        </>
      ) : (
        <div className="space-y-3 rounded-xl border border-[#E0E3EC] bg-[#F8F9FF] p-4">
          {step === "link" ? (
            <>
              <p className="text-sm text-[#172033]">
                Аккаунт с этой почтой уже есть. Введите его пароль, чтобы
                привязать Google.
              </p>
              <label className="block text-sm">
                Пароль существующего аккаунта
                <input
                  aria-label="Пароль существующего аккаунта"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  maxLength={128}
                  disabled={pending}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-[#BEC0D4] bg-white px-3 outline-none focus:border-[#4F46E5]"
                />
              </label>
            </>
          ) : (
            <>
              <p className="text-sm text-[#172033]">
                Создать аккаунт с выбранной почтой Google
              </p>
              <label className="block text-sm">
                Тип аккаунта
                <select
                  aria-label="Тип аккаунта Google"
                  value={newRole}
                  disabled={pending}
                  onChange={(event) =>
                    setNewRole(event.target.value as GoogleRole)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-[#BEC0D4] bg-white px-3"
                >
                  <option value="client">Клиент</option>
                  <option value="business_owner">Владелец бизнеса</option>
                </select>
              </label>
              <label className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  aria-label="Принять условия Google-регистрации"
                  type="checkbox"
                  checked={agreement}
                  disabled={pending}
                  onChange={(event) => setAgreement(event.target.checked)}
                  className="mt-0.5 accent-[#4F46E5]"
                />
                <span>
                  Я принимаю{" "}
                  <a href="/terms" className="text-[#4F46E5] underline">
                    пользовательское соглашение
                  </a>{" "}
                  и{" "}
                  <a href="/privacy" className="text-[#4F46E5] underline">
                    политику конфиденциальности
                  </a>
                  .
                </span>
              </label>
            </>
          )}
          <button
            type="button"
            disabled={pending || (step === "link" ? !password : !agreement)}
            onClick={() =>
              void latest.current(
                credential.current,
                step === "link" ? password : undefined,
              )
            }
            className="h-11 w-full rounded-lg bg-[#4F46E5] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending
              ? "Подождите…"
              : step === "link"
                ? "Привязать Google и войти"
                : "Создать аккаунт через Google"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={restart}
            className="w-full text-sm text-[#4F46E5]"
          >
            Выбрать другой аккаунт Google
          </button>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}
      {step === "google" && error && !pending && (
        <button
          type="button"
          onClick={restart}
          className="w-full text-sm text-[#4F46E5]"
        >
          Повторить подключение Google
        </button>
      )}
    </div>
  );
}

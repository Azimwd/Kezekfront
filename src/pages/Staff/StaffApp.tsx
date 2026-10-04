import { useEffect, useState, type FormEvent } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/api";
import {
  staffAccess,
  staffError,
  type StaffAccount,
  type StaffMembership,
} from "../../api/staffAccess";

const button =
  "rounded-xl border border-[#dedbe9] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#f7f5ff] disabled:opacity-50";
const primary = `${button} !bg-[#7655bb] !text-white`;
const input = "w-full rounded-xl border border-[#dedbe9] bg-white p-3 text-sm";
const card = "rounded-2xl border border-[#e7e3f0] bg-white p-5 sm:p-7";
const weekdays = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];
const statuses: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled_by_client: "Отменена клиентом",
  cancelled_by_business: "Отменена бизнесом",
  no_show: "Клиент не пришёл",
};
const money = (value: string | number) => `${Number(value).toLocaleString("ru-RU")} ₸`;
const time = (value: string) =>
  new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

async function currentAccount(): Promise<StaffAccount | null> {
  try {
    return (
      await api.get<StaffAccount>("/api/users/me/", { withCredentials: true })
    ).data;
  } catch (e) {
    const code = (e as { response?: { status?: number } })?.response?.status;
    if (code === 401 || code === 403) return null;
    throw e;
  }
}
function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      {staffError(error)}{" "}
      {retry && (
        <button className="underline" onClick={retry}>
          Повторить
        </button>
      )}
    </div>
  );
}
function useAccount() {
  return useQuery({
    queryKey: ["staff-account"],
    queryFn: currentAccount,
    retry: false,
  });
}

export default function StaffApp() {
  useEffect(() => {
    // Invitation secrets must not be included in Referer headers.
    const previous = document.querySelector<HTMLMetaElement>(
      'meta[name="referrer"]',
    );
    const old = previous?.content;
    const meta = previous || document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    if (!previous) document.head.append(meta);
    return () => {
      if (previous) previous.content = old || "";
      else meta.remove();
    };
  }, []);
  return (
    <main className="min-h-dvh bg-[#f8f9ff] text-[#282237]">
      <header className="border-b border-[#e7e3f0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-7">
          <Link to="/staff" className="text-xl font-semibold">
            Kezek · Кабинет сотрудника
          </Link>
          <Link to="/" className="text-sm text-[#6c667e]">
            На сайт
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-7">
        <Routes>
          <Route path="invite/:token" element={<Invitation />} />
          <Route index element={<Portal />} />
          <Route
            path="*"
            element={
              <div className={card}>
                Страница не найдена.{" "}
                <Link to="/staff" className="underline">
                  В кабинет
                </Link>
              </div>
            }
          />
        </Routes>
      </div>
    </main>
  );
}

function LoginForm() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const login = useMutation({
    mutationFn: async () => {
      if (register) {
        await api.post(
          "/api/users/register/",
          {
            email: email.trim(),
            password,
            confirm_password: confirm,
            first_name: firstName,
            last_name: lastName,
            phone,
            role: "client",
          },
          { withCredentials: true },
        );
        // If automatic login fails, retry login rather than registering the same email again.
        setRegister(false);
      }
      await api.post(
        "/api/users/login/",
        { email: email.trim(), password },
        { withCredentials: true },
      );
      // Reload also refreshes the project's UserProvider with the new cookie session.
      window.location.reload();
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    login.mutate();
  }
  return (
    <section className={`${card} mx-auto max-w-lg`}>
      <h1 className="text-2xl font-semibold">
        {register ? "Создать аккаунт" : "Войти в аккаунт"}
      </h1>
      <p className="my-3 text-sm text-[#6c667e]">
        Используйте свой аккаунт Kezek. Доступ к бизнесу появится после
        подтверждения владельцем.
      </p>
      <form className="space-y-3" onSubmit={submit}>
        {register && (
          <>
            <label className="block text-sm">
              Имя
              <input
                className={input}
                required
                value={firstName}
                autoComplete="given-name"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Фамилия
              <input
                className={input}
                value={lastName}
                autoComplete="family-name"
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Телефон
              <input
                className={input}
                type="tel"
                maxLength={20}
                value={phone}
                autoComplete="tel"
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </>
        )}
        <label className="block text-sm">
          Email
          <input
            className={input}
            type="email"
            required
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Пароль
          <input
            className={input}
            type="password"
            required
            value={password}
            autoComplete={register ? "new-password" : "current-password"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {register && (
          <label className="block text-sm">
            Повторите пароль
            <input
              className={input}
              type="password"
              required
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
        )}
        {login.isError && <ErrorBox error={login.error} />}
        <button className={`${primary} w-full`} disabled={login.isPending}>
          {login.isPending
            ? "Подождите…"
            : register
              ? "Зарегистрироваться и войти"
              : "Войти"}
        </button>
      </form>
      <button
        className="mt-4 text-sm text-[#7655bb] underline"
        disabled={login.isPending}
        onClick={() => {
          setRegister(!register);
          login.reset();
        }}
      >
        {register
          ? "Уже есть аккаунт? Войти"
          : "Нет аккаунта? Зарегистрироваться"}
      </button>
    </section>
  );
}
function SignOut() {
  const logout = useMutation({
    mutationFn: () =>
      api.post("/api/users/logout/", {}, { withCredentials: true }),
    onSuccess: () => window.location.reload(),
  });
  return (
    <>
      <button
        className={button}
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        Сменить аккаунт
      </button>
      {logout.isError && <ErrorBox error={logout.error} />}
    </>
  );
}
function Invitation() {
  const { token = "" } = useParams();
  const me = useAccount();
  const client = useQueryClient();
  const key = ["staff-invitation", token, me.data?.id];
  const invitation = useQuery({
    queryKey: key,
    queryFn: () => staffAccess.invitation(token),
    enabled: !!me.data,
    retry: false,
    refetchInterval: 10000,
  });
  const apply = useMutation({
    mutationFn: () => staffAccess.apply(token),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
  if (me.isPending) return <p>Проверяем аккаунт…</p>;
  if (me.isError)
    return <ErrorBox error={me.error} retry={() => void me.refetch()} />;
  if (!me.data) return <LoginForm />;
  if (invitation.isPending) return <p>Загрузка приглашения…</p>;
  if (invitation.isError)
    return (
      <div className={card}>
        <ErrorBox error={invitation.error} />
        <p className="mt-4">Попросите владельца прислать новую ссылку.</p>
        <div className="mt-3">
          <SignOut />
        </div>
      </div>
    );
  const info = invitation.data;
  return (
    <section className={`${card} mx-auto max-w-xl`}>
      <h1 className="text-2xl font-semibold">
        Приглашение в {info.staff.business_name}
      </h1>
      <p className="mt-3">
        Профиль мастера: {info.staff.first_name} {info.staff.last_name}
      </p>
      <p className="mt-2 break-words text-sm text-[#6c667e]">
        Ваш аккаунт: {info.account.first_name} {info.account.last_name} ·{" "}
        {info.account.email}
      </p>
      <div className="mt-4">
        <SignOut />
      </div>
      <div className="mt-6 rounded-xl bg-[#f7f5fd] p-4">
        {info.status === "approved" ? (
          <>
            <p>Заявка подтверждена владельцем.</p>
            <Link to="/staff" className={`${primary} mt-3 inline-block`}>
              Открыть кабинет
            </Link>
          </>
        ) : info.status === "pending" && info.valid ? (
          <>
            <p>Заявка отправлена. Ждём подтверждения владельца.</p>
            <p className="mt-2 text-sm text-[#6c667e]">
              Страница обновляется автоматически. Данные бизнеса станут доступны
              после подтверждения.
            </p>
          </>
        ) : info.status === "rejected" ? (
          <p>
            Заявка отклонена. Свяжитесь с владельцем для нового приглашения.
          </p>
        ) : !info.valid ? (
          <p>Приглашение истекло или отозвано. Попросите новую ссылку.</p>
        ) : (
          <>
            <p>
              Владелец сверит ваш аккаунт и подтвердит доступ к этому профилю.
            </p>
            <button
              className={`${primary} mt-4`}
              disabled={apply.isPending}
              onClick={() => apply.mutate()}
            >
              {apply.isPending ? "Отправляем…" : "Отправить заявку"}
            </button>
          </>
        )}
      </div>
      {apply.isError && (
        <div className="mt-3">
          <ErrorBox error={apply.error} />
        </div>
      )}
    </section>
  );
}
function Portal() {
  const me = useAccount();
  const memberships = useQuery({
    queryKey: ["staff-memberships", me.data?.id],
    queryFn: staffAccess.memberships,
    enabled: !!me.data,
    retry: false,
    refetchInterval: 15000,
  });
  const [selected, setSelected] = useState<number | null>(null);
  if (me.isPending) return <p>Проверяем аккаунт…</p>;
  if (me.isError)
    return <ErrorBox error={me.error} retry={() => void me.refetch()} />;
  if (!me.data) return <LoginForm />;
  if (memberships.isPending) return <p>Загрузка кабинета…</p>;
  if (memberships.isError)
    return (
      <ErrorBox
        error={memberships.error}
        retry={() => void memberships.refetch()}
      />
    );
  const list = memberships.data;
  const current = list.find((s) => s.id === selected) || list[0];
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="break-words text-sm">
          {me.data.first_name} · {me.data.email}
        </p>
        <SignOut />
      </div>
      {!current ? (
        <section className={card}>
          <h1 className="text-xl font-semibold">Доступ ещё не подключён</h1>
          <p className="mt-3 text-sm text-[#6c667e]">
            Попросите владельца прислать приглашение. Если заявку уже отправили,
            дождитесь подтверждения.
          </p>
          <button
            className={`${button} mt-4`}
            onClick={() => void memberships.refetch()}
          >
            Проверить доступ
          </button>
        </section>
      ) : (
        <>
          <label className="mb-5 block text-sm">
            Бизнес и профиль мастера
            <select
              className={`${input} mt-2`}
              value={current.id}
              onChange={(e) => setSelected(Number(e.target.value))}
            >
              {list.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.business_name} · {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
          </label>
          <StaffWorkspace key={current.id} staff={current} />
        </>
      )}
    </>
  );
}
function StaffWorkspace({ staff }: { staff: StaffMembership }) {
  const [tab, setTab] = useState<"appointments" | "schedule" | "services">(
    "appointments",
  );
  return (
    <>
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Разделы кабинета">
        {(
          [
            ["appointments", "Мои записи"],
            ["schedule", "Мой график"],
            ["services", "Мои услуги"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? primary : button}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "appointments" ? (
        <Appointments staff={staff} />
      ) : tab === "schedule" ? (
        <Schedule staffId={staff.id} />
      ) : (
        <Services staffId={staff.id} />
      )}
    </>
  );
}
function Appointments({ staff }: { staff: StaffMembership }) {
  const [date, setDate] = useState(today);
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const key = ["staff-appointments", staff.id, date, page];
  const query = useQuery({
    queryKey: key,
    queryFn: () => staffAccess.appointments(staff.id, date, page),
    retry: false,
    refetchInterval: 15000,
  });
  const complete = useMutation({
    mutationFn: (id: number) => staffAccess.complete(staff.id, id),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ["staff-appointments", staff.id],
      });
    },
  });
  return (
    <section className={card}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Мои записи</h1>
        <label className="text-sm">
          Дата
          <input
            type="date"
            className={`${input} mt-1`}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      {complete.isError && (
        <div className="mb-4">
          <ErrorBox error={complete.error} />
        </div>
      )}
      {query.isError ? (
        <ErrorBox error={query.error} retry={() => void query.refetch()} />
      ) : query.isPending ? (
        <p>Загрузка записей…</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-[#6c667e]">
            Найдено записей: {query.data.count}
          </p>
          {query.data.data.length === 0 && (
            <p>На выбранную дату записей нет.</p>
          )}
          <div className="space-y-3">
            {query.data.data.map((a) => (
              <article
                key={a.id}
                className="rounded-xl border border-[#e7e3f0] p-4"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold">
                    {time(a.start_at)}–{time(a.end_at)} · {a.service_name}
                  </p>
                  <span className="rounded-full bg-[#f1ecfa] px-3 py-1 text-xs">
                    {statuses[a.status] || a.status}
                  </span>
                </div>
                <p className="mt-3">
                  {a.client_first_name} {a.client_last_name}
                </p>
                <a
                  href={`tel:${a.client_phone}`}
                  className="text-sm text-[#7655bb]"
                >
                  {a.client_phone}
                </a>
                {a.comment && (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[#6c667e]">
                    {a.comment}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">{money(a.price)}</p>
                  {staff.can_complete && a.status === "confirmed" && (
                    <button
                      className={button}
                      disabled={complete.isPending}
                      onClick={() => {
                        if (window.confirm("Завершить эту запись?"))
                          complete.mutate(a.id);
                      }}
                    >
                      Завершить запись
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              className={button}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </button>
            <span className="text-sm">
              {page} / {query.data.total_pages}
            </span>
            <button
              className={button}
              disabled={page >= query.data.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Далее
            </button>
          </div>
        </>
      )}
    </section>
  );
}
function Schedule({ staffId }: { staffId: number }) {
  const query = useQuery({
    queryKey: ["staff-schedule", staffId],
    queryFn: () => staffAccess.schedule(staffId),
    retry: false,
    refetchInterval: 15000,
  });
  if (query.isError)
    return <ErrorBox error={query.error} retry={() => void query.refetch()} />;
  if (query.isPending) return <p>Загрузка графика…</p>;
  const data = query.data;
  return (
    <section className={card}>
      <h1 className="text-xl font-semibold">Мой график</h1>
      <p className="mb-5 mt-2 text-sm text-[#6c667e]">
        Для изменения графика обратитесь к владельцу бизнеса.
      </p>
      <div className="space-y-3">
        {weekdays.map((label, index) => {
          const hours = data.working_hours.find((w) => w.weekday === index);
          return (
            <div
              key={index}
              className="flex flex-wrap justify-between gap-2 border-b border-[#eeeaf5] py-3"
            >
              <p className="font-medium">{label}</p>
              <div className="text-sm">
                <p>
                  {!hours
                    ? "График не задан"
                    : !hours.is_working_day
                      ? "Выходной"
                      : `${hours.start_time.slice(0, 5)}–${hours.end_time.slice(0, 5)}`}
                </p>
                {hours?.is_working_day &&
                  data.breaks
                    .filter((b) => b.weekday === index)
                    .map((b, i) => (
                      <p key={i} className="text-[#6c667e]">
                        Перерыв: {b.start_time.slice(0, 5)}–
                        {b.end_time.slice(0, 5)}
                      </p>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
      <h2 className="mt-6 font-semibold">Выходные в течение года</h2>
      {!data.days_off.length && (
        <p className="mt-2 text-sm text-[#6c667e]">
          Дополнительных выходных нет.
        </p>
      )}
      {data.days_off.map((d) => (
        <p key={d.date} className="mt-2 text-sm">
          {d.date} {d.reason && `· ${d.reason}`}
        </p>
      ))}
    </section>
  );
}
function Services({ staffId }: { staffId: number }) {
  const query = useQuery({
    queryKey: ["staff-services", staffId],
    queryFn: () => staffAccess.services(staffId),
    retry: false,
    refetchInterval: 15000,
  });
  if (query.isError)
    return <ErrorBox error={query.error} retry={() => void query.refetch()} />;
  if (query.isPending) return <p>Загрузка услуг…</p>;
  return (
    <section className={card}>
      <h1 className="mb-5 text-xl font-semibold">Мои услуги</h1>
      {!query.data.length && <p>Владелец пока не назначил активные услуги.</p>}
      <div className="space-y-3">
        {query.data.map((s) => (
          <article
            key={s.id}
            className="rounded-xl border border-[#e7e3f0] p-4"
          >
            <h2 className="font-semibold">{s.name}</h2>
            {s.description && (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[#6c667e]">
                {s.description}
              </p>
            )}
            <p className="mt-3 text-sm">
              {s.duration_minutes} мин · {money(s.price)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

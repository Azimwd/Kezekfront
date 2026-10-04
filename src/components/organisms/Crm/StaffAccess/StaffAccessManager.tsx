import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "../../../../context/BusinessContext";
import {
  staffAccess,
  staffError,
  type OwnerStaff,
} from "../../../../api/staffAccess";
const button =
  "rounded-xl border border-[#dedbe9] px-4 py-2 text-sm disabled:opacity-50 hover:bg-[#f6f4ff]";
export default function StaffAccessManager() {
  const { selectedBusiness } = useBusiness();
  const businessId = Number(selectedBusiness?.id);
  return businessId > 0 ? (
    <AccessPanel key={businessId} businessId={businessId} />
  ) : null;
}
function AccessPanel({ businessId }: { businessId: number }) {
  const client = useQueryClient();
  const [links, setLinks] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const key = ["staff-access-owner", businessId];
  const query = useQuery({
    queryKey: key,
    queryFn: () => staffAccess.ownerList(businessId),
    refetchInterval: 15000,
  });
  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: key });
    },
    onError: (e) => setError(staffError(e)),
  });
  function run(action: () => Promise<unknown>) {
    setError("");
    setNotice("");
    mutation.mutate(action);
  }
  async function invite(staff: OwnerStaff) {
    const result = await staffAccess.invite(staff.id);
    setLinks((current) => ({
      ...current,
      [staff.id]: `${window.location.origin}/staff/invite/${result.token}`,
    }));
    setNotice(
      "Ссылка готова. Передайте её сотруднику лично. Она действует 3 дня.",
    );
  }
  function clearLink(id: number) {
    setLinks((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }
  return (
    <section className="mt-8 rounded-2xl border border-[#e7e3f0] bg-white p-5 sm:p-7">
      <h2 className="text-xl font-semibold">Доступ сотрудников</h2>
      <p className="mt-2 text-sm text-[#6c667e]">
        Создайте приглашение для мастера. После входа сотрудник отправит заявку
        — проверьте аккаунт и подтвердите доступ.
      </p>
      <a
        className="mt-3 inline-block text-sm text-[#6950b9] underline"
        href="/staff"
      >
        Открыть кабинет сотрудника
      </a>
      <input
        className="my-4 w-full rounded-xl border p-3"
        aria-label="Поиск сотрудника"
        placeholder="Поиск по имени"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {(error || query.isError) && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error || staffError(query.error)}{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Обновить
          </button>
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-sm text-green-800">
          {notice}
        </p>
      )}
      {query.isPending ? (
        <p>Загрузка сотрудников…</p>
      ) : query.data?.length === 0 ? (
        <p>Сначала добавьте мастера в разделе «Персонал».</p>
      ) : null}
      <div className="space-y-4">
        {query.data
          ?.filter((s) =>
            `${s.first_name} ${s.last_name}`
              .toLowerCase()
              .includes(filter.toLowerCase()),
          )
          .map((staff) => (
            <article
              key={staff.id}
              className="rounded-xl border border-[#e7e3f0] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {staff.first_name} {staff.last_name}
                  </h3>
                  <p className="text-sm text-[#6c667e]">
                    {staff.access_active
                      ? "Доступ подтверждён"
                      : staff.linked_user
                        ? "Старая привязка — доступ ещё не подтверждён"
                        : "Аккаунт не привязан"}
                    {!staff.is_active && " · мастер отключён"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {staff.linked_user ? (
                    <button
                      className={button}
                      disabled={mutation.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Отозвать доступ этого аккаунта? Профиль мастера и записи сохранятся.",
                          )
                        )
                          run(async () => {
                            await staffAccess.revoke(staff.id);
                            clearLink(staff.id);
                          });
                      }}
                    >
                      Отозвать доступ
                    </button>
                  ) : (
                    <>
                      <button
                        className={button}
                        disabled={mutation.isPending || !staff.is_active}
                        onClick={() => {
                          if (
                            !staff.invitation_expires_at ||
                            window.confirm(
                              "Создать новую ссылку? Предыдущая ссылка и её заявки будут отозваны.",
                            )
                          )
                            run(() => invite(staff));
                        }}
                      >
                        {staff.invitation_expires_at
                          ? "Новая ссылка"
                          : "Пригласить"}
                      </button>
                      {staff.invitation_expires_at && (
                        <button
                          className={button}
                          disabled={mutation.isPending}
                          onClick={() =>
                            run(async () => {
                              await staffAccess.cancelInvite(staff.id);
                              clearLink(staff.id);
                            })
                          }
                        >
                          Отозвать ссылку
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {staff.linked_user && (
                <p className="mt-3 break-words text-sm">
                  {staff.linked_user.email} ·{" "}
                  {staff.linked_user.phone || "Телефон не указан"}
                </p>
              )}
              {staff.access_active && (
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={staff.can_complete}
                    disabled={mutation.isPending}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      run(() => staffAccess.permission(staff.id, enabled));
                    }}
                  />
                  Разрешить завершать подтверждённые записи
                </label>
              )}
              {links[staff.id] && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-lg border p-2 text-sm"
                    readOnly
                    aria-label={`Ссылка для ${staff.first_name}`}
                    value={links[staff.id]}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className={button}
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(links[staff.id])
                        .then(() => setNotice("Ссылка скопирована."))
                        .catch(() =>
                          setError("Выделите ссылку и скопируйте вручную."),
                        );
                    }}
                  >
                    Копировать
                  </button>
                </div>
              )}
              {staff.invitation_expires_at && (
                <p className="mt-2 text-xs text-[#6c667e]">
                  Приглашение до{" "}
                  {new Date(staff.invitation_expires_at).toLocaleString(
                    "ru-RU",
                  )}
                </p>
              )}
              {staff.requests.map((claim) => (
                <div
                  key={claim.id}
                  className="mt-4 rounded-xl bg-[#f7f5fd] p-4"
                >
                  <p className="font-medium">
                    Заявка: {claim.user.first_name} {claim.user.last_name}
                  </p>
                  <p className="break-words text-sm">
                    {claim.user.email} ·{" "}
                    {claim.user.phone || "Телефон не указан"}
                  </p>
                  <p className="mt-1 text-xs text-[#6c667e]">
                    {claim.user.is_phone_verified
                      ? "Телефон подтверждён в аккаунте"
                      : "Телефон не подтверждён"}
                    . Сверьте аккаунт с сотрудником лично.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className={button}
                      disabled={mutation.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Подтвердить доступ ${claim.user.email} к профилю ${staff.first_name} ${staff.last_name}?`,
                          )
                        )
                          run(() =>
                            staffAccess.review(staff.id, claim.id, "approve"),
                          );
                      }}
                    >
                      Подтвердить
                    </button>
                    <button
                      className={button}
                      disabled={mutation.isPending}
                      onClick={() =>
                        run(() =>
                          staffAccess.review(staff.id, claim.id, "reject"),
                        )
                      }
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </article>
          ))}
      </div>
    </section>
  );
}

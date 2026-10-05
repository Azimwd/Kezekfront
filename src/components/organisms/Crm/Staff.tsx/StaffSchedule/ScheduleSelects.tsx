import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import Select, { type SelectOption } from "../../../../atoms/Select";
import { getAllMasters } from "../../../../../api/staff";
import { useBusiness } from "../../../../../context/BusinessContext";
interface ScheduleSelectsProps {
  onStaffSelect: (id: number | null) => void;
}
export default function ScheduleSelects({
  onStaffSelect,
}: ScheduleSelectsProps) {
  const { selectedBusiness } = useBusiness();
  const businessId = Number(selectedBusiness?.id);
  const [selectedSpecialist, setSelectedSpecialist] =
    useState<SelectOption | null>(null);
  const [searchParams] = useSearchParams();
  const staffIdFromUrl = searchParams.get("staff_id");
  const query = useQuery({
    queryKey: ["all-masters", businessId],
    queryFn: () => getAllMasters(businessId),
    enabled: businessId > 0,
    retry: false,
  });
  const options = useMemo<SelectOption[]>(
    () =>
      (query.data ?? []).map((master) => ({
        id: master.id,
        label: `${master.first_name}${master.position ? ` (${master.position})` : ""}`,
      })),
    [query.data],
  );
  const storageKey = `kezek_selected_staff_${businessId}`;
  useEffect(() => {
    if (!options.length) {
      setSelectedSpecialist(null);
      return;
    }
    let savedId: string | null = null;
    try {
      savedId = localStorage.getItem(storageKey);
    } catch {
      /* optional */
    }
    const fromUrl = options.find(
      (staff) => String(staff.id) === staffIdFromUrl,
    );
    const saved = options.find((staff) => String(staff.id) === savedId);
    setSelectedSpecialist(fromUrl ?? saved ?? options[0]);
  }, [options, staffIdFromUrl, storageKey]);
  useEffect(() => {
    onStaffSelect(selectedSpecialist ? Number(selectedSpecialist.id) : null);
  }, [selectedSpecialist?.id, onStaffSelect]);
  function choose(specialist: SelectOption) {
    setSelectedSpecialist(specialist);
    try {
      localStorage.setItem(storageKey, String(specialist.id));
    } catch {
      /* optional */
    }
  }
  return (
    <div
      data-tour="schedule-specialist"
      className="ml-auto w-full rounded-2xl border border-[#c7c4d8] bg-white p-4 md:w-[280px]"
    >
      <p className="mb-2 text-sm font-medium text-slate-600">Специалист</p>
      {query.isError ? (
        <div role="alert" className="text-sm text-red-700">
          Не удалось загрузить специалистов.{" "}
          <button
            type="button"
            onClick={() => query.refetch()}
            className="underline"
          >
            Повторить
          </button>
        </div>
      ) : (
        <Select
          options={options}
          value={
            selectedSpecialist ?? {
              id: 0,
              label: query.isPending ? "Загрузка…" : "Нет специалистов",
            }
          }
          onChange={choose}
          className={`w-full ${query.isPending || !options.length ? "pointer-events-none opacity-50" : ""}`}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addDays, format, startOfDay, subDays } from "date-fns";

import {
  BriefcaseBusiness,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Percent,
  UserRound,
  UsersRound,
} from "lucide-react";

import { useBusiness } from "../../../../context/BusinessContext";

import {
  getAppointmentPrice,
  getDashboardBusiness,
  getDashboardData,
  type DashboardAppointment,
} from "../../../../api/dashboard";

import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  confirmAppointmentPrepayment,
} from "../../../../api/appointments";

import StatCard from "../../../molecules/Crm/Dashboard/StatCard";

import MiniStatCard from "../../../molecules/Crm/Dashboard/MiniStatCard";

import AppointmentsChart from "../../../molecules/Crm/Dashboard/AppointmentsChart";

import TodayAppointments from "../../../molecules/Crm/Dashboard/TodayAppointments";

import AttentionCard from "../../../molecules/Crm/Dashboard/AttentionCard";

import QuickActions from "../../../molecules/Crm/Dashboard/QuickActions";

import TomorrowCard from "../../../molecules/Crm/Dashboard/TomorrowCard";

export default function DashboardControl() {
  const queryClient = useQueryClient();

  const { selectedBusiness } = useBusiness();

  const businessId = selectedBusiness?.id ? Number(selectedBusiness.id) : null;

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const {
    data: dashboardData,

    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ["dashboard-data", businessId],

    queryFn: () => getDashboardData(businessId!),

    enabled: !!businessId,
  });

  const { data: business } = useQuery({
    queryKey: ["dashboard-business", businessId],

    queryFn: () => getDashboardBusiness(businessId!),

    enabled: !!businessId,
  });

  const refreshDashboard = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["dashboard-data", businessId],
      }),

      queryClient.invalidateQueries({
        queryKey: ["dashboard-business", businessId],
      }),

      queryClient.invalidateQueries({
        queryKey: ["appointments"],
      }),
    ]);
  };

  const confirmMutation = useMutation({
    mutationFn: (appointmentId: number) => confirmAppointment(appointmentId),

    onMutate: (appointmentId) => {
      setActionLoadingId(appointmentId);
    },

    onSuccess: refreshDashboard,

    onSettled: () => {
      setActionLoadingId(null);
    },
  });

  const confirmPrepaymentMutation = useMutation({
    mutationFn: (appointmentId: number) =>
      confirmAppointmentPrepayment(appointmentId),

    onMutate: (appointmentId) => {
      setActionLoadingId(appointmentId);
    },

    onSuccess: refreshDashboard,

    onSettled: () => {
      setActionLoadingId(null);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (appointmentId: number) => completeAppointment(appointmentId),

    onMutate: (appointmentId) => {
      setActionLoadingId(appointmentId);
    },

    onSuccess: refreshDashboard,

    onSettled: () => {
      setActionLoadingId(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: number) => cancelAppointment(appointmentId),

    onMutate: (appointmentId) => {
      setActionLoadingId(appointmentId);
    },

    onSuccess: refreshDashboard,

    onSettled: () => {
      setActionLoadingId(null);
    },
  });

  const appointments = useMemo<DashboardAppointment[]>(
    () => dashboardData?.data ?? [],

    [dashboardData],
  );

  const handleConfirmAppointment = (appointmentId: number) => {
    const appointment = appointments.find(
      (item) => item.id === appointmentId,
    ) as any;

    if (appointment?.prepayment?.status === "pending") {
      confirmPrepaymentMutation.mutate(appointmentId);

      return;
    }

    confirmMutation.mutate(appointmentId);
  };

  const todayKey = format(
    new Date(),

    "yyyy-MM-dd",
  );

  const tomorrowKey = format(
    addDays(
      new Date(),

      1,
    ),

    "yyyy-MM-dd",
  );

  const sevenDaysAgo = startOfDay(
    subDays(
      new Date(),

      6,
    ),
  );

  const todayAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      return (
        format(
          new Date(appointment.start_at),

          "yyyy-MM-dd",
        ) === todayKey
      );
    });
  }, [appointments, todayKey]);

  const tomorrowAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      return (
        format(
          new Date(appointment.start_at),

          "yyyy-MM-dd",
        ) === tomorrowKey
      );
    });
  }, [appointments, tomorrowKey]);

  const last7Appointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.start_at);

      return appointmentDate >= sevenDaysAgo;
    });
  }, [appointments, sevenDaysAgo]);

  const last7Revenue = useMemo(() => {
    return last7Appointments

      .filter((appointment) => appointment.status === "completed")

      .reduce(
        (
          total,

          appointment,
        ) => total + getAppointmentPrice(appointment),

        0,
      );
  }, [last7Appointments]);

  const cancelledWeek = useMemo(() => {
    return last7Appointments.filter((appointment) => {
      return (
        appointment.status === "cancelled" ||
        appointment.status === "cancelled_by_client" ||
        appointment.status === "cancelled_by_business"
      );
    });
  }, [last7Appointments]);

  const completedForConversion = appointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;

  const cancelledForConversion = appointments.filter(
    (appointment) =>
      appointment.status === "cancelled" ||
      appointment.status === "cancelled_by_client" ||
      appointment.status === "cancelled_by_business",
  ).length;

  const conversionBase = completedForConversion + cancelledForConversion;

  const conversion =
    conversionBase > 0
      ? Math.round((completedForConversion / conversionBase) * 100)
      : 0;

  const summary = dashboardData?.summary;

  const todayCount = summary?.today_count ?? todayAppointments.length;

  const pendingCount = summary?.pending_count ?? 0;

  const confirmedCount = summary?.confirmed_count ?? 0;

  const completedCount = summary?.completed_count ?? 0;

  const completedRevenue = Number(summary?.completed_revenue ?? 0);

  const expectedRevenue = Number(summary?.expected_revenue ?? 0);

  return (
    <div className="min-h-full min-w-0 bg-[#F7F8FD] px-3 py-4 sm:px-4 sm:py-5 md:px-5 xl:px-6 xl:py-6">
      <div className="mx-auto w-full min-w-0 max-w-[1600px]">
        <div className="mb-4 flex w-full min-w-0 justify-end sm:mb-6"></div>
        {!businessId ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#D9DDEC] bg-white">
            <span className="text-[14px] text-[#667085]">
              У вас пока нет бизнесов.
            </span>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,0.9fr)]">
            <div className="min-w-0 space-y-5">
              <div className="grid min-w-0 grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  title="Сегодня"

                  value={isDashboardLoading ? "..." : todayCount}

                  subtitle="записей"

                  icon={CalendarDays}
                />

                <StatCard
                  title="Ожидают"

                  value={isDashboardLoading ? "..." : pendingCount}

                  icon={CalendarClock}

                  variant="orange"
                />

                <StatCard
                  title="Подтверждены"

                  value={isDashboardLoading ? "..." : confirmedCount}

                  icon={CalendarCheck}
                />

                <StatCard
                  title="Завершены"

                  value={isDashboardLoading ? "..." : completedCount}

                  icon={CheckCircle2}

                  variant="green"
                />
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
                <div className="grid min-w-0 grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 lg:grid-cols-1">
                  <div className="flex min-h-[108px] flex-col justify-center rounded-2xl border border-[#D9DDEC] border-l-4 border-l-[#4F46E5] bg-white p-4 shadow-sm">
                    <div className="text-[12px] font-medium text-[#667085]">
                      Доход (Завершенные)
                    </div>

                    <div className="mt-3 break-words text-[22px] font-bold sm:text-[26px] leading-none text-[#101828]">
                      {completedRevenue.toLocaleString("ru-RU")} ₸
                    </div>
                  </div>

                  <div className="flex min-h-[108px] flex-col justify-center rounded-2xl border border-[#D9DDEC] bg-white p-4 shadow-sm">
                    <div className="text-[12px] font-medium text-[#667085]">
                      Ожидаемый (Подтв.)
                    </div>

                    <div className="mt-3 break-words text-[22px] font-bold sm:text-[24px] leading-none text-[#101828]">
                      {expectedRevenue.toLocaleString("ru-RU")} ₸
                    </div>
                  </div>
                </div>

                <AppointmentsChart
                  appointments={last7Appointments}

                  revenue={last7Revenue}
                />
              </div>

              <TodayAppointments
                appointments={todayAppointments}

                totalCount={todayAppointments.length}

                isLoading={isDashboardLoading}

                actionLoadingId={actionLoadingId}

                onConfirm={(id) => handleConfirmAppointment(id)}

                onComplete={(id) => completeMutation.mutate(id)}

                onCancel={(id) => cancelMutation.mutate(id)}
              />
            </div>

            <div className="min-w-0 space-y-5">
              <div className="grid min-w-0 grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4">
                <MiniStatCard
                  title="Услуги"

                  value={business?.services_count ?? 0}

                  icon={BriefcaseBusiness}
                />

                <MiniStatCard
                  title="Мастеров"

                  value={business?.staff_count ?? 0}

                  icon={UserRound}
                />

                <MiniStatCard
                  title="Отмены (7 дн.)"

                  value={cancelledWeek.length}

                  icon={UsersRound}
                />

                <MiniStatCard
                  title="Конверсия"

                  value={`${conversion}%`}

                  icon={Percent}

                  highlight
                />
              </div>

              <AttentionCard pendingCount={pendingCount} />

              <QuickActions />

              <TomorrowCard appointments={tomorrowAppointments} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

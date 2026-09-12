import {
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    Percent,
    Scissors,
    UserRound,
    UsersRound,
    WalletCards
} from 'lucide-react';

import StatCard
    from '../../../molecules/Crm/Dashboard/StatCard';

import MiniStatCard
    from '../../../molecules/Crm/Dashboard/MiniStatCard';

import AppointmentsChart
    from '../../../molecules/Crm/Dashboard/AppointmentsChart';

import TodayAppointments
    from '../../../molecules/Crm/Dashboard/TodayAppointments';

import AttentionCard
    from '../../../molecules/Crm/Dashboard/AttentionCard';

import QuickActions
    from '../../../molecules/Crm/Dashboard/QuickActions';

import TomorrowCard
    from '../../../molecules/Crm/Dashboard/TomorrowCard';


export default function DashboardControl() {

    return (
        <div
            className="
                min-h-full
                bg-[#F7F8FD]
                p-4
                sm:p-6
            "
        >

            {/* HEADER */}

            <div
                className="
                    mb-6
                    flex
                    flex-col
                    gap-4
                    xl:flex-row
                    xl:items-start
                    xl:justify-between
                "
            >

                <div>

                    <h1
                        className="
                            text-3xl
                            font-bold
                            tracking-tight
                            text-[#0F172A]
                        "
                    >
                        Dashboard
                    </h1>


                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-500
                        "
                    >
                        Обзор бизнеса, записей,
                        мастеров, услуг и дохода.
                    </p>

                </div>


                {/* BUSINESS */}

                <button
                    type="button"
                    className="
                        flex
                        min-w-[230px]
                        items-center
                        gap-3
                        self-start
                        rounded-2xl
                        border
                        border-[#D9DDED]
                        bg-white
                        px-3
                        py-2.5
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-50
                        "
                    >
                        <Scissors
                            size={17}
                            className="
                                text-[#4F46E5]
                            "
                        />
                    </div>


                    <div
                        className="
                            flex-1
                            text-left
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    text-slate-800
                                "
                            >
                                Premium Barbershop
                            </span>


                            <span
                                className="
                                    rounded
                                    bg-green-50
                                    px-1.5
                                    py-0.5
                                    text-[8px]
                                    font-semibold
                                    text-green-600
                                "
                            >
                                ACTIVE
                            </span>

                        </div>


                        <div
                            className="
                                mt-0.5
                                text-[9px]
                                text-slate-400
                            "
                        >
                            Алматы, пр. Абая
                        </div>

                    </div>


                    <span
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        ⌄
                    </span>

                </button>

            </div>


            {/* MAIN GRID */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-5
                    xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]
                "
            >

                {/* LEFT */}

                <div
                    className="
                        min-w-0
                        space-y-5
                    "
                >

                    {/* TOP STATS */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        <StatCard
                            title="Сегодня"
                            value={12}
                            subtitle="записей"
                            icon={CalendarDays}
                            variant="blue"
                        />


                        <StatCard
                            title="Ожидают"
                            value={3}
                            icon={CalendarClock}
                            variant="orange"
                            badge="+1"
                        />


                        <StatCard
                            title="Подтверждены"
                            value={5}
                            icon={CalendarCheck}
                            variant="blue"
                        />


                        <StatCard
                            title="Завершены"
                            value={4}
                            icon={CheckCircle2}
                            variant="green"
                        />

                    </div>


                    {/* REVENUE + CHART */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            lg:grid-cols-[190px_1fr]
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                            "
                        >

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-[#D9DDED]
                                    border-l-4
                                    border-l-[#4F46E5]
                                    bg-white
                                    p-4
                                    shadow-sm
                                "
                            >

                                <div
                                    className="
                                        text-[10px]
                                        text-slate-500
                                    "
                                >
                                    Доход (Завершенные)
                                </div>


                                <div
                                    className="
                                        mt-1
                                        text-2xl
                                        font-bold
                                        text-[#0F172A]
                                    "
                                >
                                    10 000 ₸
                                </div>


                                <div
                                    className="
                                        mt-2
                                        inline-flex
                                        rounded
                                        bg-green-50
                                        px-1.5
                                        py-0.5
                                        text-[8px]
                                        text-green-600
                                    "
                                >
                                    ↑ 12% к прошлому дню
                                </div>

                            </div>


                            <div
                                className="
                                    flex-1
                                    rounded-2xl
                                    border
                                    border-[#D9DDED]
                                    bg-white
                                    p-4
                                    shadow-sm
                                "
                            >

                                <div
                                    className="
                                        text-[10px]
                                        text-slate-500
                                    "
                                >
                                    Ожидаемый (Подтв.)
                                </div>


                                <div
                                    className="
                                        mt-2
                                        text-xl
                                        font-bold
                                        text-[#0F172A]
                                    "
                                >
                                    5 000 ₸
                                </div>

                            </div>

                        </div>


                        <AppointmentsChart />

                    </div>


                    {/* TABLE */}

                    <TodayAppointments />

                </div>


                {/* RIGHT */}

                <div
                    className="
                        min-w-0
                        space-y-5
                    "
                >

                    {/* SMALL STATS */}

                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-3
                        "
                    >

                        <MiniStatCard
                            title="Услуги"
                            value={24}
                            icon={WalletCards}
                        />


                        <MiniStatCard
                            title="Мастеров"
                            value={5}
                            icon={UserRound}
                        />


                        <MiniStatCard
                            title="Отмены (нед)"
                            value={2}
                            icon={UsersRound}
                        />


                        <MiniStatCard
                            title="Конверсия"
                            value="85%"
                            icon={Percent}
                            highlight
                        />

                    </div>


                    <AttentionCard />


                    <QuickActions />


                    <TomorrowCard />

                </div>

            </div>

        </div>
    );
}
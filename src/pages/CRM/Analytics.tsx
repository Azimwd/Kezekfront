import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import type {
    FormEvent,
    ReactNode,
} from 'react';

import {
    BarChart,
    Bar,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Download } from 'lucide-react';

import {
    downloadAnalytics,
    getAnalytics,
    getAnalyticsBusinesses,
    getAnalyticsOptions,
} from '../../api/analytics';

import type {
    AnalyticsFilters,
    AnalyticsGroup,
    AnalyticsOption,
    AnalyticsOptions,
    AnalyticsReport,
    AnalyticsSummary,
} from '../../api/analytics';


const TIMEZONE = 'Asia/Almaty';

const COLORS = [
    '#A78BFA',
    '#60A5FA',
    '#FB7185',
    '#F97316',
    '#34D399',
    '#94A3B8',
];

const WEEKDAYS = [
    'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС',
];

const STATUS_OPTIONS = [
    ['pending', 'Ожидает'],
    ['confirmed', 'Подтверждена'],
    ['cancelled_by_client', 'Отменена клиентом'],
    ['cancelled_by_business', 'Отменена бизнесом'],
    ['completed', 'Завершена'],
    ['no_show', 'Клиент не пришёл'],
];

type Metric = 'revenue' | 'appointments' | 'clients';

const METRIC_LABELS: Record<Metric, string> = {
    revenue: 'Стоимость завершённых',
    appointments: 'Записи',
    clients: 'Клиенты с записями',
};

const numberFormatter = new Intl.NumberFormat('ru-KZ', {
    maximumFractionDigits: 2,
});

function number(value: string | number): string {
    return numberFormatter.format(Number(value));
}

function money(value: string | number): string {
    return `${number(value)} ₸`;
}

function currentLocalDate(): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());

    const get = (type: string) =>
        parts.find(part => part.type === type)?.value ?? '';

    return `${get('year')}-${get('month')}-${get('day')}`;
}

function shiftDate(value: string, days: number): string {
    const day = new Date(`${value}T00:00:00Z`);

    day.setUTCDate(day.getUTCDate() + days);

    return day.toISOString().slice(0, 10);
}

function period(days: number): AnalyticsFilters {
    const dateTo = currentLocalDate();

    return {
        date_from: shiftDate(dateTo, -(days - 1)),
        date_to: dateTo,
    };
}

function errorMessage(error: unknown): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
    ) {
        const response = (
            error as {
                response?: { data?: unknown };
            }
        ).response;

        const payload = response?.data;

        if (payload && !(payload instanceof Blob)) {
            return typeof payload === 'string'
                ? payload
                : JSON.stringify(payload);
        }
    }

    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

function Panel({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 rounded-2xl border border-[#e8e5f3] bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-[#30295c]">
                {title}
            </h2>

            {children}
        </section>
    );
}

function GroupTable({
    rows,
    title,
}: {
    rows: AnalyticsGroup[];
    title: string;
}) {
    return (
        <Panel title={title}>
            {!rows.length ? (
                <p className="text-sm text-gray-500">
                    За выбранный период записей нет.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b text-gray-500">
                            <tr>
                                <th className="pb-3 pr-4">Название</th>
                                <th className="pb-3 pr-4 text-right">Записи</th>
                                <th className="pb-3 pr-4 text-right">Завершено</th>
                                <th className="pb-3 pr-4 text-right">Стоимость завершённых</th>
                                <th className="pb-3 text-right">Средний чек</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map(row => (
                                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                                    <td className="py-3 pr-4 font-medium">
                                        {row.name}
                                    </td>

                                    <td className="py-3 pr-4 text-right">
                                        {row.appointments}
                                    </td>

                                    <td className="py-3 pr-4 text-right">
                                        {row.completed}
                                    </td>

                                    <td className="whitespace-nowrap py-3 pr-4 text-right">
                                        {money(row.revenue)}
                                    </td>

                                    <td className="whitespace-nowrap py-3 text-right">
                                        {money(row.average_check)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Panel>
    );
}

const KPI_ITEMS: {
    key: keyof AnalyticsSummary;
    label: string;
    format?: 'money' | 'percent';
    lowerIsBetter?: boolean;
}[] = [
    {
        key: 'revenue',
        label: 'Стоимость завершённых',
        format: 'money',
    },
    {
        key: 'appointments',
        label: 'Всего записей',
    },
    {
        key: 'completed',
        label: 'Завершённые записи',
    },
    {
        key: 'average_check',
        label: 'Средний чек',
        format: 'money',
    },
    {
        key: 'cancellation_rate',
        label: 'Доля отмен',
        format: 'percent',
        lowerIsBetter: true,
    },
    {
        key: 'no_show_rate',
        label: 'Доля неявок',
        format: 'percent',
        lowerIsBetter: true,
    },
    {
        key: 'clients',
        label: 'Клиенты с записями',
    },
    {
        key: 'new_visitors',
        label: 'Новые посетители',
    },
    {
        key: 'returning_visitors',
        label: 'Возвращающиеся посетители',
    },
    {
        key: 'confirmed_prepayments',
        label: 'Подтверждённые предоплаты',
        format: 'money',
    },
];


export default function Analytics() {
    const [businesses, setBusinesses] = useState<AnalyticsOption[]>([]);
    const [businessId, setBusinessId] = useState<number | null>(null);

    const [businessesLoading, setBusinessesLoading] = useState(true);
    const [businessesError, setBusinessesError] = useState('');

    const [optionsState, setOptionsState] = useState<{
        businessId: number;
        value: AnalyticsOptions;
    } | null>(null);

    const [optionsError, setOptionsError] = useState('');

    const [form, setForm] = useState<AnalyticsFilters>(() => period(30));
    const [applied, setApplied] = useState<AnalyticsFilters>(() => period(30));

    const [revision, setRevision] = useState(0);
    const [metric, setMetric] = useState<Metric>('revenue');

    const [reportState, setReportState] = useState<{
        key: string;
        value: AnalyticsReport;
    } | null>(null);

    const [reportError, setReportError] = useState('');
    const [exportError, setExportError] = useState('');
    const [exporting, setExporting] = useState(false);

    const requestKey = JSON.stringify([
        businessId,
        applied,
        revision,
    ]);

    const report = reportState?.key === requestKey
        ? reportState.value
        : null;

    const options = optionsState?.businessId === businessId
        ? optionsState.value
        : null;

    useEffect(() => {
        const controller = new AbortController();

        getAnalyticsBusinesses(controller.signal)
            .then(items => {
                if (controller.signal.aborted) return;

                setBusinesses(items);
                setBusinessId(items[0]?.id ?? null);
            })
            .catch(error => {
                if (controller.signal.aborted) return;

                setBusinessesError(errorMessage(error));
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setBusinessesLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!businessId) return;

        const controller = new AbortController();

        setOptionsError('');

        getAnalyticsOptions(
            businessId,
            controller.signal
        )
            .then(value => {
                if (controller.signal.aborted) return;

                setOptionsState({
                    businessId,
                    value,
                });
            })
            .catch(error => {
                if (controller.signal.aborted) return;

                setOptionsError(errorMessage(error));
            });

        return () => controller.abort();
    }, [businessId]);

    useEffect(() => {
        if (!businessId) return;

        const controller = new AbortController();

        setReportError('');

        getAnalytics(
            businessId,
            applied,
            controller.signal
        )
            .then(value => {
                if (controller.signal.aborted) return;

                setReportState({
                    key: requestKey,
                    value,
                });
            })
            .catch(error => {
                if (controller.signal.aborted) return;

                setReportError(errorMessage(error));
            });

        return () => controller.abort();
    }, [
        businessId,
        applied,
        revision,
        requestKey,
    ]);

    const daily = useMemo(() => {
        return report?.daily.map(item => ({
            ...item,
            revenue: Number(item.revenue),
            label: `${item.date.slice(8, 10)}.${item.date.slice(5, 7)}`,
        })) ?? [];
    }, [report]);

    const servicesChart = useMemo(() => {
        return report?.services.slice(0, 8).map(item => ({
            ...item,
            revenue: Number(item.revenue),
        })) ?? [];
    }, [report]);

    const staffChart = useMemo(() => {
        return report?.staff.slice(0, 8).map(item => ({
            ...item,
            revenue: Number(item.revenue),
        })) ?? [];
    }, [report]);

    const demand = useMemo(() => {
        const matrix = Array.from(
            { length: 7 },
            () => Array<number>(24).fill(0)
        );

        for (const item of report?.demand ?? []) {
            matrix[item.weekday][item.hour] = item.count;
        }

        return matrix;
    }, [report]);

    const maxDemand = Math.max(
        1,
        ...demand.flat()
    );

    function chooseBusiness(value: string) {
        const nextId = Number(value);

        const nextFilters: AnalyticsFilters = {
            date_from: applied.date_from,
            date_to: applied.date_to,
        };

        setBusinessId(nextId);
        setForm(nextFilters);
        setApplied(nextFilters);
        setExportError('');
    }

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setApplied({ ...form });
        setRevision(value => value + 1);
        setExportError('');
    }

    function choosePeriod(days: number) {
        const dates = period(days);

        const next = {
            ...form,
            ...dates,
        };

        setForm(next);
        setApplied(next);
        setRevision(value => value + 1);
        setExportError('');
    }

    async function exportExcel() {
        if (!businessId || !report || exporting) return;

        setExporting(true);
        setExportError('');

        try {
            await downloadAnalytics(
                businessId,
                { ...applied }
            );
        } catch (error) {
            setExportError(
                `Не удалось скачать Excel. ${errorMessage(error)}`
            );
        } finally {
            setExporting(false);
        }
    }

    if (businessesLoading) {
        return (
            <p className="p-6 text-gray-500">
                Загрузка бизнесов…
            </p>
        );
    }

    if (businessesError) {
        return (
            <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
                {businessesError}
            </p>
        );
    }

    if (!businesses.length) {
        return (
            <Panel title="Аналитика">
                <p className="text-gray-500">
                    Сначала добавь бизнес в разделе «Мои бизнесы».
                </p>
            </Panel>
        );
    }

    const inputClass = (
        'w-full rounded-xl border border-[#ded9ef] ' +
        'bg-white px-3 py-2.5 text-sm outline-none ' +
        'focus:border-violet-500'
    );

    const visitors = report ? [
        {
            name: 'Новые',
            count: report.summary.new_visitors,
        },
        {
            name: 'Возвращающиеся',
            count: report.summary.returning_visitors,
        },
    ] : [];

    const visibleStatuses = report?.statuses.filter(
        item => item.count > 0
    ) ?? [];

    return (
        <div className="space-y-6 text-[#30295c]">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Аналитика бизнеса
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Записи, услуги, мастера и посетители.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={exportExcel}
                    disabled={!report || exporting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#5746d9] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={18} />

                    {exporting
                        ? 'Формируем Excel…'
                        : 'Скачать Excel'}
                </button>
            </div>

            <Panel title="Период и фильтры">
                <div className="mb-5 flex flex-wrap gap-2">
                    {[
                        [1, 'Сегодня'],
                        [7, '7 дней'],
                        [30, '30 дней'],
                        [90, '90 дней'],
                        [365, 'Год'],
                    ].map(([days, label]) => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => choosePeriod(Number(days))}
                            className="rounded-lg border border-[#ded9ef] px-3 py-2 text-sm hover:bg-violet-50"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={applyFilters}
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <label className="space-y-1 text-sm">
                        <span>Бизнес</span>

                        <select
                            value={businessId ?? ''}
                            onChange={event => chooseBusiness(event.target.value)}
                            className={inputClass}
                        >
                            {businesses.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="space-y-1 text-sm">
                        <span>С даты</span>

                        <input
                            type="date"
                            required
                            value={form.date_from}
                            onChange={event => setForm({
                                ...form,
                                date_from: event.target.value,
                            })}
                            className={inputClass}
                        />
                    </label>

                    <label className="space-y-1 text-sm">
                        <span>По дату включительно</span>

                        <input
                            type="date"
                            required
                            min={form.date_from}
                            value={form.date_to}
                            onChange={event => setForm({
                                ...form,
                                date_to: event.target.value,
                            })}
                            className={inputClass}
                        />
                    </label>

                    <label className="space-y-1 text-sm">
                        <span>Мастер</span>

                        <select
                            value={form.staff_id ?? ''}
                            disabled={!options}
                            onChange={event => setForm({
                                ...form,
                                staff_id: event.target.value
                                    ? Number(event.target.value)
                                    : undefined,
                            })}
                            className={inputClass}
                        >
                            <option value="">Все мастера</option>

                            {options?.staff.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="space-y-1 text-sm">
                        <span>Услуга</span>

                        <select
                            value={form.service_id ?? ''}
                            disabled={!options}
                            onChange={event => setForm({
                                ...form,
                                service_id: event.target.value
                                    ? Number(event.target.value)
                                    : undefined,
                            })}
                            className={inputClass}
                        >
                            <option value="">Все услуги</option>

                            {options?.services.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="space-y-1 text-sm">
                        <span>Статус</span>

                        <select
                            value={form.status ?? ''}
                            onChange={event => setForm({
                                ...form,
                                status: event.target.value || undefined,
                            })}
                            className={inputClass}
                        >
                            <option value="">Все статусы</option>

                            {STATUS_OPTIONS.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={form.date_from > form.date_to}
                            className="w-full rounded-xl bg-[#5746d9] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            Применить / обновить
                        </button>
                    </div>
                </form>

                <p className="mt-4 text-xs text-gray-500">
                    Excel использует применённые фильтры.
                    Даты рассчитываются по времени Казахстана.
                </p>
            </Panel>

            {[optionsError, reportError, exportError]
                .filter(Boolean)
                .map((message, index) => (
                    <p
                        key={index}
                        role="alert"
                        className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                    >
                        {message}
                    </p>
                ))}

            {!report && !reportError && (
                <p aria-live="polite" className="p-5 text-gray-500">
                    Рассчитываем показатели…
                </p>
            )}

            {report && (
                <>
                    <div className="text-sm text-gray-500">
                        <strong className="text-[#30295c]">
                            {report.business.name}
                        </strong>
                        {' · '}
                        {report.period.date_from} — {report.period.date_to}
                        {' · Сравнение: '}
                        {report.previous_period.date_from}
                        {' — '}
                        {report.previous_period.date_to}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        {KPI_ITEMS.map(item => {
                            const value = report.summary[item.key];
                            const rawChange = report.changes[item.key];

                            const change = rawChange === null
                                ? null
                                : Number(rawChange);

                            const positive = change !== null && (
                                item.lowerIsBetter
                                    ? change < 0
                                    : change > 0
                            );

                            const changeClass = (
                                change === null || change === 0
                                    ? 'text-gray-400'
                                    : positive
                                        ? 'text-emerald-600'
                                        : 'text-rose-600'
                            );

                            const formatted = item.format === 'money'
                                ? money(value)
                                : item.format === 'percent'
                                    ? `${number(value)}%`
                                    : number(value);

                            return (
                                <div
                                    key={item.key}
                                    className="rounded-2xl border border-[#e8e5f3] bg-white p-5"
                                >
                                    <p className="min-h-10 text-sm text-gray-500">
                                        {item.label}
                                    </p>

                                    <p className="mt-2 break-words text-2xl font-bold">
                                        {formatted}
                                    </p>

                                    <p className={`mt-2 text-xs ${changeClass}`}>
                                        {change === null
                                            ? 'Нет базы сравнения'
                                            : `${change > 0 ? '+' : ''}${number(change)}% к предыдущему периоду`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <Panel title="Динамика за период">
                        <div className="mb-5 flex flex-wrap gap-2">
                            {(Object.keys(METRIC_LABELS) as Metric[]).map(value => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setMetric(value)}
                                    className={
                                        metric === value
                                            ? 'rounded-lg bg-violet-100 px-3 py-2 text-sm text-violet-700'
                                            : 'rounded-lg px-3 py-2 text-sm text-gray-500'
                                    }
                                >
                                    {METRIC_LABELS[value]}
                                </button>
                            ))}
                        </div>

                        <div className="h-80 min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={daily}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eeeaf7" />

                                    <XAxis
                                        dataKey="label"
                                        minTickGap={30}
                                        tick={{ fontSize: 12 }}
                                    />

                                    <YAxis
                                        width={75}
                                        tick={{ fontSize: 12 }}
                                        allowDecimals={metric === 'revenue'}
                                    />

                                    <Tooltip
                                        labelFormatter={(_, payload) =>
                                            payload?.[0]?.payload?.date ?? ''
                                        }
                                    />

                                    <Line
                                        type="linear"
                                        dataKey={metric}
                                        name={METRIC_LABELS[metric]}
                                        stroke="#5746d9"
                                        strokeWidth={3}
                                        dot={daily.length <= 31}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <Panel title="Статусы записей">
                            {!visibleStatuses.length ? (
                                <p className="text-sm text-gray-500">
                                    За выбранный период записей нет.
                                </p>
                            ) : (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={visibleStatuses}
                                                dataKey="count"
                                                nameKey="label"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={3}
                                            >
                                                {visibleStatuses.map(item => (
                                                    <Cell
                                                        key={item.status}
                                                        fill={
                                                            COLORS[
                                                                STATUS_OPTIONS.findIndex(
                                                                    option => option[0] === item.status
                                                                )
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Panel>

                        <Panel title="Новые и возвращающиеся посетители">
                            {!report.summary.visitors ? (
                                <p className="text-sm text-gray-500">
                                    Завершённых визитов за период нет.
                                </p>
                            ) : (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={visitors}>
                                            <CartesianGrid strokeDasharray="3 3" />

                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />

                                            <Bar
                                                dataKey="count"
                                                name="Посетители"
                                                fill="#8272ea"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            <p className="mt-4 text-sm text-gray-500">
                                Посетителей с двумя и более завершёнными
                                визитами за период:{' '}
                                <strong className="text-[#30295c]">
                                    {report.summary.multiple_visit_clients}
                                </strong>
                            </p>
                        </Panel>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        {[
                            {
                                title: 'Топ услуг по стоимости завершённых',
                                rows: servicesChart,
                            },
                            {
                                title: 'Мастера: стоимость завершённых',
                                rows: staffChart,
                            },
                        ].map(block => (
                            <Panel key={block.title} title={block.title}>
                                {!block.rows.length ? (
                                    <p className="text-sm text-gray-500">
                                        Нет данных.
                                    </p>
                                ) : (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={block.rows}
                                                layout="vertical"
                                                margin={{ left: 10, right: 15 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />

                                                <XAxis
                                                    type="number"
                                                    tick={{ fontSize: 11 }}
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={125}
                                                    tick={{ fontSize: 11 }}
                                                />

                                                <Tooltip />

                                                <Bar
                                                    dataKey="revenue"
                                                    name="Стоимость завершённых, ₸"
                                                    fill="#8272ea"
                                                    radius={[0, 6, 6, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </Panel>
                        ))}
                    </div>

                    <Panel title="Спрос по дням недели и часам">
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-1 text-center text-xs">
                                <thead>
                                    <tr>
                                        <th className="px-2 text-left">День</th>

                                        {Array.from({ length: 24 }, (_, hour) => (
                                            <th key={hour} className="min-w-8 font-normal text-gray-500">
                                                {hour}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {demand.map((hours, weekday) => (
                                        <tr key={weekday}>
                                            <th className="px-2 text-left">
                                                {WEEKDAYS[weekday]}
                                            </th>

                                            {hours.map((count, hour) => (
                                                <td
                                                    key={hour}
                                                    title={
                                                        `${WEEKDAYS[weekday]} ${hour}:00 — ` +
                                                        `${count} записей`
                                                    }
                                                    style={{
                                                        backgroundColor: count
                                                            ? `rgba(87, 70, 217, ${0.15 + 0.75 * count / maxDemand})`
                                                            : '#f5f3fa',
                                                        color: count / maxDemand > 0.55
                                                            ? '#fff'
                                                            : '#5746d9',
                                                    }}
                                                    className="h-9 rounded-md"
                                                >
                                                    {count || '·'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="mt-4 text-xs text-gray-500">
                            Количество записей по часу начала.
                            Процент загрузки рабочего времени здесь не рассчитывается.
                        </p>
                    </Panel>

                    <GroupTable
                        title="Все услуги"
                        rows={report.services}
                    />

                    <GroupTable
                        title="Все мастера"
                        rows={report.staff}
                    />

                </>
            )}
        </div>
    );
}
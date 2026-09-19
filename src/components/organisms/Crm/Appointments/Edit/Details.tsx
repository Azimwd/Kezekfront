import {
    Banknote,
    CalendarDays,
    Clock5,
    Plus,
    Scissors
} from 'lucide-react';

import {
    formatDuration,
    type Duration
} from 'date-fns';

import { ru } from 'date-fns/locale';

import Typography from '../../../../atoms/Typography';
import Icon from '../../../../atoms/Icon';

export interface AppointmentAddon {
    id: number;
    addon: number | null;
    name: string;
    price: string;
    duration_minutes: number;
}

interface DetailsProps {
    service_name: string;
    duration: Duration;
    description: string | null;
    price: string;
    format_date: string;
    format_time_from: string;
    format_time_to: string;
    addons?: AppointmentAddon[];
}

export default function Details({
    service_name,
    description,
    duration,
    price,
    format_date,
    format_time_from,
    format_time_to,
    addons = []
}: DetailsProps) {
    const formattedDuration = formatDuration(
        duration,
        {
            locale: ru
        }
    );

    const addonsTotal = addons.reduce(
        (sum, addon) => {
            return (
                sum +
                Number(addon.price || 0)
            );
        },
        0
    );

    const addonsDuration = addons.reduce(
        (sum, addon) => {
            return (
                sum +
                Number(
                    addon.duration_minutes || 0
                )
            );
        },
        0
    );

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-[#EAECF0] bg-white">
            <div className="border-b border-[#EAECF0] px-6 py-5">
                <Typography
                    text="Детали записи"
                    className="text-xl font-semibold text-[#111827]"
                />

                <Typography
                    text="Услуга, дополнительный сервис, дата и стоимость"
                    className="mt-1 text-sm text-slate-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* LEFT */}
                <div className="p-6 lg:border-r lg:border-[#EAECF0]">
                    <Typography
                        text="Услуги"
                        className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500"
                    />

                    {/* MAIN SERVICE */}
                    <div className="mt-4 flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
                            <Icon
                                icon={Scissors}
                                size={21}
                                className="text-[#4F46E5]"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <Typography
                                text={service_name}
                                className="text-lg font-semibold text-[#111827]"
                            />

                            {description && (
                                <Typography
                                    text={description}
                                    className="mt-1 text-sm leading-5 text-slate-500"
                                />
                            )}

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Icon
                                        icon={Clock5}
                                        size={15}
                                        className="text-slate-400"
                                    />

                                    <Typography
                                        text={
                                            formattedDuration ||
                                            'Не указано'
                                        }
                                        className="text-sm text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ADDONS */}
                    {addons.length > 0 && (
                        <div className="mt-6 border-t border-[#EAECF0] pt-5">
                            <div className="mb-3 flex items-center justify-between">
                                <Typography
                                    text="Дополнительные услуги"
                                    className="text-sm font-semibold text-[#111827]"
                                />

                                <div className="rounded-full bg-[#EEF2FF] px-2.5 py-1">
                                    <Typography
                                        text={String(addons.length)}
                                        className="text-xs font-semibold text-[#4F46E5]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {addons.map(
                                    addon => (
                                        <div
                                            key={addon.id}
                                            className="flex items-center justify-between gap-4 rounded-xl bg-[#F8FAFC] px-4 py-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                                                    <Icon
                                                        icon={Plus}
                                                        size={15}
                                                        className="text-[#4F46E5]"
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <Typography
                                                        text={addon.name}
                                                        className="truncate text-sm font-medium text-[#111827]"
                                                    />

                                                    {addon.duration_minutes > 0 && (
                                                        <Typography
                                                            text={`+ ${addon.duration_minutes} мин`}
                                                            className="mt-0.5 text-xs text-slate-500"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <Typography
                                                text={`+ ${addon.price} ₸`}
                                                className="shrink-0 text-sm font-semibold text-[#111827]"
                                            />
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-between px-1">
                                <Typography
                                    text={
                                        addonsDuration > 0
                                            ? `Доп. время: ${addonsDuration} мин`
                                            : ''
                                    }
                                    className="text-xs text-slate-500"
                                />

                                <Typography
                                    text={`Доп. услуги: ${addonsTotal.toLocaleString('ru-RU')} ₸`}
                                    className="text-xs text-slate-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="border-t border-[#EAECF0] bg-[#FAFAFB] p-6 lg:border-t-0">
                    <Typography
                        text="Дата и время"
                        className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500"
                    />

                    <div className="mt-5 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                            <Icon
                                icon={CalendarDays}
                                size={19}
                                className="text-[#4F46E5]"
                            />
                        </div>

                        <div>
                            <Typography
                                text="Дата"
                                className="text-xs text-slate-500"
                            />

                            <Typography
                                text={format_date}
                                className="mt-0.5 text-base font-semibold text-[#111827]"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                            <Icon
                                icon={Clock5}
                                size={19}
                                className="text-[#4F46E5]"
                            />
                        </div>

                        <div>
                            <Typography
                                text="Время"
                                className="text-xs text-slate-500"
                            />

                            <Typography
                                text={`${format_time_from} — ${format_time_to}`}
                                className="mt-0.5 text-base font-semibold text-[#4F46E5]"
                            />
                        </div>
                    </div>

                    <div className="my-6 border-t border-[#EAECF0]" />

                    <Typography
                        text="Итого"
                        className="text-xs text-slate-500"
                    />

                    <div className="mt-1 flex items-center gap-2">
                        <Icon
                            icon={Banknote}
                            size={22}
                            className="text-[#4F46E5]"
                        />

                        <Typography
                            text={`${price} ₸`}
                            className="text-2xl font-bold text-[#111827]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
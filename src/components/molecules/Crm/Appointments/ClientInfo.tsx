import {
    Phone,
    User,
    WalletCards,
    CalendarCheck
} from 'lucide-react';

import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';

interface ClientInfoProps {
    name: string;
    last_name: string;
    phone_num: string;
    client_ltv: string;
    client_total_visit: number;
}

export default function ClientInfo({
    name,
    last_name,
    phone_num,
    client_ltv,
    client_total_visit
}: ClientInfoProps) {
    const fullName = `${name || ''} ${last_name || ''}`.trim();

    return (
        <div className="h-full w-full rounded-2xl border border-[#EAECF0] bg-white p-6">
            <Typography
                text="Клиент"
                className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500"
            />

            <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF]">
                    <Icon
                        icon={User}
                        size={24}
                        className="text-[#4F46E5]"
                    />
                </div>

                <div className="min-w-0">
                    <Typography
                        text={fullName || 'Имя не указано'}
                        className="truncate text-lg font-semibold text-[#111827]"
                    />

                    <Typography
                        text="Клиент"
                        className="mt-0.5 text-sm text-slate-500"
                    />
                </div>
            </div>

            <div className="mt-6 grid gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3">
                    <Icon
                        icon={Phone}
                        size={18}
                        className="shrink-0 text-slate-500"
                    />

                    <div className="min-w-0">
                        <Typography
                            text="Телефон"
                            className="text-xs text-slate-500"
                        />
                        <Typography
                            text={phone_num || 'Не указан'}
                            className="mt-0.5 truncate text-sm font-medium text-[#111827]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3">
                        <Icon
                            icon={CalendarCheck}
                            size={18}
                            className="shrink-0 text-[#4F46E5]"
                        />

                        <div>
                            <Typography
                                text="Визитов"
                                className="text-xs text-slate-500"
                            />

                            <Typography
                                text={String(client_total_visit)}
                                className="mt-0.5 text-sm font-semibold text-[#111827]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3">
                        <Icon
                            icon={WalletCards}
                            size={18}
                            className="shrink-0 text-[#4F46E5]"
                        />

                        <div>
                            <Typography
                                text="LTV"
                                className="text-xs text-slate-500"
                            />

                            <Typography
                                text={`${client_ltv} ₸`}
                                className="mt-0.5 text-sm font-semibold text-[#111827]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
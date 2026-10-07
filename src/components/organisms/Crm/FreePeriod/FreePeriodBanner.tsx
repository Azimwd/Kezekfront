import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock3, Gift } from 'lucide-react';
import { useUser } from '../../../../context/UserContext';
import { getFreeAccessStatus } from '../../../../api/freePeriod';
import { freeAccessCountdown, freeAccessDeadline } from '../../../../utils/freeAccessCountdown';

export default function FreePeriodBanner() {
    const { user } = useUser();
    const isOwner = user?.role === 'business_owner';
    const { data, isError } = useQuery({
        queryKey: ['free-access', user?.id],
        queryFn: getFreeAccessStatus,
        enabled: isOwner,
        refetchInterval: 60_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: 'always',
        refetchOnReconnect: 'always',
        staleTime: 0,
        retry: false,
    });
    const [clientNow, setClientNow] = useState(() => Date.now());
    useEffect(() => {
        if (!isOwner || !data?.notice_enabled || !data.free_until) return;
        const tick = () => setClientNow(Date.now());
        tick();
        const interval = window.setInterval(tick, 1000);
        document.addEventListener('visibilitychange', tick);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', tick);
        };
    }, [isOwner, data?.notice_enabled, data?.free_until]);

    if (!isOwner) return null;
    if (isError) return (
        <div className="mx-auto mb-5 w-full max-w-[1280px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Не удалось обновить информацию о бесплатном периоде. Она обновится при восстановлении соединения.
        </div>
    );
    if (!data?.notice_enabled || !data.free_until) return null;

    const end = Date.parse(data.free_until);
    const serverNow = Date.parse(data.server_now) + Math.max(0, clientNow - data.receivedAt);
    const countdown = freeAccessCountdown(end, serverNow, data.timezone);
    if (!countdown) return null;
    const deadline = freeAccessDeadline(end, data.timezone);
    const ended = countdown.ended;
    const BannerIcon = ended ? Clock3 : Gift;

    return (
        <aside aria-label="Бесплатный период для владельцев бизнеса"
            className={`mx-auto mb-5 flex w-full max-w-[1280px] min-w-0 flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:p-5 ${ended ? 'border-amber-200 bg-amber-50' : 'border-[#ded8ff] bg-[#f0edff]'}`}>
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ended ? 'bg-amber-100 text-amber-700' : 'bg-white text-[#6554ed]'}`}>
                    <BannerIcon size={21} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className={`text-sm font-semibold sm:text-base ${ended ? 'text-amber-900' : 'text-[#39306a]'}`}>
                        {ended ? 'Бесплатный период завершён' : 'Бесплатный доступ к CRM'}
                    </p>
                    <p className={`mt-1 whitespace-pre-line break-words text-xs leading-5 sm:text-sm ${ended ? 'text-amber-800' : 'text-[#6b628c]'}`}>
                        {ended ? data.expired_notice : data.active_notice}
                    </p>
                    <p className="mt-2 text-xs text-[#7a728e]">
                        {ended ? 'Дата окончания: ' : 'Бесплатно до: '}
                        <time dateTime={data.free_until}>{deadline}</time>
                    </p>
                </div>
            </div>
            <div className={`self-start rounded-xl border bg-white/80 px-4 py-2.5 text-sm font-semibold tabular-nums sm:shrink-0 sm:self-center ${ended ? 'border-amber-200 text-amber-800' : 'border-[#ded8ff] text-[#6554ed]'}`}>
                {ended ? 'Период завершён' : countdown.text}
            </div>
        </aside>
    );
}

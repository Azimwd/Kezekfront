import {
    BadgeCheck,
    User
} from 'lucide-react';

import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';

interface AppointmentStaffProps {
    firstName: string | null;
    lastName: string | null;
    position: string | null;
}

export default function AppointmentStaff({
    firstName,
    lastName,
    position
}: AppointmentStaffProps) {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();

    return (
        <div className="h-full w-full rounded-2xl border border-[#EAECF0] bg-white p-6">
            <Typography
                text="Мастер"
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
                        text={fullName || 'Мастер не назначен'}
                        className="truncate text-lg font-semibold text-[#111827]"
                    />

                    <Typography
                        text={position || 'Должность не указана'}
                        className="mt-0.5 text-sm text-slate-500"
                    />
                </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3">
                <Icon
                    icon={BadgeCheck}
                    size={18}
                    className="text-[#4F46E5]"
                />

                <div>
                    <Typography
                        text="Исполнитель записи"
                        className="text-xs text-slate-500"
                    />

                    <Typography
                        text={fullName || 'Не назначен'}
                        className="mt-0.5 text-sm font-medium text-[#111827]"
                    />
                </div>
            </div>
        </div>
    );
}
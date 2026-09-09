import { CheckCircle2, Check } from 'lucide-react';
import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';
import type { BookingSettings } from '../../../../pages/CRM/Settings';

interface ConfirmationOfRecordsProps {
    settings: BookingSettings;
    updateField: <K extends keyof BookingSettings>(
        field: K,
        value: BookingSettings[K]
    ) => void;
}

export default function ConfirmationOfRecords({
    settings,
    updateField
}: ConfirmationOfRecordsProps) {
    return (
        <div className="flex w-full items-start">
            <div className="w-full px-4 py-6 sm:px-6 sm:py-9 bg-[#fff] rounded-3xl border border-[#c7c4d8]">
                <div className="flex justify-start items-center gap-3 sm:gap-4">
                    <div className="bg-[#eff4ff] p-2.5 rounded-full flex items-center justify-center shrink-0">
                        <Icon
                            icon={CheckCircle2}
                            className="text-[#4031d0] w-5 h-5 sm:w-6 sm:h-6"
                        />
                    </div>
                    <Typography
                        text={'Подтверждение записей'}
                        className="text-xl sm:text-2xl font-medium text-slate-900"
                    />
                </div>

                <div className="mt-6 flex items-start justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col gap-1 max-w-xl">
                        <Typography
                            text={'Автоматически подтверждать записи'}
                            className="text-sm sm:text-base font-semibold text-slate-800"
                        />
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Если включено, записи клиентов подтверждаются
                            автоматически. Если выключено, новые записи требуют
                            ручного подтверждения администратором.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            updateField(
                                'auto_confirm_bookings',
                                !settings.auto_confirm_bookings
                            )
                        }
                        className={`w-14 h-8 rounded-full relative flex items-center px-1 transition-colors duration-200 ease-in-out focus:outline-none shrink-0 ${
                            settings.auto_confirm_bookings
                                ? 'bg-[#4031d0]'
                                : 'bg-slate-300'
                        }`}
                    >
                        <div
                            className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                                settings.auto_confirm_bookings
                                    ? 'translate-x-6'
                                    : 'translate-x-0'
                            }`}
                        >
                            {settings.auto_confirm_bookings && (
                                <Icon
                                    icon={Check}
                                    className="w-3.5 h-3.5 text-[#4031d0]"
                                />
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

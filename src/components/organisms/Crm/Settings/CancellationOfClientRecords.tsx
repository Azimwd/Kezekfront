import { XCircle, Check } from 'lucide-react';
import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';
import type { BookingSettings } from '../../../../pages/CRM/Settings';

interface CancellationProps {
    settings: BookingSettings;
    updateField: <K extends keyof BookingSettings>(
        field: K,
        value: BookingSettings[K]
    ) => void;
}

export default function CancellationOfClientRecords({
    settings,
    updateField
}: CancellationProps) {
    return (
        <div className="flex w-full items-start">
            <div className="w-full px-4 py-6 sm:px-6 sm:py-9 bg-[#fff] rounded-3xl border border-[#c7c4d8]">
                <div className="flex justify-start items-center gap-3 sm:gap-4">
                    <div className="bg-[#eff4ff] p-2.5 rounded-full flex items-center justify-center shrink-0">
                        <Icon
                            icon={XCircle}
                            className="text-[#4031d0] w-5 h-5 sm:w-6 sm:h-6"
                        />
                    </div>
                    <Typography
                        text={'Отмена записи клиентом'}
                        className="text-xl sm:text-2xl font-medium text-slate-900"
                    />
                </div>

                <div className="mt-6 flex items-start justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col gap-1 max-w-xl">
                        <Typography
                            text={'Разрешить клиенту отмену'}
                            className="text-sm sm:text-base font-semibold text-slate-800"
                        />
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Если включено, клиент сможет самостоятельно отменить
                            свою запись через портал.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            updateField(
                                'allow_client_cancel',
                                !settings.allow_client_cancel
                            )
                        }
                        className={`w-14 h-8 rounded-full relative flex items-center px-1 transition-colors duration-200 ease-in-out focus:outline-none shrink-0 ${
                            settings.allow_client_cancel
                                ? 'bg-[#4031d0]'
                                : 'bg-slate-300'
                        }`}
                    >
                        <div
                            className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                                settings.allow_client_cancel
                                    ? 'translate-x-6'
                                    : 'translate-x-0'
                            }`}
                        >
                            {settings.allow_client_cancel && (
                                <Icon
                                    icon={Check}
                                    className="w-3.5 h-3.5 text-[#4031d0]"
                                />
                            )}
                        </div>
                    </button>
                </div>

                <hr className="my-6 border-[#e2e4f0]" />

                <div
                    className={`flex flex-col justify-center items-start gap-3 transition-opacity duration-200 ${
                        !settings.allow_client_cancel
                            ? 'opacity-40 pointer-events-none'
                            : 'opacity-100'
                    }`}
                >
                    <Typography
                        text={'За сколько часов можно отменить'}
                        className="text-sm font-semibold text-slate-800"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full">
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <input
                                type="number"
                                min="0"
                                value={settings.cancel_before_hours}
                                onChange={(e) =>
                                    updateField(
                                        'cancel_before_hours',
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full sm:w-48 h-11 px-4 bg-[#fcfcfd] border border-[#e2e2ea] rounded-xl text-base font-medium text-slate-800 outline-none focus:border-[#4031d0] focus:ring-1 focus:ring-[#4031d0] transition-all"
                            />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
                            Клиент сможет отменить запись не позднее указанного
                            времени до начала услуги.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

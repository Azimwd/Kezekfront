import { useState, useEffect } from 'react';
import RecordingRules from '../../components/organisms/Crm/Settings/RecordingRules';
import Icon from '../../components/atoms/Icon';
import { Calendar, Lightbulb, UserCheck } from 'lucide-react';
import Typography from '../../components/atoms/Typography';
import ConfirmationOfRecords from '../../components/organisms/Crm/Settings/ConfirmationOfRecords';
import CancellationOfClientRecords from '../../components/organisms/Crm/Settings/CancellationOfClientRecords';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, patchSettings } from '../../api/settings';
import { useBusiness } from '../../context/BusinessContext';

export interface BookingSettings {
    slot_step_minutes: number;
    min_booking_notice_hours: number;
    max_booking_days_ahead: number;
    auto_confirm_bookings: boolean;
    allow_client_cancel: boolean;
    cancel_before_hours: number;
}

export default function Settings() {
    const queryClient = useQueryClient();
    const { selectedBusiness } = useBusiness();
    const businessId = selectedBusiness?.id;

    const [settingsForm, setSettingsForm] = useState<BookingSettings | null>(
        null
    );

    const { data, isPending } = useQuery({
        queryKey: ['settings', businessId],
        queryFn: () => getSettings(Number(businessId)),
        enabled: !!businessId
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings: BookingSettings) =>
            patchSettings(
                Number(businessId),
                newSettings.slot_step_minutes,
                newSettings.min_booking_notice_hours,
                newSettings.max_booking_days_ahead,
                newSettings.auto_confirm_bookings,
                newSettings.allow_client_cancel,
                newSettings.cancel_before_hours
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['settings', businessId]
            });
        }
    });

    useEffect(() => {
        if (data?.data) {
            setSettingsForm(data.data);
        }
    }, [data]);

    const updateField = <K extends keyof BookingSettings>(
        field: K,
        value: BookingSettings[K]
    ) => {
        setSettingsForm((prev) => {
            if (!prev) return prev;

            const updatedSettings = { ...prev, [field]: value };

            updateSettingsMutation.mutate(updatedSettings);

            return updatedSettings;
        });
    };

    if (!businessId) {
        return (
            <div className="flex items-center justify-center w-full p-10 text-slate-500">
                Пожалуйста, выберите бизнес для настройки
            </div>
        );
    }

    if (isPending || !settingsForm) {
        return (
            <div className="flex items-center justify-center w-full p-10 text-slate-500 animate-pulse">
                Загрузка настроек...
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full relative pb-20 lg:pb-0">
            <div className="flex flex-col w-full lg:w-[60%] gap-6 lg:gap-10 relative">
                {updateSettingsMutation.isPending && (
                    <div className="absolute -top-6 right-0 text-xs text-[#4031d0] animate-pulse font-medium">
                        Сохранение изменений...
                    </div>
                )}

                <RecordingRules
                    settings={settingsForm}
                    updateField={updateField}
                />
                <ConfirmationOfRecords
                    settings={settingsForm}
                    updateField={updateField}
                />
                <CancellationOfClientRecords
                    settings={settingsForm}
                    updateField={updateField}
                />
            </div>

            <div className="w-full lg:w-[40%] flex flex-col gap-6 lg:gap-10 justify-start">
                <div className="p-5 sm:p-6 bg-[#ffffff] rounded-3xl border border-[#c7c4d8]">
                    <div className="flex items-center gap-3 mb-4">
                        <Icon
                            icon={Lightbulb}
                            className="text-[#4031d0] w-6 h-6 shrink-0"
                        />
                        <Typography
                            text={'Как это работает'}
                            className="text-lg font-semibold text-[#1a1a1a]"
                        />
                    </div>
                    <ul className="list-disc pl-5 space-y-3 text-sm text-[#4a4a5a] marker:text-[#4031d0]">
                        <li>
                            Шаг слотов влияет на визуальное отображение
                            расписания для клиента. Меньший шаг дает больше
                            вариантов времени.
                        </li>
                        <li>
                            Минимальное время защищает вас от неожиданных
                            записей &quot;день в день&quot;.
                        </li>
                        <li>
                            Лимит отмены позволяет избежать простоя, если клиент
                            передумал в последний момент.
                        </li>
                    </ul>
                </div>

                <div className="p-5 sm:p-6 bg-[#4031d0] text-white rounded-3xl shadow-sm transition-all">
                    <Typography
                        text={'Итоговый результат:'}
                        className="text-lg font-semibold mb-4 block"
                    />
                    <div className="flex flex-col gap-4 text-sm font-medium">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-full flex items-center justify-center shrink-0">
                                <Icon
                                    icon={Calendar}
                                    className="w-5 h-5 text-white"
                                />
                            </div>
                            <span>
                                Клиент видит слоты каждые{' '}
                                {settingsForm.slot_step_minutes} минут.
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-full flex items-center justify-center shrink-0">
                                <Icon
                                    icon={UserCheck}
                                    className="w-5 h-5 text-white"
                                />
                            </div>
                            <span>
                                Записи подтверждаются{' '}
                                {settingsForm.auto_confirm_bookings
                                    ? 'автоматически'
                                    : 'вручную'}
                                .
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

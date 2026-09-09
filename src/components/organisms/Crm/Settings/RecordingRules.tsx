import { Clock4 } from 'lucide-react';
import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';
import RowItem from '../../../molecules/Crm/Settings/RecordingRules/RowItem';
import type { SelectOption } from '../../../atoms/Select';
import type { BookingSettings } from '../../../../pages/CRM/Settings';

interface RecordingRulesProps {
    settings: BookingSettings;
    updateField: <K extends keyof BookingSettings>(
        field: K,
        value: BookingSettings[K]
    ) => void;
}

const SLOT_STEPS: SelectOption[] = [
    { id: 15, label: '15 минут' },
    { id: 30, label: '30 минут' },
    { id: 45, label: '45 минут' },
    { id: 60, label: '1 час' }
];

const MIN_NOTICE_HOURS: SelectOption[] = [
    { id: 1, label: '1 час' },
    { id: 2, label: '2 часа' },
    { id: 3, label: '3 часа' },
    { id: 4, label: '4 часа' },
    { id: 5, label: '5 часов' }
];

const MAX_DAYS_AHEAD: SelectOption[] = [
    { id: 2, label: '2 дня' },
    { id: 3, label: '3 дня' },
    { id: 4, label: '4 дня' },
    { id: 5, label: '5 дней' },
    { id: 6, label: '6 дней' },
    { id: 7, label: '7 дней' },
    { id: 8, label: '8 дней' },
    { id: 30, label: '30 дней' }
];

export default function RecordingRules({
    settings,
    updateField
}: RecordingRulesProps) {
    const selectedSlotStep =
        SLOT_STEPS.find((s) => s.id === settings.slot_step_minutes) ||
        SLOT_STEPS[0];
    const selectedNoticeHours =
        MIN_NOTICE_HOURS.find(
            (n) => n.id === settings.min_booking_notice_hours
        ) || MIN_NOTICE_HOURS[0];
    const selectedDaysAhead =
        MAX_DAYS_AHEAD.find((d) => d.id === settings.max_booking_days_ahead) ||
        MAX_DAYS_AHEAD[0];

    return (
        <div className="flex w-full items-start">
            <div className="w-full px-4 py-6 sm:px-6 sm:py-9 bg-[#fff] rounded-3xl border border-[#c7c4d8]">
                <div className="flex justify-start items-center gap-3 sm:gap-4">
                    <div className="bg-[#eff4ff] p-2.5 rounded-full flex items-center justify-center shrink-0">
                        <Icon
                            icon={Clock4}
                            className="text-[#4031d0] w-5 h-5 sm:w-6 sm:h-6"
                        />
                    </div>
                    <Typography
                        text={'Правила записи'}
                        className="text-xl sm:text-2xl font-medium"
                    />
                </div>

                <div className="mt-6 flex flex-col gap-6 w-full">
                    <RowItem
                        text={'Шаг слотов'}
                        selectOptions={SLOT_STEPS}
                        value={selectedSlotStep}
                        onChange={(val) =>
                            updateField('slot_step_minutes', Number(val.id))
                        }
                        description={
                            'Определяет, с каким интервалом клиент будет видеть свободное время.'
                        }
                    />

                    <RowItem
                        text={'Минимальное время до записи (в часах)'}
                        selectOptions={MIN_NOTICE_HOURS}
                        value={selectedNoticeHours}
                        onChange={(val) =>
                            updateField(
                                'min_booking_notice_hours',
                                Number(val.id)
                            )
                        }
                        description={
                            'Клиент не сможет записаться раньше указанного количества часов от текущего времени.'
                        }
                    />

                    <RowItem
                        text={'Запись на сколько дней вперёд'}
                        selectOptions={MAX_DAYS_AHEAD}
                        value={selectedDaysAhead}
                        onChange={(val) =>
                            updateField(
                                'max_booking_days_ahead',
                                Number(val.id)
                            )
                        }
                        description={
                            'Ограничивает, насколько далеко вперёд клиент может выбрать дату записи.'
                        }
                    />
                </div>
            </div>
        </div>
    );
}

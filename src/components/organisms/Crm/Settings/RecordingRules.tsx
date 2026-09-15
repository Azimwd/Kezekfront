import {
    Clock3
} from 'lucide-react';

import type {
    ReactNode
} from 'react';

import type {
    BookingSettings
} from '../../../../api/settings';


interface Props {
    settings: BookingSettings;

    updateField: <
        K extends keyof BookingSettings
    >(
        field: K,
        value: BookingSettings[K]
    ) => void;
}


export default function RecordingRules({
    settings,
    updateField
}: Props) {
    return (
        <section
            className="
                w-full
                min-w-0
                rounded-2xl
                border
                border-[#cbc9df]
                bg-white
                p-4

                sm:p-5
                md:p-6
            "
        >
            {/* HEADER */}

            <div
                className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                "
            >
                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#f1efff]

                        sm:h-10
                        sm:w-10
                    "
                >
                    <Clock3
                        className="
                            h-4
                            w-4
                            text-[#4031d0]

                            sm:h-5
                            sm:w-5
                        "
                    />
                </div>

                <h2
                    className="
                        min-w-0
                        text-lg
                        font-semibold
                        leading-6
                        text-slate-900

                        sm:text-xl
                    "
                >
                    Правила записи
                </h2>
            </div>


            {/* SETTINGS */}

            <div
                className="
                    mt-5
                    flex
                    flex-col
                    gap-6

                    sm:mt-7
                    sm:gap-7
                "
            >
                <SettingRow
                    title="Шаг слотов"
                    description="Определяет, с каким интервалом клиент будет видеть свободное время."
                >
                    <select
                        value={
                            settings.slot_step_minutes
                        }
                        onChange={(e) =>
                            updateField(
                                'slot_step_minutes',
                                Number(e.target.value)
                            )
                        }
                        className={inputClass}
                    >
                        <option value={5}>
                            5 минут
                        </option>

                        <option value={10}>
                            10 минут
                        </option>

                        <option value={15}>
                            15 минут
                        </option>

                        <option value={20}>
                            20 минут
                        </option>

                        <option value={30}>
                            30 минут
                        </option>

                        <option value={60}>
                            60 минут
                        </option>
                    </select>
                </SettingRow>


                <SettingRow
                    title="Минимальное время до записи (в часах)"
                    description="Клиент не сможет записаться раньше указанного количества часов от текущего времени."
                >
                    <input
                        type="number"
                        min={0}
                        max={168}
                        value={
                            settings.min_booking_notice_hours
                        }
                        onChange={(e) =>
                            updateField(
                                'min_booking_notice_hours',
                                Math.max(
                                    0,
                                    Number(e.target.value)
                                )
                            )
                        }
                        className={inputClass}
                    />
                </SettingRow>


                <SettingRow
                    title="Запись на сколько дней вперёд"
                    description="Ограничивает, насколько далеко вперёд клиент может выбрать дату записи."
                >
                    <input
                        type="number"
                        min={1}
                        max={365}
                        value={
                            settings.max_booking_days_ahead
                        }
                        onChange={(e) =>
                            updateField(
                                'max_booking_days_ahead',
                                Math.max(
                                    1,
                                    Number(e.target.value)
                                )
                            )
                        }
                        className={inputClass}
                    />
                </SettingRow>
            </div>
        </section>
    );
}


const inputClass = `
    h-11
    w-full
    min-w-0
    rounded-xl
    border
    border-[#c7c5d9]
    bg-white
    px-3
    text-sm
    font-medium
    text-slate-800
    outline-none
    transition
    focus:border-[#4031d0]
    focus:ring-2
    focus:ring-[#4031d0]/10
`;


function SettingRow({
    title,
    description,
    children
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <div
            className="
                min-w-0
            "
        >
            <div
                className="
                    mb-2
                    text-[13px]
                    font-semibold
                    leading-5
                    text-slate-700

                    sm:text-sm
                "
            >
                {title}
            </div>


            <div
                className="
                    grid
                    min-w-0
                    grid-cols-1
                    gap-2.5

                    sm:grid-cols-[210px_minmax(0,1fr)]
                    sm:items-center
                    sm:gap-4
                "
            >
                <div
                    className="
                        min-w-0
                        w-full
                    "
                >
                    {children}
                </div>


                <p
                    className="
                        min-w-0
                        text-[12px]
                        leading-5
                        text-slate-500

                        sm:text-[13px]
                    "
                >
                    {description}
                </p>
            </div>
        </div>
    );
}
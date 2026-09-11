import {
    CircleX
} from 'lucide-react';

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


export default function CancellationOfClientRecords({
    settings,
    updateField
}: Props) {
    return (
        <section
            className="
                rounded-2xl
                border
                border-[#cbc9df]
                bg-white
                p-6
            "
        >

            <div className="flex items-center gap-3">

                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#f1efff]
                    "
                >
                    <CircleX
                        className="
                            h-5
                            w-5
                            text-[#4031d0]
                        "
                    />
                </div>


                <h2
                    className="
                        text-xl
                        font-semibold
                        text-slate-900
                    "
                >
                    Отмена записи клиентом
                </h2>

            </div>


            <div
                className="
                    mt-7
                    flex
                    items-center
                    justify-between
                    gap-6
                "
            >

                <div>

                    <div
                        className="
                            text-sm
                            font-semibold
                            text-slate-700
                        "
                    >
                        Разрешить клиенту отмену
                    </div>


                    <p
                        className="
                            mt-1.5
                            max-w-[530px]
                            text-[13px]
                            leading-relaxed
                            text-slate-500
                        "
                    >
                        Если включено, клиент сможет самостоятельно
                        отменить свою запись через портал.
                    </p>


                    <div
                        className="
                            mt-2
                            font-mono
                            text-[10px]
                            text-slate-400
                        "
                    >
                        allow_client_cancel
                    </div>

                </div>


                <Toggle
                    checked={
                        settings.allow_client_cancel
                    }
                    onChange={() =>
                        updateField(
                            'allow_client_cancel',
                            !settings.allow_client_cancel
                        )
                    }
                />

            </div>


            {settings.allow_client_cancel && (
                <div
                    className="
                        mt-5
                        border-t
                        border-slate-200
                        pt-5
                    "
                >

                    <div
                        className="
                            mb-2
                            text-sm
                            font-semibold
                            text-slate-700
                        "
                    >
                        За сколько часов можно отменить
                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-[210px_1fr]
                            sm:items-center
                        "
                    >

                        <div>

                            <input
                                type="number"
                                min={0}
                                max={168}
                                value={
                                    settings.cancel_before_hours
                                }
                                onChange={(e) =>
                                    updateField(
                                        'cancel_before_hours',
                                        Math.max(
                                            0,
                                            Number(e.target.value)
                                        )
                                    )
                                }
                                className="
                                    h-11
                                    w-full
                                    rounded-lg
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
                                "
                            />


                            <div
                                className="
                                    mt-1.5
                                    font-mono
                                    text-[10px]
                                    text-slate-400
                                "
                            >
                                cancel_before_hours
                            </div>

                        </div>


                        <p
                            className="
                                text-[13px]
                                leading-relaxed
                                text-slate-500
                            "
                        >
                            Клиент сможет отменить запись
                            не позднее указанного времени
                            до начала услуги.
                        </p>

                    </div>

                </div>
            )}

        </section>
    );
}


function Toggle({
    checked,
    onChange
}: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`
                relative
                h-7
                w-12
                shrink-0
                rounded-full
                transition-colors
                ${
                    checked
                        ? 'bg-[#4a38e8]'
                        : 'bg-slate-300'
                }
            `}
        >

            <span
                className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow
                    transition-transform
                    ${
                        checked
                            ? 'translate-x-6'
                            : 'translate-x-1'
                    }
                `}
            />

        </button>
    );
}
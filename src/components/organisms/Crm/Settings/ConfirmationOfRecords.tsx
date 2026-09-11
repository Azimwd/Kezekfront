import {
    CircleCheckBig
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


export default function ConfirmationOfRecords({
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
                    <CircleCheckBig
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
                    Подтверждение записей
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
                        Автоматически подтверждать записи
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
                        Если включено, записи клиентов подтверждаются
                        автоматически. Если выключено — новые записи
                        требуют ручного подтверждения администратором.
                    </p>


                    <div
                        className="
                            mt-2
                            font-mono
                            text-[10px]
                            text-slate-400
                        "
                    >
                        auto_confirm_bookings
                    </div>

                </div>


                <Toggle
                    checked={
                        settings.auto_confirm_bookings
                    }
                    onChange={() =>
                        updateField(
                            'auto_confirm_bookings',
                            !settings.auto_confirm_bookings
                        )
                    }
                />

            </div>

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
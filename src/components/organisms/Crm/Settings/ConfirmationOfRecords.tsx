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
                    <CircleCheckBig
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
                    Подтверждение записей
                </h2>
            </div>


            {/* CONTENT */}

            <div
                className="
                    mt-5
                    flex
                    min-w-0
                    flex-col
                    gap-4

                    sm:mt-7
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:gap-6
                "
            >
                <div
                    className="
                        min-w-0
                        flex-1
                    "
                >
                    <div
                        className="
                            text-[13px]
                            font-semibold
                            leading-5
                            text-slate-700

                            sm:text-sm
                        "
                    >
                        Автоматически подтверждать записи
                    </div>


                    <p
                        className="
                            mt-1.5
                            max-w-[530px]
                            text-[12px]
                            leading-5
                            text-slate-500

                            sm:text-[13px]
                        "
                    >
                        Если включено, записи клиентов подтверждаются
                        автоматически. Если выключено — новые записи
                        требуют ручного подтверждения администратором.
                    </p>
                </div>


                <div
                    className="
                        flex
                        w-full
                        justify-end

                        sm:w-auto
                    "
                >
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
                cursor-pointer
                rounded-full
                transition-colors
                duration-200

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
                    left-1
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-sm
                    transition-transform
                    duration-200

                    ${
                        checked
                            ? 'translate-x-5'
                            : 'translate-x-0'
                    }
                `}
            />
        </button>
    );
}
import {
    useMemo,
    useState,
    type ReactNode
} from 'react';

import {
    Calendar,
    CalendarX,
    Lightbulb,
    UserCheck
} from 'lucide-react';

import RecordingRules from '../../components/organisms/Crm/Settings/RecordingRules';
import ConfirmationOfRecords from '../../components/organisms/Crm/Settings/ConfirmationOfRecords';
import CancellationOfClientRecords from '../../components/organisms/Crm/Settings/CancellationOfClientRecords';

import type {
    BookingSettings
} from '../../api/settings';


const DEFAULT_SETTINGS: BookingSettings = {
    slot_step_minutes: 60,
    min_booking_notice_hours: 2,
    max_booking_days_ahead: 30,
    auto_confirm_bookings: true,
    allow_client_cancel: true,
    cancel_before_hours: 12
};


export default function Settings() {
    const [
        settings,
        setSettings
    ] = useState<BookingSettings>({
        ...DEFAULT_SETTINGS
    });

    const [
        savedSettings,
        setSavedSettings
    ] = useState<BookingSettings>({
        ...DEFAULT_SETTINGS
    });


    const updateField = <
        K extends keyof BookingSettings
    >(
        field: K,
        value: BookingSettings[K]
    ) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value
        }));
    };


    const hasChanges = useMemo(() => {
        return (
            JSON.stringify(settings) !==
            JSON.stringify(savedSettings)
        );
    }, [
        settings,
        savedSettings
    ]);


    const handleCancel = () => {
        setSettings({
            ...savedSettings
        });
    };


    const handleSave = () => {
        setSavedSettings({
            ...settings
        });

        console.log(
            'Сохраняем настройки:',
            settings
        );
    };


    return (
        <div
            className="
                flex
                min-h-[calc(100vh-110px)]
                flex-col
                bg-[#f7f8fc]
            "
        >
            
            <main
                className="
                    flex-1
                    px-7
                    py-7
                "
            >

                <div
                    className="
                        grid
                        w-full
                        max-w-[1160px]
                        grid-cols-1
                        items-start
                        gap-6
                        xl:grid-cols-[730px_340px]
                    "
                >

                    {/* LEFT */}

                    <div className="flex flex-col gap-5">

                        <RecordingRules
                            settings={settings}
                            updateField={updateField}
                        />


                        <ConfirmationOfRecords
                            settings={settings}
                            updateField={updateField}
                        />


                        <CancellationOfClientRecords
                            settings={settings}
                            updateField={updateField}
                        />

                    </div>


                    {/* RIGHT */}

                    <aside className="flex flex-col gap-4">

                        {/* INFO */}

                        <section
                            className="
                                rounded-2xl
                                border
                                border-[#d0cee3]
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
                                    <Lightbulb
                                        className="
                                            h-5
                                            w-5
                                            text-[#4031d0]
                                        "
                                    />
                                </div>


                                <h3
                                    className="
                                        text-base
                                        font-semibold
                                        text-slate-900
                                    "
                                >
                                    Как это работает
                                </h3>

                            </div>


                            <div className="mt-6 flex flex-col gap-5">

                                <InfoItem>
                                    <strong className="font-semibold text-slate-800">
                                        Шаг слотов
                                    </strong>{' '}
                                    определяет интервалы времени,
                                    которые будут доступны клиенту.
                                </InfoItem>


                                <InfoItem>
                                    <strong className="font-semibold text-slate-800">
                                        Минимальное время
                                    </strong>{' '}
                                    защищает от слишком поздней
                                    записи клиента перед визитом.
                                </InfoItem>


                                <InfoItem>
                                    <strong className="font-semibold text-slate-800">
                                        Лимит отмены
                                    </strong>{' '}
                                    помогает избежать простоев
                                    при поздней отмене.
                                </InfoItem>

                            </div>

                        </section>


                        {/* RESULT */}

                        <section
                            className="
                                rounded-2xl
                                bg-[#4031d0]
                                p-6
                                text-white
                                shadow-lg
                                shadow-[#4031d0]/15
                            "
                        >

                            <h3
                                className="
                                    text-base
                                    font-semibold
                                "
                            >
                                Итоговый результат:
                            </h3>


                            <div className="mt-6 flex flex-col gap-5">

                                <ResultItem
                                    icon={
                                        <Calendar className="h-5 w-5" />
                                    }
                                >
                                    Клиент видит слоты каждые{' '}

                                    <strong>
                                        {settings.slot_step_minutes} минут
                                    </strong>
                                    .
                                </ResultItem>


                                <ResultItem
                                    icon={
                                        <UserCheck className="h-5 w-5" />
                                    }
                                >
                                    Записи подтверждаются{' '}

                                    <strong>
                                        {settings.auto_confirm_bookings
                                            ? 'автоматически'
                                            : 'вручную'}
                                    </strong>
                                    .
                                </ResultItem>


                                <ResultItem
                                    icon={
                                        <CalendarX className="h-5 w-5" />
                                    }
                                >
                                    {settings.allow_client_cancel ? (
                                        <>
                                            Клиент может отменить
                                            запись за{' '}

                                            <strong>
                                                {settings.cancel_before_hours} ч.
                                            </strong>{' '}

                                            до визита.
                                        </>
                                    ) : (
                                        <>
                                            Клиент не может самостоятельно
                                            отменять запись.
                                        </>
                                    )}
                                </ResultItem>

                            </div>

                        </section>

                    </aside>

                </div>

            </main>


            {/* ================================= */}
            {/* BOTTOM ACTION BAR */}
            {/* НЕ STICKY, НЕ FIXED */}
            {/* ================================= */}

            <footer
                className="
                    mt-auto
                    w-full
                    border-t
                    border-[#d7d8e5]
                    bg-white
                    px-7
                    py-4
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-end
                        gap-3
                    "
                >

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={!hasChanges}
                        className="
                            h-11
                            min-w-[110px]
                            rounded-lg
                            border
                            border-[#c7c5d9]
                            bg-white
                            px-5
                            text-sm
                            font-medium
                            text-slate-700
                            transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        Отмена
                    </button>


                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="
                            h-11
                            min-w-[205px]
                            rounded-lg
                            bg-[#4a38e8]
                            px-6
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#3d2fc9]
                            disabled:cursor-not-allowed
                            disabled:bg-slate-400
                        "
                    >
                        Сохранить настройки
                    </button>

                </div>

            </footer>

        </div>
    );
}


function InfoItem({
    children
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex gap-3">

            <span
                className="
                    mt-[8px]
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    bg-[#4031d0]
                "
            />

            <p
                className="
                    text-[13px]
                    leading-relaxed
                    text-slate-600
                "
            >
                {children}
            </p>

        </div>
    );
}


function ResultItem({
    icon,
    children
}: {
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">

            <div
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/15
                "
            >
                {icon}
            </div>


            <div
                className="
                    pt-1.5
                    text-[13px]
                    leading-relaxed
                "
            >
                {children}
            </div>

        </div>
    );
}
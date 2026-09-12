import {
    useEffect,
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

import {
    getSettings,
    patchSettings,
    type BookingSettings
} from '../../api/settings';

import {
    useBusiness
} from '../../context/BusinessContext';


const EMPTY_SETTINGS: BookingSettings = {
    slot_step_minutes: 30,
    min_booking_notice_hours: 1,
    max_booking_days_ahead: 30,
    auto_confirm_bookings: true,
    allow_client_cancel: true,
    cancel_before_hours: 2
};


export default function Settings() {
    const {
        selectedBusiness
    } = useBusiness();


    const [
        settings,
        setSettings
    ] = useState<BookingSettings>(
        EMPTY_SETTINGS
    );


    const [
        savedSettings,
        setSavedSettings
    ] = useState<BookingSettings>(
        EMPTY_SETTINGS
    );


    const [
        isLoading,
        setIsLoading
    ] = useState(false);


    const [
        isSaving,
        setIsSaving
    ] = useState(false);


    const [
        error,
        setError
    ] = useState<string | null>(null);


    /*
     * ID выбранного бизнеса.
     *
     * SelectOption.id имеет тип string | number,
     * поэтому приводим его к number.
     */
    const businessId =
        selectedBusiness
            ? Number(selectedBusiness.id)
            : null;


    /*
     * Загружаем настройки при:
     *
     * 1. первом открытии страницы;
     * 2. смене выбранного бизнеса.
     */
    useEffect(() => {
        if (!businessId) {
            return;
        }


        const loadSettings = async () => {
            try {
                setIsLoading(true);
                setError(null);


                const response =
                    await getSettings(
                        businessId
                    );


                const loadedSettings: BookingSettings = {
                    slot_step_minutes:
                        response.data.slot_step_minutes,

                    min_booking_notice_hours:
                        response.data.min_booking_notice_hours,

                    max_booking_days_ahead:
                        response.data.max_booking_days_ahead,

                    auto_confirm_bookings:
                        response.data.auto_confirm_bookings,

                    allow_client_cancel:
                        response.data.allow_client_cancel,

                    cancel_before_hours:
                        response.data.cancel_before_hours
                };


                setSettings(
                    loadedSettings
                );


                setSavedSettings(
                    loadedSettings
                );
            } catch (error) {
                console.error(
                    'Ошибка загрузки настроек:',
                    error
                );

                setError(
                    'Не удалось загрузить настройки бизнеса.'
                );
            } finally {
                setIsLoading(false);
            }
        };


        loadSettings();

    }, [businessId]);


    /*
     * Универсальное изменение любого поля.
     */
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


    /*
     * Проверяем, менял ли пользователь форму.
     */
    const hasChanges =
        useMemo(() => {
            return (
                JSON.stringify(settings) !==
                JSON.stringify(savedSettings)
            );
        }, [
            settings,
            savedSettings
        ]);


    /*
     * Отмена изменений.
     *
     * Backend не вызываем.
     */
    const handleCancel = () => {
        setSettings({
            ...savedSettings
        });
    };


    /*
     * Сохранение через PATCH.
     */
    const handleSave = async () => {
        if (!businessId) {
            return;
        }


        try {
            setIsSaving(true);
            setError(null);


            const response =
                await patchSettings(
                    businessId,
                    settings
                );


            const updatedSettings: BookingSettings = {
                slot_step_minutes:
                    response.data.slot_step_minutes,

                min_booking_notice_hours:
                    response.data.min_booking_notice_hours,

                max_booking_days_ahead:
                    response.data.max_booking_days_ahead,

                auto_confirm_bookings:
                    response.data.auto_confirm_bookings,

                allow_client_cancel:
                    response.data.allow_client_cancel,

                cancel_before_hours:
                    response.data.cancel_before_hours
            };


            setSettings(
                updatedSettings
            );


            setSavedSettings(
                updatedSettings
            );

        } catch (error) {
            console.error(
                'Ошибка сохранения настроек:',
                error
            );

            setError(
                'Не удалось сохранить настройки.'
            );

        } finally {
            setIsSaving(false);
        }
    };


    /*
     * Бизнес ещё не выбран.
     */
    if (!businessId) {
        return (
            <div className="flex min-h-full items-center justify-center p-10">
                <p className="text-base text-slate-500">
                    Выберите бизнес, чтобы изменить настройки записи.
                </p>
            </div>
        );
    }


    /*
     * Загрузка.
     */
    if (isLoading) {
        return (
            <div className="flex min-h-full items-center justify-center p-10">
                <p className="text-base text-slate-500">
                    Загружаем настройки...
                </p>
            </div>
        );
    }


    return (
        <div
            className="
                flex
                min-h-full
                flex-col
                bg-[#f8f9ff]
            "
        >

            {/* CONTENT */}

            <main className="flex-1 px-10 py-8">

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

                        {/* HOW IT WORKS */}

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
                                    записи клиента.
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

                            <h3 className="text-base font-semibold">
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
                                        {
                                            settings.auto_confirm_bookings
                                                ? 'автоматически'
                                                : 'вручную'
                                        }
                                    </strong>
                                    .
                                </ResultItem>


                                <ResultItem
                                    icon={
                                        <CalendarX className="h-5 w-5" />
                                    }
                                >
                                    {
                                        settings.allow_client_cancel
                                            ? (
                                                <>
                                                    Клиент может отменить
                                                    запись за{' '}

                                                    <strong>
                                                        {
                                                            settings.cancel_before_hours
                                                        } ч.
                                                    </strong>{' '}

                                                    до визита.
                                                </>
                                            )
                                            : (
                                                <>
                                                    Клиент не может
                                                    самостоятельно
                                                    отменять запись.
                                                </>
                                            )
                                    }
                                </ResultItem>

                            </div>

                        </section>

                    </aside>

                </div>


                {/* ERROR */}

                {error && (
                    <div
                        className="
                            mt-5
                            max-w-[1160px]
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-600
                        "
                    >
                        {error}
                    </div>
                )}

            </main>


            {/* ACTION BAR */}

            <footer
                className="
                    mt-auto
                    w-full
                    border-t
                    border-[#c7c4d8]
                    bg-white
                    px-10
                    py-4
                "
            >

                <div className="flex items-center justify-end gap-3">

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={
                            !hasChanges ||
                            isSaving
                        }
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
                        disabled={
                            !hasChanges ||
                            isSaving
                        }
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
                        {
                            isSaving
                                ? 'Сохранение...'
                                : 'Сохранить настройки'
                        }
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


            <p className="text-[13px] leading-relaxed text-slate-600">
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


            <div className="pt-1.5 text-[13px] leading-relaxed">
                {children}
            </div>

        </div>
    );
}
import {
    useEffect,
    useMemo,
    useState,
    type ReactNode
} from 'react';

import {
    Banknote,
    Calendar,
    CalendarX,
    Lightbulb,
    UserCheck
} from 'lucide-react';

import RecordingRules
    from '../../components/organisms/Crm/Settings/RecordingRules';

import ConfirmationOfRecords
    from '../../components/organisms/Crm/Settings/ConfirmationOfRecords';

import CancellationOfClientRecords
    from '../../components/organisms/Crm/Settings/CancellationOfClientRecords';

import PrepaymentSettings
    from '../../components/organisms/Crm/Settings/PrepaymentSettings';

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
    cancel_before_hours: 2,
    prepayment_enabled: false,
    prepayment_percent: 30,
    kaspi_payment_url: ''
};


const normalizeSettings = (
    data: BookingSettings
): BookingSettings => {
    return {
        slot_step_minutes:
            data.slot_step_minutes,

        min_booking_notice_hours:
            data.min_booking_notice_hours,

        max_booking_days_ahead:
            data.max_booking_days_ahead,

        auto_confirm_bookings:
            data.auto_confirm_bookings,

        allow_client_cancel:
            data.allow_client_cancel,

        cancel_before_hours:
            data.cancel_before_hours,

        prepayment_enabled:
            data.prepayment_enabled ?? false,

        prepayment_percent:
            data.prepayment_percent ?? 30,

        kaspi_payment_url:
            data.kaspi_payment_url ?? ''
    };
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
    ] = useState<string | null>(
        null
    );


    const businessId =
        selectedBusiness
            ? Number(
                  selectedBusiness.id
              )
            : null;


    useEffect(() => {
        if (!businessId) {
            return;
        }


        const loadSettings =
            async () => {
                try {
                    setIsLoading(true);
                    setError(null);


                    const response =
                        await getSettings(
                            businessId
                        );


                    const loadedSettings =
                        normalizeSettings(
                            response.data
                        );


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

                    setIsLoading(
                        false
                    );
                }
            };


        loadSettings();

    }, [
        businessId
    ]);


    const updateField = <
        K extends keyof BookingSettings
    >(
        field: K,
        value: BookingSettings[K]
    ) => {

        setSettings(
            prev => ({
                ...prev,
                [field]: value
            })
        );
    };


    const hasChanges =
        useMemo(
            () =>
                JSON.stringify(
                    settings
                ) !==
                JSON.stringify(
                    savedSettings
                ),
            [
                settings,
                savedSettings
            ]
        );


    const handleCancel =
        () => {

            setSettings({
                ...savedSettings
            });


            setError(
                null
            );
        };


    const handleSave =
        async () => {

            if (!businessId) {
                return;
            }


            if (
                settings.prepayment_enabled
                &&
                (
                    settings.prepayment_percent < 1
                    ||
                    settings.prepayment_percent > 100
                )
            ) {

                setError(
                    'Процент предоплаты должен быть от 1 до 100.'
                );

                return;
            }


            if (
                settings.prepayment_enabled
                &&
                !settings.kaspi_payment_url.trim()
            ) {

                setError(
                    'Укажите ссылку Kaspi для предоплаты.'
                );

                return;
            }


            try {

                setIsSaving(
                    true
                );


                setError(
                    null
                );


                const response =
                    await patchSettings(
                        businessId,
                        settings
                    );


                const updatedSettings =
                    normalizeSettings(
                        response.data
                    );


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

                setIsSaving(
                    false
                );
            }
        };


    if (!businessId) {
        return (
            <div
                className="
                    flex
                    min-h-[300px]
                    items-center
                    justify-center
                    px-4
                    py-8
                    text-center
                "
            >
                <p
                    className="
                        text-sm
                        leading-6
                        text-slate-500
                        sm:text-base
                    "
                >
                    Выберите бизнес, чтобы изменить настройки записи.
                </p>
            </div>
        );
    }


    if (isLoading) {
        return (
            <div
                className="
                    flex
                    min-h-[300px]
                    items-center
                    justify-center
                    px-4
                    py-8
                    text-center
                "
            >
                <p
                    className="
                        animate-pulse
                        text-sm
                        text-slate-500
                        sm:text-base
                    "
                >
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
                w-full
                min-w-0
                flex-col
                bg-[#f8f9ff]
            "
        >
            <main
                className="
                    w-full
                    min-w-0
                    flex-1
                    px-4
                    py-5
                    sm:px-6
                    sm:py-6
                    md:px-8
                    md:py-8
                    lg:px-10
                "
            >
                <div
                    className="
                        mx-auto
                        grid
                        w-full
                        max-w-[1160px]
                        min-w-0
                        grid-cols-1
                        items-start
                        gap-5
                        sm:gap-6
                        xl:grid-cols-[minmax(0,730px)_minmax(0,340px)]
                    "
                >
                    <div
                        className="
                            flex
                            min-w-0
                            flex-col
                            gap-4
                            sm:gap-5
                        "
                    >
                        <RecordingRules
                            settings={
                                settings
                            }
                            updateField={
                                updateField
                            }
                        />

                        <ConfirmationOfRecords
                            settings={
                                settings
                            }
                            updateField={
                                updateField
                            }
                        />

                        <PrepaymentSettings
                            settings={
                                settings
                            }
                            updateField={
                                updateField
                            }
                        />

                        <CancellationOfClientRecords
                            settings={
                                settings
                            }
                            updateField={
                                updateField
                            }
                        />
                    </div>


                    <aside
                        className="
                            flex
                            min-w-0
                            flex-col
                            gap-4
                        "
                    >
                        <section
                            className="
                                min-w-0
                                rounded-2xl
                                border
                                border-[#d0cee3]
                                bg-white
                                p-4
                                sm:p-5
                                md:p-6
                            "
                        >
                            <div
                                className="
                                    flex
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
                                    <Lightbulb
                                        className="
                                            h-4
                                            w-4
                                            text-[#4031d0]
                                            sm:h-5
                                            sm:w-5
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


                            <div
                                className="
                                    mt-5
                                    flex
                                    flex-col
                                    gap-4
                                    sm:mt-6
                                    sm:gap-5
                                "
                            >
                                <InfoItem>
                                    <strong
                                        className="
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        Шаг слотов
                                    </strong>{' '}
                                    определяет интервалы времени,
                                    которые будут доступны клиенту.
                                </InfoItem>

                                <InfoItem>
                                    <strong
                                        className="
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        Минимальное время
                                    </strong>{' '}
                                    защищает от слишком поздней
                                    записи клиента.
                                </InfoItem>

                                <InfoItem>
                                    <strong
                                        className="
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        Предоплата
                                    </strong>{' '}
                                    позволяет подтверждать запись
                                    только после проверки оплаты.
                                </InfoItem>

                                <InfoItem>
                                    <strong
                                        className="
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        Лимит отмены
                                    </strong>{' '}
                                    помогает избежать простоев
                                    при поздней отмене.
                                </InfoItem>
                            </div>
                        </section>


                        <section
                            className="
                                min-w-0
                                rounded-2xl
                                bg-[#4031d0]
                                p-4
                                text-white
                                shadow-lg
                                shadow-[#4031d0]/15
                                sm:p-5
                                md:p-6
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


                            <div
                                className="
                                    mt-5
                                    flex
                                    flex-col
                                    gap-4
                                    sm:mt-6
                                    sm:gap-5
                                "
                            >
                                <ResultItem
                                    icon={
                                        <Calendar
                                            className="
                                                h-5
                                                w-5
                                            "
                                        />
                                    }
                                >
                                    Клиент видит слоты каждые{' '}

                                    <strong>
                                        {
                                            settings.slot_step_minutes
                                        } минут
                                    </strong>
                                    .
                                </ResultItem>


                                <ResultItem
                                    icon={
                                        <UserCheck
                                            className="
                                                h-5
                                                w-5
                                            "
                                        />
                                    }
                                >
                                    {
                                        settings.prepayment_enabled
                                            ? (
                                                <>
                                                    Запись подтверждается
                                                    после проверки{' '}
                                                    <strong>
                                                        предоплаты
                                                    </strong>
                                                    .
                                                </>
                                            )
                                            : (
                                                <>
                                                    Записи подтверждаются{' '}
                                                    <strong>
                                                        {
                                                            settings.auto_confirm_bookings
                                                                ? 'автоматически'
                                                                : 'вручную'
                                                        }
                                                    </strong>
                                                    .
                                                </>
                                            )
                                    }
                                </ResultItem>


                                <ResultItem
                                    icon={
                                        <Banknote
                                            className="
                                                h-5
                                                w-5
                                            "
                                        />
                                    }
                                >
                                    {
                                        settings.prepayment_enabled
                                            ? (
                                                <>
                                                    Требуется предоплата{' '}
                                                    <strong>
                                                        {
                                                            settings.prepayment_percent
                                                        }%
                                                    </strong>{' '}
                                                    от стоимости записи.
                                                </>
                                            )
                                            : (
                                                <>
                                                    Предоплата{' '}
                                                    <strong>
                                                        не требуется
                                                    </strong>
                                                    .
                                                </>
                                            )
                                    }
                                </ResultItem>


                                <ResultItem
                                    icon={
                                        <CalendarX
                                            className="
                                                h-5
                                                w-5
                                            "
                                        />
                                    }
                                >
                                    {
                                        settings.allow_client_cancel
                                            ? (
                                                <>
                                                    Клиент может отменить запись за{' '}

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
                                                    Клиент не может самостоятельно
                                                    отменять запись.
                                                </>
                                            )
                                    }
                                </ResultItem>
                            </div>
                        </section>
                    </aside>
                </div>


                {error && (
                    <div
                        className="
                            mx-auto
                            mt-5
                            w-full
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


            <footer
                className="
                    mt-auto
                    w-full
                    border-t
                    border-[#c7c4d8]
                    bg-white
                    px-4
                    py-4
                    sm:px-6
                    md:px-8
                    lg:px-10
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        w-full
                        max-w-[1160px]
                        flex-col-reverse
                        gap-3
                        sm:flex-row
                        sm:items-center
                        sm:justify-end
                    "
                >
                    <button
                        type="button"
                        onClick={
                            handleCancel
                        }
                        disabled={
                            !hasChanges ||
                            isSaving
                        }
                        className="
                            h-11
                            w-full
                            cursor-pointer
                            rounded-xl
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
                            sm:w-auto
                            sm:min-w-[110px]
                        "
                    >
                        Отмена
                    </button>


                    <button
                        type="button"
                        onClick={
                            handleSave
                        }
                        disabled={
                            !hasChanges ||
                            isSaving
                        }
                        className="
                            h-11
                            w-full
                            cursor-pointer
                            rounded-xl
                            bg-[#4a38e8]
                            px-6
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#3d2fc9]
                            disabled:cursor-not-allowed
                            disabled:bg-slate-400
                            sm:w-auto
                            sm:min-w-[205px]
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
        <div
            className="
                flex
                min-w-0
                gap-3
            "
        >
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
                    min-w-0
                    text-[12px]
                    leading-5
                    text-slate-600
                    sm:text-[13px]
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
        <div
            className="
                flex
                min-w-0
                items-start
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
                    bg-white/15
                "
            >
                {icon}
            </div>

            <div
                className="
                    min-w-0
                    pt-1.5
                    text-[12px]
                    leading-5
                    sm:text-[13px]
                "
            >
                {children}
            </div>
        </div>
    );
}
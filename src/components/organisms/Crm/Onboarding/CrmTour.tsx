import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    createPortal
} from 'react-dom';

import {
    useLocation,
    useNavigate
} from 'react-router-dom';

import {
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

type TourAction =
    | 'click'
    | 'input'
    | 'manual'
    | 'event';

interface TourStep {
    id: string;
    route?: string;
    target: string;
    title: string;
    description: string;
    action: TourAction;
    optional?: boolean;
    eventName?: string;
    nextLabel?: string;
    allowOutsideInteraction?: boolean;
}

interface RectState {
    top: number;
    left: number;
    width: number;
    height: number;
}

const TOUR_STORAGE_KEY =
    'kezek_business_owner_tour_completed';

const steps: TourStep[] = [
    {
        id: 'business-open',
        route: '/crm/my-businesses',
        target: '[data-tour="create-business"]',
        title: 'Создайте первый бизнес',
        description:
            'Нажмите на выделенную кнопку «Создать бизнес».',
        action: 'click'
    },
    {
        id: 'business-name',
        target: '[data-tour="business-name"]',
        title: 'Название бизнеса',
        description:
            'Введите название, которое будут видеть ваши клиенты.',
        action: 'input'
    },
    {
        id: 'business-description',
        target: '[data-tour="business-description"]',
        title: 'Описание бизнеса',
        description:
            'Кратко расскажите клиентам о вашем бизнесе, услугах и преимуществах.',
        action: 'input',
        optional: true
    },
    {
        id: 'business-phone',
        target: '[data-tour="business-phone"]',
        title: 'Телефон',
        description:
            'Укажите номер телефона, по которому клиенты смогут связаться с бизнесом.',
        action: 'input'
    },
    {
        id: 'business-email',
        target: '[data-tour="business-email"]',
        title: 'Email',
        description:
            'Укажите рабочий Email. Это поле необязательное.',
        action: 'input',
        optional: true
    },
    {
        id: 'business-city',
        target: '[data-tour="business-city"]',
        title: 'Город',
        description:
            'Проверьте выбранный город. Если нужно, откройте список и выберите другой.',
        action: 'manual',
        allowOutsideInteraction: true
    },
    {
        id: 'business-address',
        target: '[data-tour="business-address"]',
        title: 'Адрес',
        description:
            'Введите точный адрес бизнеса: улицу, дом и при необходимости офис.',
        action: 'input'
    },
    {
        id: 'business-logo',
        target: '[data-tour="business-logo"]',
        title: 'Логотип бизнеса',
        description:
            'Добавьте логотип или фотографию бизнеса. Этот шаг можно пропустить.',
        action: 'manual',
        optional: true,
        allowOutsideInteraction: true
    },
    {
        id: 'business-status',
        target: '[data-tour="business-status"]',
        title: 'Статус публикации',
        description:
            '«Активен» делает бизнес доступным клиентам, «Черновик» оставляет его скрытым.',
        action: 'manual'
    },
    {
        id: 'business-submit',
        target: '[data-tour="business-submit"]',
        title: 'Создайте бизнес',
        description:
            'Нажмите «Создать бизнес». Следующий этап откроется только после успешного ответа сервера.',
        action: 'event',
        eventName: 'kezek:business-created'
    },
    {
        id: 'service',
        route: '/crm/services',
        target: '[data-tour="create-service"]',
        title: 'Бизнес создан',
        description:
            'Теперь добавьте первую услугу. На следующем этапе мы так же проведём вас через её настройку.',
        action: 'manual'
    },
    {
        id: 'staff',
        route: '/crm/staff',
        target: '[data-tour="create-staff"]',
        title: 'Добавьте сотрудника',
        description:
            'После услуг добавьте мастера или другого сотрудника бизнеса.',
        action: 'manual'
    },
    {
        id: 'assign-service',
        route: '/crm/staff',
        target: '[data-tour="assign-service"]',
        title: 'Назначьте услуги',
        description:
            'Выберите, какие услуги может выполнять сотрудник.',
        action: 'manual'
    },
    {
        id: 'schedule',
        route: '/crm/schedule',
        target: '[data-tour="schedule"]',
        title: 'Настройте график',
        description:
            'Укажите рабочие дни и часы сотрудника.',
        action: 'manual'
    },
    {
        id: 'settings',
        route: '/crm/settings',
        target: '[data-tour="booking-settings"]',
        title: 'Настройте онлайн-запись',
        description:
            'Здесь находятся параметры записи, отмены и предоплаты.',
        action: 'manual'
    },
    {
        id: 'appointment',
        route: '/crm/appointments',
        target: '[data-tour="create-appointment"]',
        title: 'Создайте первую запись',
        description:
            'Создайте тестовую запись клиента и проверьте работу CRM.',
        action: 'manual'
    }
];

const getVisibleElement = (
    selector: string
): HTMLElement | null => {
    const elements =
        Array.from(
            document.querySelectorAll<HTMLElement>(
                selector
            )
        );

    return (
        elements.find(
            element => {
                const rect =
                    element.getBoundingClientRect();

                const style =
                    window.getComputedStyle(
                        element
                    );

                return (
                    rect.width > 0 &&
                    rect.height > 0 &&
                    style.display !== 'none' &&
                    style.visibility !== 'hidden'
                );
            }
        ) ?? null
    );
};

const waitForElement = (
    selector: string,
    timeout = 15000
): Promise<HTMLElement | null> => {
    return new Promise(
        resolve => {
            const existing =
                getVisibleElement(
                    selector
                );

            if (existing) {
                resolve(existing);
                return;
            }

            const startedAt =
                Date.now();

            const interval =
                window.setInterval(
                    () => {
                        const element =
                            getVisibleElement(
                                selector
                            );

                        if (element) {
                            window.clearInterval(
                                interval
                            );

                            resolve(
                                element
                            );

                            return;
                        }

                        if (
                            Date.now() -
                            startedAt >=
                            timeout
                        ) {
                            window.clearInterval(
                                interval
                            );

                            resolve(
                                null
                            );
                        }
                    },
                    100
                );
        }
    );
};

const hasInputValue = (
    element: HTMLElement | null
) => {
    if (!element) {
        return false;
    }

    if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
    ) {
        return (
            element.value.trim().length > 0
        );
    }

    const nestedInput =
        element.querySelector<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >(
            'input, textarea, select'
        );

    if (!nestedInput) {
        return false;
    }

    return (
        nestedInput.value.trim().length > 0
    );
};

export default function CrmTour() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const [
        isRunning,
        setIsRunning
    ] = useState(
        () =>
            localStorage.getItem(
                TOUR_STORAGE_KEY
            ) !== 'true'
    );

    const [
        stepIndex,
        setStepIndex
    ] = useState(0);

    const [
        rect,
        setRect
    ] = useState<RectState | null>(
        null
    );

    const [
        targetElement,
        setTargetElement
    ] = useState<HTMLElement | null>(
        null
    );

    const [
        targetReady,
        setTargetReady
    ] = useState(false);

    const step =
        steps[stepIndex];

    const clearTarget =
        useCallback(
            () => {
                setTargetElement(
                    null
                );

                setRect(
                    null
                );

                setTargetReady(
                    false
                );
            },
            []
        );

    const finishTour =
        useCallback(
            () => {
                localStorage.setItem(
                    TOUR_STORAGE_KEY,
                    'true'
                );

                setIsRunning(
                    false
                );

                clearTarget();
            },
            [clearTarget]
        );

    const goNext =
        useCallback(
            () => {
                clearTarget();

                setStepIndex(
                    previous => {
                        if (
                            previous >=
                            steps.length - 1
                        ) {
                            return previous;
                        }

                        return previous + 1;
                    }
                );
            },
            [clearTarget]
        );

    const restartTour =
        useCallback(
            () => {
                localStorage.removeItem(
                    TOUR_STORAGE_KEY
                );

                clearTarget();

                setStepIndex(0);

                setIsRunning(true);
            },
            [clearTarget]
        );

    useEffect(
        () => {
            const handleRestart =
                () => {
                    restartTour();
                };

            window.addEventListener(
                'kezek:tour:restart',
                handleRestart
            );

            return () => {
                window.removeEventListener(
                    'kezek:tour:restart',
                    handleRestart
                );
            };
        },
        [restartTour]
    );

    useEffect(
        () => {
            const handleBusinessModalClosed =
                () => {
                    const currentStep =
                        steps[stepIndex];

                    if (
                        currentStep?.id.startsWith(
                            'business-'
                        ) &&
                        currentStep.id !==
                            'business-open'
                    ) {
                        clearTarget();
                        setStepIndex(0);
                    }
                };

            window.addEventListener(
                'kezek:business-modal-closed',
                handleBusinessModalClosed
            );

            return () => {
                window.removeEventListener(
                    'kezek:business-modal-closed',
                    handleBusinessModalClosed
                );
            };
        },
        [stepIndex, clearTarget]
    );

    const updatePosition =
        useCallback(
            () => {
                if (!targetElement) {
                    return;
                }

                const targetRect =
                    targetElement
                        .getBoundingClientRect();

                setRect({
                    top:
                        targetRect.top,
                    left:
                        targetRect.left,
                    width:
                        targetRect.width,
                    height:
                        targetRect.height
                });
            },
            [targetElement]
        );

    const findTarget =
        useCallback(
            async () => {
                if (
                    !isRunning ||
                    !step
                ) {
                    return;
                }

                if (
                    step.route &&
                    location.pathname !==
                        step.route
                ) {
                    clearTarget();

                    navigate(
                        step.route
                    );

                    return;
                }

                const element =
                    await waitForElement(
                        step.target
                    );

                if (!element) {
                    clearTarget();
                    return;
                }

                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

                setTargetElement(
                    element
                );

                if (
                    step.action === 'manual'
                ) {
                    setTargetReady(true);
                } else if (
                    step.action === 'input'
                ) {
                    setTargetReady(
                        step.optional
                            ? true
                            : hasInputValue(
                                element
                            )
                    );
                } else {
                    setTargetReady(false);
                }
            },
            [
                isRunning,
                step,
                location.pathname,
                navigate,
                clearTarget
            ]
        );

    useEffect(
        () => {
            findTarget();
        },
        [findTarget]
    );

    useEffect(
        () => {
            updatePosition();

            window.addEventListener(
                'resize',
                updatePosition
            );

            window.addEventListener(
                'scroll',
                updatePosition,
                true
            );

            return () => {
                window.removeEventListener(
                    'resize',
                    updatePosition
                );

                window.removeEventListener(
                    'scroll',
                    updatePosition,
                    true
                );
            };
        },
        [updatePosition]
    );

    useEffect(
        () => {
            if (!targetElement) {
                return;
            }

            const first =
                window.setTimeout(
                    () => {
                        updatePosition();
                    },
                    120
                );

            const second =
                window.setTimeout(
                    () => {
                        updatePosition();
                    },
                    420
                );

            return () => {
                window.clearTimeout(
                    first
                );

                window.clearTimeout(
                    second
                );
            };
        },
        [
            targetElement,
            location.pathname,
            updatePosition
        ]
    );

    useEffect(
        () => {
            if (
                !targetElement ||
                !step ||
                step.action !== 'click'
            ) {
                return;
            }

            const handleClick =
                () => {
                    window.setTimeout(
                        () => {
                            goNext();
                        },
                        0
                    );
                };

            targetElement.addEventListener(
                'click',
                handleClick
            );

            return () => {
                targetElement.removeEventListener(
                    'click',
                    handleClick
                );
            };
        },
        [targetElement, step, goNext]
    );

    useEffect(
        () => {
            if (
                !targetElement ||
                !step ||
                step.action !== 'input'
            ) {
                return;
            }

            const updateReady =
                () => {
                    setTargetReady(
                        step.optional
                            ? true
                            : hasInputValue(
                                targetElement
                            )
                    );
                };

            targetElement.addEventListener(
                'input',
                updateReady
            );

            targetElement.addEventListener(
                'change',
                updateReady
            );

            updateReady();

            return () => {
                targetElement.removeEventListener(
                    'input',
                    updateReady
                );

                targetElement.removeEventListener(
                    'change',
                    updateReady
                );
            };
        },
        [targetElement, step]
    );

    useEffect(
        () => {
            if (
                !step ||
                step.action !== 'event' ||
                !step.eventName
            ) {
                return;
            }

            const handleEvent =
                () => {
                    goNext();
                };

            window.addEventListener(
                step.eventName,
                handleEvent
            );

            return () => {
                window.removeEventListener(
                    step.eventName!,
                    handleEvent
                );
            };
        },
        [step, goNext]
    );

    const handleNext =
        () => {
            if (!step) {
                return;
            }

            if (
                step.action === 'input' &&
                !step.optional &&
                !targetReady
            ) {
                return;
            }

            if (
                stepIndex >=
                steps.length - 1
            ) {
                finishTour();
                return;
            }

            goNext();
        };

    const handleBack =
        () => {
            if (
                stepIndex === 0 ||
                stepIndex === 1
            ) {
                return;
            }

            clearTarget();

            setStepIndex(
                previous =>
                    previous - 1
            );
        };

    const handleClose =
        () => {
            setIsRunning(false);
            clearTarget();
        };

    const showNextButton =
        useMemo(
            () =>
                step?.action === 'input' ||
                step?.action === 'manual',
            [step]
        );

    const nextButtonLabel =
        useMemo(
            () => {
                if (!step) {
                    return 'Далее';
                }

                if (
                    stepIndex ===
                    steps.length - 1
                ) {
                    return 'Завершить';
                }

                if (
                    step.optional &&
                    step.action === 'input' &&
                    targetElement &&
                    !hasInputValue(
                        targetElement
                    )
                ) {
                    return 'Пропустить';
                }

                if (step.nextLabel) {
                    return step.nextLabel;
                }

                return 'Далее';
            },
            [
                step,
                stepIndex,
                targetElement,
                targetReady
            ]
        );

    if (
        !isRunning ||
        !step ||
        !rect
    ) {
        return null;
    }

    const padding = 8;

    const spotlight = {
        top:
            Math.max(
                rect.top - padding,
                0
            ),
        left:
            Math.max(
                rect.left - padding,
                0
            ),
        width:
            rect.width +
            padding * 2,
        height:
            rect.height +
            padding * 2
    };

    const tooltipWidth = 360;

    const spaceBelow =
        window.innerHeight -
        (
            spotlight.top +
            spotlight.height
        );

    const showAbove =
        spaceBelow < 285;

    const tooltipTop =
        showAbove
            ? Math.max(
                spotlight.top - 270,
                16
            )
            : Math.min(
                spotlight.top +
                spotlight.height +
                16,
                window.innerHeight - 270
            );

    const tooltipLeft =
        Math.min(
            Math.max(
                spotlight.left,
                16
            ),
            window.innerWidth -
            tooltipWidth -
            16
        );

    const overlayPointerClass =
        step.allowOutsideInteraction
            ? 'pointer-events-none'
            : 'pointer-events-auto';

    return createPortal(
        <>
            <div
                className={`fixed left-0 right-0 top-0 z-[9998] bg-black/65 ${overlayPointerClass}`}
                style={{
                    height:
                        spotlight.top
                }}
            />

            <div
                className={`fixed bottom-0 left-0 right-0 z-[9998] bg-black/65 ${overlayPointerClass}`}
                style={{
                    top:
                        spotlight.top +
                        spotlight.height
                }}
            />

            <div
                className={`fixed left-0 z-[9998] bg-black/65 ${overlayPointerClass}`}
                style={{
                    top:
                        spotlight.top,
                    width:
                        spotlight.left,
                    height:
                        spotlight.height
                }}
            />

            <div
                className={`fixed right-0 z-[9998] bg-black/65 ${overlayPointerClass}`}
                style={{
                    top:
                        spotlight.top,
                    left:
                        spotlight.left +
                        spotlight.width,
                    height:
                        spotlight.height
                }}
            />

            <div
                className="pointer-events-none fixed z-[9999] rounded-xl border-2 border-[#818CF8] shadow-[0_0_0_4px_rgba(99,102,241,0.18),0_0_28px_rgba(99,102,241,0.7)]"
                style={{
                    top:
                        spotlight.top,
                    left:
                        spotlight.left,
                    width:
                        spotlight.width,
                    height:
                        spotlight.height
                }}
            >
                <span className="absolute -right-2 -top-2 h-4 w-4 animate-ping rounded-full bg-[#6366F1]" />
                <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-[#6366F1]" />
            </div>

            <div
                className="fixed z-[10000] w-[360px] max-w-[calc(100vw-32px)] rounded-2xl border border-[#D9DDEC] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)]"
                style={{
                    top:
                        tooltipTop,
                    left:
                        tooltipLeft
                }}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6366F1]">
                            Шаг {stepIndex + 1} из {steps.length}
                        </div>

                        <h3 className="mt-1 text-[17px] font-bold text-[#101828]">
                            {step.title}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#344054]"
                    >
                        <X size={17} />
                    </button>
                </div>

                <p className="mt-3 text-[13px] leading-5 text-[#667085]">
                    {step.description}
                </p>

                {step.action === 'click' && (
                    <div className="mt-4 rounded-xl bg-[#EEF2FF] px-3 py-2.5 text-[12px] font-medium text-[#4338CA]">
                        Нажмите на выделенный элемент
                    </div>
                )}

                {step.action === 'event' && (
                    <div className="mt-4 rounded-xl bg-[#EEF2FF] px-3 py-2.5 text-[12px] font-medium text-[#4338CA]">
                        Ожидаем успешное создание бизнеса
                    </div>
                )}

                {step.action === 'input' && !step.optional && !targetReady && (
                    <div className="mt-4 rounded-xl bg-[#FFF7ED] px-3 py-2.5 text-[12px] font-medium text-[#C2410C]">
                        Сначала заполните выделенное поле
                    </div>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={
                            stepIndex === 0 ||
                            stepIndex === 1
                        }
                        className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-[12px] font-semibold text-[#667085] transition hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <ChevronLeft size={15} />
                        Назад
                    </button>

                    {showNextButton && (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={
                                step.action === 'input' &&
                                !step.optional &&
                                !targetReady
                            }
                            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 text-[12px] font-semibold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {nextButtonLabel}

                            {stepIndex < steps.length - 1 && (
                                <ChevronRight size={15} />
                            )}
                        </button>
                    )}
                </div>

                <div className="mt-4 flex gap-1.5">
                    {steps.map(
                        (
                            item,
                            index
                        ) => (
                            <div
                                key={item.id}
                                className={`h-1.5 flex-1 rounded-full ${
                                    index <= stepIndex
                                        ? 'bg-[#6366F1]'
                                        : 'bg-[#EAECF0]'
                                }`}
                            />
                        )
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}

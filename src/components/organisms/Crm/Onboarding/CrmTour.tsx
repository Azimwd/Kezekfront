import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
type TourAction = 'click' | 'input' | 'manual' | 'event';
interface TourStep {
    id: string;
    stage: number;
    stageTitle: string;
    route?: string;
    target: string;
    title: string;
    description: string;
    action: TourAction;
    optional?: boolean;
    eventName?: string;
    autoAdvanceEventName?: string;
    waitingText?: string;
    nextLabel?: string;
    allowOutsideInteraction?: boolean;
    hint?: string;
    tooltipPlacement?: 'auto' | 'select';
    validation?: 'positive-number' | 'addons-valid';
    validationMessage?: string;
    errorEventName?: string;
}
interface RectState {
    top: number;
    left: number;
    width: number;
    height: number;
}
const TOUR_STORAGE_KEY = 'kezek_business_owner_tour_completed';
const steps: TourStep[] = [
    {
        id: 'business-open',
        stage: 1,
        stageTitle: 'Бизнес',
        route: '/crm/my-businesses',
        target: '[data-tour="create-business"]',
        title: 'Создайте первый бизнес',
        description: 'Нажмите на выделенную кнопку «Создать бизнес».',
        action: 'click',
        hint: 'Все данные бизнеса можно будет изменить позже в разделе «Мои бизнесы». Сейчас достаточно заполнить основные настройки.'
    },
    {
        id: 'business-name',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-name"]',
        title: 'Название бизнеса',
        description: 'Введите название, которое будут видеть ваши клиенты.',
        action: 'input'
    },
    {
        id: 'business-description',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-description"]',
        title: 'Описание бизнеса',
        description: 'Кратко расскажите клиентам о вашем бизнесе, услугах и преимуществах.',
        action: 'input',
        optional: true
    },
    {
        id: 'business-phone',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-phone"]',
        title: 'Телефон',
        description: 'Укажите номер телефона, по которому клиенты смогут связаться с бизнесом.',
        action: 'input'
    },
    {
        id: 'business-email',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-email"]',
        title: 'Email',
        description: 'Укажите рабочий Email. Это поле необязательное.',
        action: 'input',
        optional: true
    },
    {
        id: 'business-city',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-city"]',
        title: 'Город',
        description: 'Проверьте выбранный город. Если нужно, откройте список и выберите другой.',
        action: 'manual',
        allowOutsideInteraction: true,
        tooltipPlacement: 'select'
    },
    {
        id: 'business-address',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-address"]',
        title: 'Адрес',
        description: 'Введите точный адрес бизнеса: улицу, дом и при необходимости офис.',
        action: 'input'
    },
    {
        id: 'business-logo',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-logo"]',
        title: 'Логотип бизнеса',
        description: 'Добавьте логотип или фотографию бизнеса. Этот шаг можно пропустить.',
        action: 'manual',
        optional: true,
        allowOutsideInteraction: true
    },
    {
        id: 'business-status',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-status"]',
        title: 'Статус публикации',
        description: '«Активен» делает бизнес доступным клиентам, «Черновик» оставляет его скрытым.',
        action: 'manual'
    },
    {
        id: 'business-submit',
        stage: 1,
        stageTitle: 'Бизнес',
        target: '[data-tour="business-submit"]',
        title: 'Создайте бизнес',
        description: 'Нажмите «Создать бизнес». Следующий этап откроется только после успешного ответа сервера.',
        action: 'event',
        eventName: 'kezek:business-created',
        waitingText: 'Ожидаем успешное создание бизнеса'
    },
    {
        id: 'staff-open',
        stage: 2,
        stageTitle: 'Мастер',
        route: '/crm/staff',
        target: '[data-tour="create-staff"]',
        title: 'Добавьте первого мастера',
        description: 'Бизнес готов. Теперь добавьте сотрудника, который будет выполнять услуги.',
        action: 'click',
        hint: 'Данные мастера, фотографию, должность и статус можно будет изменить позже в разделе «Сотрудники».'
    },
    {
        id: 'staff-first-name',
        stage: 2,
        stageTitle: 'Мастер',
        route: '/crm/staff/add',
        target: '[data-tour="staff-first-name"]',
        title: 'Имя мастера',
        description: 'Введите имя сотрудника. Это обязательное поле.',
        action: 'input'
    },
    {
        id: 'staff-last-name',
        stage: 2,
        stageTitle: 'Мастер',
        target: '[data-tour="staff-last-name"]',
        title: 'Фамилия',
        description: 'Укажите фамилию сотрудника. Если не хотите, этот шаг можно пропустить.',
        action: 'input',
        optional: true
    },
    {
        id: 'staff-position',
        stage: 2,
        stageTitle: 'Мастер',
        target: '[data-tour="staff-position"]',
        title: 'Должность',
        description: 'Укажите должность или специализацию мастера, например «Старший барбер».',
        action: 'input'
    },
    {
        id: 'staff-description',
        stage: 2,
        stageTitle: 'Мастер',
        target: '[data-tour="staff-description"]',
        title: 'Описание специализации',
        description: 'Кратко опишите опыт и навыки сотрудника. Этот шаг можно пропустить.',
        action: 'input',
        optional: true
    },
    {
        id: 'staff-photo',
        stage: 2,
        stageTitle: 'Мастер',
        target: '[data-tour="staff-photo"]',
        title: 'Фотография мастера',
        description: 'Добавьте фотографию сотрудника, чтобы клиентам было проще выбрать мастера. Этот шаг можно пропустить.',
        action: 'manual',
        optional: true,
        allowOutsideInteraction: true
    },
    {
        id: 'staff-active',
        stage: 2,
        stageTitle: 'Мастер',
        target: '[data-tour="staff-active"]',
        title: 'Статус мастера',
        description: 'Активный мастер доступен для работы и записи клиентов. При необходимости статус можно изменить.',
        action: 'manual'
    },
    {
        id: 'staff-submit',
        stage: 2,
        stageTitle: 'Мастер',
        target: '[data-tour="staff-submit"]',
        title: 'Сохраните мастера',
        description: 'Нажмите «Сохранить». Следующий этап откроется только после успешного ответа сервера.',
        action: 'event',
        eventName: 'kezek:staff-created',
        waitingText: 'Ожидаем успешное добавление мастера'
    },
    {
        id: 'service-open',
        stage: 3,
        stageTitle: 'Услуга',
        route: '/crm/services',
        target: '[data-tour="create-service"]',
        title: 'Создайте первую услугу',
        description: 'Нажмите на выделенную кнопку «Создать услугу».',
        action: 'click',
        hint: 'Название, описание, цену, длительность, категорию, мастеров и дополнительные услуги можно будет изменить позже в разделе «Услуги».'
    },
    {
        id: 'service-name',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-name"]',
        title: 'Название услуги',
        description: 'Введите понятное название услуги, которое увидят клиенты.',
        action: 'input'
    },
    {
        id: 'service-category',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-category"]',
        title: 'Категория',
        description: 'При необходимости выберите категорию услуги. Этот шаг можно пропустить.',
        action: 'manual',
        optional: true,
        allowOutsideInteraction: true,
        tooltipPlacement: 'select'
    },
    {
        id: 'service-description',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-description"]',
        title: 'Описание',
        description: 'Кратко опишите, что входит в услугу. Этот шаг можно пропустить.',
        action: 'input',
        optional: true
    },
    {
        id: 'service-price',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-price"]',
        title: 'Цена',
        description: 'Укажите стоимость основной услуги в тенге. Цена должна быть больше 0 ₸.',
        action: 'input',
        validation: 'positive-number',
        validationMessage: 'Цена услуги должна быть больше 0 ₸.'
    },
    {
        id: 'service-duration',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-duration"]',
        title: 'Длительность',
        description: 'Укажите длительность услуги в минутах. Это значение используется при расчёте свободного времени для записи.',
        action: 'input',
        validation: 'positive-number',
        validationMessage: 'Длительность услуги должна быть больше 0 минут.'
    },
    {
        id: 'service-buffers',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-buffers"]',
        title: 'Буфер времени',
        description: 'Буфер до и после услуги резервирует дополнительное время между записями. Если он не нужен, оставьте 0.',
        action: 'manual',
        optional: true
    },
    {
        id: 'service-addons',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-addons"]',
        title: 'Дополнительные услуги',
        description: 'Здесь можно добавить опции к основной услуге, например снятие покрытия или дополнительный уход. Сейчас это можно пропустить.',
        action: 'manual',
        optional: true,
        allowOutsideInteraction: true,
        validation: 'addons-valid',
        validationMessage: 'Если добавили дополнительную услугу, заполните её название и укажите цену больше 0 ₸. Либо удалите незаполненную доп. услугу.'
    },
    {
        id: 'service-active',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-active"]',
        title: 'Статус услуги',
        description: 'Активная услуга доступна клиентам для записи. При необходимости её можно отключить позже.',
        action: 'manual'
    },
    {
        id: 'service-staff',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-staff"]',
        title: 'Назначьте мастера',
        description: 'Выберите хотя бы одного мастера, который сможет выполнять эту услугу.',
        action: 'event',
        eventName: 'kezek:service-staff-selected',
        waitingText: 'Выберите мастера из списка'
    },
    {
        id: 'service-submit',
        stage: 3,
        stageTitle: 'Услуга',
        target: '[data-tour="service-submit"]',
        title: 'Создайте услугу',
        description: 'Нажмите «Создать». Следующий этап откроется только после успешного создания услуги и привязки мастера.',
        action: 'event',
        eventName: 'kezek:service-created',
        errorEventName: 'kezek:service-create-error',
        waitingText: 'Ожидаем успешное создание услуги'
    },
    {
        id: 'schedule-specialist',
        stage: 4,
        stageTitle: 'Расписание',
        route: '/crm/schedule',
        target: '[data-tour="schedule-specialist"]',
        title: 'Выберите мастера',
        description: 'Проверьте, для какого мастера настраивается график. При необходимости выберите другого специалиста.',
        action: 'manual',
        allowOutsideInteraction: true,
        tooltipPlacement: 'select',
        hint: 'График каждого мастера настраивается отдельно. Его можно изменить в любое время в разделе «График работы».'
    },
    {
        id: 'schedule-day',
        stage: 4,
        stageTitle: 'Расписание',
        target: '[data-tour="schedule-day"]',
        title: 'Откройте настройку дня',
        description: 'Нажмите на выделенный день недели, чтобы открыть его рабочие настройки.',
        action: 'click'
    },
    {
        id: 'schedule-work-settings',
        stage: 4,
        stageTitle: 'Расписание',
        target: '[data-tour="schedule-work-settings"]',
        title: 'Настройте рабочее время',
        description: 'Укажите, является ли день рабочим, и при необходимости измените начало и конец рабочего дня.',
        action: 'manual',
        allowOutsideInteraction: true,
        hint: 'Здесь же можно настроить перерыв и индивидуальный выходной. Мы не будем проходить каждый дополнительный параметр отдельно.'
    },
    {
        id: 'schedule-save',
        stage: 4,
        stageTitle: 'Расписание',
        target: '[data-tour="schedule-save"]',
        title: 'Сохраните график',
        description: 'Нажмите «Сохранить». Следующий этап откроется только после успешного сохранения графика на сервере.',
        action: 'event',
        eventName: 'kezek:schedule-saved',
        waitingText: 'Ожидаем успешное сохранение графика'
    },
    {
        id: 'settings-recording-rules',
        stage: 5,
        stageTitle: 'Настройки записи',
        route: '/crm/settings',
        target: '[data-tour="settings-recording-rules"]',
        title: 'Правила онлайн-записи',
        description: 'Здесь задаются шаг свободных слотов, минимальное время до записи и максимальный период записи вперёд. Проверьте значения и при необходимости измените их.',
        action: 'manual',
        hint: 'Не нужно настраивать каждый параметр сейчас. Все правила можно изменить позже в разделе «Настройки».'
    },
    {
        id: 'settings-confirmation',
        stage: 5,
        stageTitle: 'Настройки записи',
        target: '[data-tour="settings-confirmation"]',
        title: 'Подтверждение записей',
        description: 'Выберите, будут ли новые записи подтверждаться автоматически или требовать ручного подтверждения.',
        action: 'manual'
    },
    {
        id: 'settings-prepayment',
        stage: 5,
        stageTitle: 'Настройки записи',
        target: '[data-tour="settings-prepayment"]',
        title: 'Предоплата',
        description: 'Предоплату можно оставить выключенной. Если включите её, укажите процент предоплаты и ссылку Kaspi для клиента.',
        action: 'manual',
        optional: true,
        hint: 'Предоплата необязательна. Её можно включить позже, когда будете готовы принимать оплату перед записью.'
    },
    {
        id: 'settings-cancellation',
        stage: 5,
        stageTitle: 'Настройки записи',
        target: '[data-tour="settings-cancellation"]',
        title: 'Отмена записи клиентом',
        description: 'Решите, сможет ли клиент самостоятельно отменять запись, и при необходимости задайте минимальное время до визита для отмены.',
        action: 'manual'
    },
    {
        id: 'settings-save',
        stage: 5,
        stageTitle: 'Настройки записи',
        target: '[data-tour="settings-save"]',
        title: 'Настройки готовы',
        description: 'Если вы изменили параметры, нажмите «Сохранить настройки». Если текущие значения вас устраивают и кнопка неактивна, нажмите «Настройки готовы» в подсказке.',
        action: 'manual',
        nextLabel: 'Настройки готовы',
        autoAdvanceEventName: 'kezek:settings-saved',
        hint: 'Любой из этих параметров можно изменить позже. Туториал не будет отдельно показывать процесс редактирования.'
    },
    {
        id: 'appointment',
        stage: 6,
        stageTitle: 'Первая запись',
        route: '/crm/appointments',
        target: '[data-tour="create-appointment"]',
        title: 'Создайте первую запись',
        description: 'Создайте тестовую запись клиента и проверьте работу CRM.',
        action: 'manual'
    }
];
const getVisibleElement = (selector: string): HTMLElement | null => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    return (elements.find(element => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return (rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden');
    }) ?? null);
};
const waitForElement = (selector: string, timeout = 15000): Promise<HTMLElement | null> => {
    return new Promise(resolve => {
        const existing = getVisibleElement(selector);
        if (existing) {
            resolve(existing);
            return;
        }
        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const element = getVisibleElement(selector);
            if (element) {
                window.clearInterval(interval);
                resolve(element);
                return;
            }
            if (Date.now() -
                startedAt >=
                timeout) {
                window.clearInterval(interval);
                resolve(null);
            }
        }, 100);
    });
};
const getValueElement = (element: HTMLElement | null) => {
    if (!element) {
        return null;
    }
    if (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement) {
        return element;
    }
    return element.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');
};
const hasInputValue = (element: HTMLElement | null) => {
    const input = getValueElement(element);
    return Boolean(input && input.value.trim().length > 0);
};
const isStepTargetValid = (step: TourStep, element: HTMLElement | null) => {
    if (!element) {
        return false;
    }
    if (step.validation === 'positive-number') {
        const input = getValueElement(element);
        if (!input) {
            return false;
        }
        const value = Number(input.value.trim().replace(',', '.'));
        return Number.isFinite(value) && value > 0;
    }
    if (step.validation === 'addons-valid') {
        return element.dataset.tourValid !== 'false';
    }
    if (step.action === 'input' && !step.optional) {
        return hasInputValue(element);
    }
    return true;
};
export default function CrmTour() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isRunning, setIsRunning] = useState(() => localStorage.getItem(TOUR_STORAGE_KEY) !== 'true');
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState<RectState | null>(null);
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
    const [targetReady, setTargetReady] = useState(false);
    const [actionError, setActionError] = useState('');
    const handledEventStepRef = useRef<string | null>(null);
    const step = steps[stepIndex];
    const stageSteps = useMemo(() => step
        ? steps.filter(item => item.stage ===
            step.stage)
        : [], [step]);
    const stageStepIndex = useMemo(() => step
        ? stageSteps.findIndex(item => item.id ===
            step.id)
        : -1, [stageSteps, step]);
    useEffect(() => {
        setActionError('');
    }, [step?.id]);
    const clearTarget = useCallback(() => {
        setTargetElement(null);
        setRect(null);
        setTargetReady(false);
    }, []);
    const finishTour = useCallback(() => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        setIsRunning(false);
        clearTarget();
    }, [clearTarget]);
    const goNext = useCallback(() => {
        clearTarget();
        setStepIndex(previous => {
            if (previous >=
                steps.length - 1) {
                return previous;
            }
            return previous + 1;
        });
    }, [clearTarget]);
    const restartTour = useCallback(() => {
        localStorage.removeItem(TOUR_STORAGE_KEY);
        clearTarget();
        setStepIndex(0);
        setIsRunning(true);
    }, [clearTarget]);
    useEffect(() => {
        const handleRestart = () => {
            restartTour();
        };
        window.addEventListener('kezek:tour:restart', handleRestart);
        return () => {
            window.removeEventListener('kezek:tour:restart', handleRestart);
        };
    }, [restartTour]);
    useEffect(() => {
        const handleBusinessModalClosed = () => {
            const currentStep = steps[stepIndex];
            if (currentStep?.id.startsWith('business-') &&
                currentStep.id !==
                    'business-open') {
                clearTarget();
                setStepIndex(0);
            }
        };
        window.addEventListener('kezek:business-modal-closed', handleBusinessModalClosed);
        return () => {
            window.removeEventListener('kezek:business-modal-closed', handleBusinessModalClosed);
        };
    }, [stepIndex, clearTarget]);
    useEffect(() => {
        const handleStaffAddCancelled = () => {
            const staffOpenIndex = steps.findIndex(item => item.id ===
                'staff-open');
            if (staffOpenIndex < 0) {
                return;
            }
            clearTarget();
            setStepIndex(staffOpenIndex);
        };
        window.addEventListener('kezek:staff-add-cancelled', handleStaffAddCancelled);
        return () => {
            window.removeEventListener('kezek:staff-add-cancelled', handleStaffAddCancelled);
        };
    }, [clearTarget]);
    useEffect(() => {
        const handleServicePanelClosed = () => {
            const currentStep = steps[stepIndex];
            if (!currentStep?.id.startsWith('service-') ||
                currentStep.id ===
                    'service-open') {
                return;
            }
            const serviceOpenIndex = steps.findIndex(item => item.id ===
                'service-open');
            if (serviceOpenIndex < 0) {
                return;
            }
            clearTarget();
            setStepIndex(serviceOpenIndex);
        };
        window.addEventListener('kezek:service-panel-closed', handleServicePanelClosed);
        return () => {
            window.removeEventListener('kezek:service-panel-closed', handleServicePanelClosed);
        };
    }, [
        stepIndex,
        clearTarget
    ]);
    useEffect(() => {
        const handleSchedulePanelClosed = () => {
            const currentStep = steps[stepIndex];
            if (!currentStep?.id.startsWith('schedule-') ||
                currentStep.id ===
                    'schedule-specialist' ||
                currentStep.id ===
                    'schedule-day') {
                return;
            }
            const scheduleDayIndex = steps.findIndex(item => item.id ===
                'schedule-day');
            if (scheduleDayIndex < 0) {
                return;
            }
            clearTarget();
            setStepIndex(scheduleDayIndex);
        };
        window.addEventListener('kezek:schedule-panel-closed', handleSchedulePanelClosed);
        return () => {
            window.removeEventListener('kezek:schedule-panel-closed', handleSchedulePanelClosed);
        };
    }, [
        stepIndex,
        clearTarget
    ]);
    const updatePosition = useCallback(() => {
        if (!targetElement) {
            return;
        }
        const targetRect = targetElement
            .getBoundingClientRect();
        setRect({
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height
        });
    }, [targetElement]);
    const findTarget = useCallback(async () => {
        if (!isRunning ||
            !step) {
            return;
        }
        if (step.route &&
            location.pathname !==
                step.route) {
            clearTarget();
            navigate(step.route);
            return;
        }
        const element = await waitForElement(step.target);
        if (!element) {
            clearTarget();
            return;
        }
        element.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'nearest'
        });
        setTargetElement(element);
        if (step.action === 'manual' ||
            step.action === 'input') {
            setTargetReady(
                isStepTargetValid(
                    step,
                    element
                )
            );
        }
        else {
            setTargetReady(false);
        }
    }, [
        isRunning,
        step,
        location.pathname,
        navigate,
        clearTarget
    ]);
    useEffect(() => {
        findTarget();
    }, [findTarget]);
    useEffect(() => {
        if (!isRunning) {
            return;
        }
        const previousBodyOverflow = document.body.style.overflow;
        const previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
        const previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
        document.body.style.overflow =
            'hidden';
        document.body.style.overscrollBehavior =
            'none';
        document.documentElement.style.overscrollBehavior =
            'none';
        const isAllowedScrollArea = (target: EventTarget | null) => {
            if (!(target instanceof Element)) {
                return false;
            }
            return Boolean(target.closest('[data-tour-scroll-allowed="true"]'));
        };
        const preventWheel = (event: WheelEvent) => {
            if (isAllowedScrollArea(event.target)) {
                return;
            }
            event.preventDefault();
        };
        const preventTouchMove = (event: TouchEvent) => {
            if (isAllowedScrollArea(event.target)) {
                return;
            }
            event.preventDefault();
        };
        const preventScrollKeys = (event: KeyboardEvent) => {
            const target = event.target;
            if (target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                (target instanceof HTMLElement &&
                    target.isContentEditable)) {
                return;
            }
            if ([
                'ArrowUp',
                'ArrowDown',
                'PageUp',
                'PageDown',
                'Home',
                'End',
                ' '
            ].includes(event.key)) {
                event.preventDefault();
            }
        };
        window.addEventListener('wheel', preventWheel, {
            passive: false,
            capture: true
        });
        window.addEventListener('touchmove', preventTouchMove, {
            passive: false,
            capture: true
        });
        window.addEventListener('keydown', preventScrollKeys, true);
        return () => {
            window.removeEventListener('wheel', preventWheel, true);
            window.removeEventListener('touchmove', preventTouchMove, true);
            window.removeEventListener('keydown', preventScrollKeys, true);
            document.body.style.overflow =
                previousBodyOverflow;
            document.body.style.overscrollBehavior =
                previousBodyOverscrollBehavior;
            document.documentElement.style.overscrollBehavior =
                previousHtmlOverscrollBehavior;
        };
    }, [isRunning]);
    useEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [updatePosition]);
    useEffect(() => {
        if (!targetElement ||
            typeof ResizeObserver ===
                'undefined') {
            return;
        }
        const observer = new ResizeObserver(() => {
            updatePosition();
        });
        observer.observe(targetElement);
        return () => {
            observer.disconnect();
        };
    }, [
        targetElement,
        updatePosition
    ]);
    useEffect(() => {
        if (!targetElement) {
            return;
        }
        const first = window.setTimeout(() => {
            updatePosition();
        }, 120);
        const second = window.setTimeout(() => {
            updatePosition();
        }, 420);
        return () => {
            window.clearTimeout(first);
            window.clearTimeout(second);
        };
    }, [
        targetElement,
        location.pathname,
        updatePosition
    ]);
    useEffect(() => {
        if (!targetElement ||
            !step ||
            step.action !== 'click') {
            return;
        }
        const handleClick = () => {
            window.setTimeout(() => {
                goNext();
            }, 0);
        };
        targetElement.addEventListener('click', handleClick);
        return () => {
            targetElement.removeEventListener('click', handleClick);
        };
    }, [targetElement, step, goNext]);
    useEffect(() => {
        if (!targetElement ||
            !step ||
            (step.action !== 'input' &&
                !step.validation)) {
            return;
        }
        const updateReady = () => {
            const ready = isStepTargetValid(
                step,
                targetElement
            );
            setTargetReady(ready);
            if (ready) {
                setActionError('');
            }
        };
        const handleValueChange = () => {
            window.setTimeout(
                updateReady,
                0
            );
        };
        const observer = step.validation === 'addons-valid' &&
            typeof MutationObserver !== 'undefined'
            ? new MutationObserver(updateReady)
            : null;
        if (observer) {
            observer.observe(
                targetElement,
                {
                    attributes: true,
                    attributeFilter: [
                        'data-tour-valid'
                    ]
                }
            );
        }
        targetElement.addEventListener('input', handleValueChange);
        targetElement.addEventListener('change', handleValueChange);
        updateReady();
        return () => {
            observer?.disconnect();
            targetElement.removeEventListener('input', handleValueChange);
            targetElement.removeEventListener('change', handleValueChange);
        };
    }, [targetElement, step]);
    useEffect(() => {
        if (!isRunning ||
            step?.stage !== 3) {
            return;
        }
        const submit = document.querySelector<HTMLElement>('[data-tour="service-submit"]');
        if (!submit) {
            return;
        }
        const previousPointerEvents = submit.style.pointerEvents;
        if (step.id !== 'service-submit') {
            submit.style.pointerEvents = 'none';
        }
        else {
            submit.style.pointerEvents = previousPointerEvents;
        }
        return () => {
            submit.style.pointerEvents = previousPointerEvents;
        };
    }, [isRunning, step?.id, step?.stage, targetElement]);
    useEffect(() => {
        handledEventStepRef.current =
            null;
    }, [
        step?.id
    ]);
    useEffect(() => {
        if (!step ||
            step.action !== 'event' ||
            !step.eventName) {
            return;
        }
        const handleEvent = () => {
            if (handledEventStepRef.current ===
                step.id) {
                return;
            }
            handledEventStepRef.current =
                step.id;
            goNext();
        };
        window.addEventListener(step.eventName, handleEvent);
        return () => {
            window.removeEventListener(step.eventName!, handleEvent);
        };
    }, [step, goNext]);
    useEffect(() => {
        if (!step?.errorEventName) {
            return;
        }
        const handleErrorEvent = (event: Event) => {
            if (event instanceof CustomEvent &&
                typeof event.detail?.message === 'string' &&
                event.detail.message.trim()) {
                setActionError(event.detail.message.trim());
                return;
            }
            setActionError('Не удалось выполнить действие. Проверьте введённые данные.');
        };
        window.addEventListener(step.errorEventName, handleErrorEvent);
        return () => {
            window.removeEventListener(step.errorEventName!, handleErrorEvent);
        };
    }, [step]);
    useEffect(() => {
        if (!step?.autoAdvanceEventName) {
            return;
        }
        const handleAutoAdvance = () => {
            if (handledEventStepRef.current ===
                step.id) {
                return;
            }
            handledEventStepRef.current =
                step.id;
            if (stepIndex >=
                steps.length - 1) {
                finishTour();
                return;
            }
            goNext();
        };
        window.addEventListener(step.autoAdvanceEventName, handleAutoAdvance);
        return () => {
            window.removeEventListener(step.autoAdvanceEventName!, handleAutoAdvance);
        };
    }, [
        step,
        stepIndex,
        goNext,
        finishTour
    ]);
    const handleNext = () => {
        if (!step) {
            return;
        }
        if ((step.action === 'input' &&
                !step.optional &&
                !targetReady) ||
            (step.validation &&
                !isStepTargetValid(
                    step,
                    targetElement
                ))) {
            setActionError(
                step.validationMessage ??
                    'Проверьте выделенное поле.'
            );
            setTargetReady(false);
            return;
        }
        if (stepIndex >=
            steps.length - 1) {
            finishTour();
            return;
        }
        goNext();
    };
    const handleBack = () => {
        if (stepIndex === 0 ||
            step?.id ===
                'business-name' ||
            step?.id ===
                'staff-open' ||
            step?.id ===
                'staff-first-name' ||
            step?.id ===
                'service-name' ||
            step?.id ===
                'schedule-specialist' ||
            step?.id ===
                'settings-recording-rules') {
            return;
        }
        clearTarget();
        setStepIndex(previous => previous - 1);
    };
    const handleClose = () => {
        setIsRunning(false);
        clearTarget();
    };
    const showNextButton = useMemo(() => step?.action === 'input' ||
        step?.action === 'manual', [step]);
    const nextButtonLabel = useMemo(() => {
        if (!step) {
            return 'Далее';
        }
        if (stepIndex ===
            steps.length - 1) {
            return 'Завершить';
        }
        if (step.optional &&
            step.action === 'input' &&
            targetElement &&
            !hasInputValue(targetElement)) {
            return 'Пропустить';
        }
        if (step.nextLabel) {
            return step.nextLabel;
        }
        return 'Далее';
    }, [
        step,
        stepIndex,
        targetElement,
        targetReady
    ]);
    if (!isRunning ||
        !step ||
        !rect) {
        return null;
    }
    const padding = 8;
    const spotlight = {
        top: Math.max(rect.top - padding, 0),
        left: Math.max(rect.left - padding, 0),
        width: rect.width +
            padding * 2,
        height: rect.height +
            padding * 2
    };
    const tooltipWidth = 360;
    const tooltipEstimatedHeight = step.hint
        ? 310
        : 270;
    const maxTooltipLeft = Math.max(16, window.innerWidth -
        tooltipWidth -
        16);
    const defaultTooltipLeft = Math.min(Math.max(spotlight.left, 16), maxTooltipLeft);
    const spaceBelow = window.innerHeight -
        (spotlight.top +
            spotlight.height);
    const showAbove = spaceBelow <
        tooltipEstimatedHeight + 15;
    let tooltipTop = showAbove
        ? Math.max(spotlight.top -
            tooltipEstimatedHeight -
            16, 16)
        : Math.min(spotlight.top +
            spotlight.height +
            16, Math.max(16, window.innerHeight -
            tooltipEstimatedHeight -
            16));
    let tooltipLeft = defaultTooltipLeft;
    if (step.tooltipPlacement ===
        'select') {
        const gap = 20;
        const rightLeft = spotlight.left +
            spotlight.width +
            gap;
        const leftLeft = spotlight.left -
            tooltipWidth -
            gap;
        if (rightLeft +
            tooltipWidth <=
            window.innerWidth - 16) {
            tooltipLeft =
                rightLeft;
            tooltipTop =
                Math.min(Math.max(spotlight.top, 16), Math.max(16, window.innerHeight -
                    tooltipEstimatedHeight -
                    16));
        }
        else if (leftLeft >= 16) {
            tooltipLeft =
                leftLeft;
            tooltipTop =
                Math.min(Math.max(spotlight.top, 16), Math.max(16, window.innerHeight -
                    tooltipEstimatedHeight -
                    16));
        }
        else {
            tooltipLeft =
                defaultTooltipLeft;
            tooltipTop =
                Math.max(16, window.innerHeight -
                    tooltipEstimatedHeight -
                    16);
        }
    }
    const overlayPointerClass = step.allowOutsideInteraction
        ? 'pointer-events-none'
        : 'pointer-events-auto';
    return createPortal(<>
            <div className={`fixed left-0 right-0 top-0 z-[9998] bg-black/65 ${overlayPointerClass}`} style={{
            height: spotlight.top
        }}/>

            <div className={`fixed bottom-0 left-0 right-0 z-[9998] bg-black/65 ${overlayPointerClass}`} style={{
            top: spotlight.top +
                spotlight.height
        }}/>

            <div className={`fixed left-0 z-[9998] bg-black/65 ${overlayPointerClass}`} style={{
            top: spotlight.top,
            width: spotlight.left,
            height: spotlight.height
        }}/>

            <div className={`fixed right-0 z-[9998] bg-black/65 ${overlayPointerClass}`} style={{
            top: spotlight.top,
            left: spotlight.left +
                spotlight.width,
            height: spotlight.height
        }}/>

            <div className="pointer-events-none fixed z-[9999] rounded-xl border-2 border-[#818CF8] shadow-[0_0_0_4px_rgba(99,102,241,0.18),0_0_28px_rgba(99,102,241,0.7)]" style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height
        }}>
                <span className="absolute -right-2 -top-2 h-4 w-4 animate-ping rounded-full bg-[#6366F1]"/>
                <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-[#6366F1]"/>
            </div>

            <div className="fixed z-[10000] w-[360px] max-w-[calc(100vw-32px)] rounded-2xl border border-[#D9DDEC] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)]" style={{
            top: tooltipTop,
            left: tooltipLeft
        }}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6366F1]">
                            Этап {step.stage} · {step.stageTitle}
                            {stageStepIndex >= 0 &&
            stageSteps.length > 1
            ? ` · ${stageStepIndex + 1}/${stageSteps.length}`
            : ''}
                        </div>

                        <h3 className="mt-1 text-[17px] font-bold text-[#101828]">
                            {step.title}
                        </h3>
                    </div>

                    <button type="button" onClick={handleClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#344054]">
                        <X size={17}/>
                    </button>
                </div>

                <p className="mt-3 text-[13px] leading-5 text-[#667085]">
                    {step.description}
                </p>

                {step.hint && (<div className="mt-4 rounded-xl border border-[#D9DDEC] bg-[#F8F9FF] px-3 py-2.5 text-[12px] leading-5 text-[#475467]">
                        <span className="font-semibold text-[#344054]">Можно изменить позже. </span>
                        {step.hint}
                    </div>)}

                {step.action === 'click' && (<div className="mt-4 rounded-xl bg-[#EEF2FF] px-3 py-2.5 text-[12px] font-medium text-[#4338CA]">
                        Нажмите на выделенный элемент
                    </div>)}

                {step.action === 'event' && (<div className="mt-4 rounded-xl bg-[#EEF2FF] px-3 py-2.5 text-[12px] font-medium text-[#4338CA]">
                        {step.waitingText ??
                'Ожидаем успешное завершение действия'}
                    </div>)}

                {step.action === 'input' && !step.optional && !targetReady && !step.validation && (<div className="mt-4 rounded-xl bg-[#FFF7ED] px-3 py-2.5 text-[12px] font-medium text-[#C2410C]">
                        Сначала заполните выделенное поле
                    </div>)}

                {step.validation && !targetReady && !actionError && (<div className="mt-4 rounded-xl bg-[#FFF7ED] px-3 py-2.5 text-[12px] font-medium text-[#C2410C]">
                        {step.validationMessage ?? 'Проверьте выделенное поле'}
                    </div>)}

                {actionError && (<div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-medium leading-5 text-red-700">
                        {actionError}
                    </div>)}

                <div className="mt-5 flex items-center justify-between gap-3">
                    <button type="button" onClick={handleBack} disabled={stepIndex === 0 ||
            step.id ===
                'business-name' ||
            step.id ===
                'staff-open' ||
            step.id ===
                'staff-first-name' ||
            step.id ===
                'service-name' ||
            step.id ===
                'schedule-specialist' ||
            step.id ===
                'settings-recording-rules'} className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-[12px] font-semibold text-[#667085] transition hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-30">
                        <ChevronLeft size={15}/>
                        Назад
                    </button>

                    {showNextButton && (<button type="button" onClick={handleNext} disabled={(step.action === 'input' &&
                !step.optional &&
                !targetReady) ||
                Boolean(step.validation && !targetReady)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 text-[12px] font-semibold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-40">
                            {nextButtonLabel}

                            {stepIndex < steps.length - 1 && (<ChevronRight size={15}/>)}
                        </button>)}
                </div>

                <div className="mt-4 flex gap-1.5">
                    {steps.map((item, index) => (<div key={item.id} className={`h-1.5 flex-1 rounded-full ${index <= stepIndex
                ? 'bg-[#6366F1]'
                : 'bg-[#EAECF0]'}`}/>))}
                </div>
            </div>
        </>, document.body);
}

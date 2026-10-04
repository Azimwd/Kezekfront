import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type TourScope = "all" | "business" | "services";
type TourAction = "click" | "input" | "manual" | "event";
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
  errorEventName?: string;
  waitingText?: string;
  nextLabel?: string;
  allowOutsideInteraction?: boolean;
  hint?: string;
  tooltipPlacement?: "auto" | "select";
  validation?:
    | "positive-number"
    | "positive-integer"
    | "nonnegative-number"
    | "addons-valid"
    | "dataset-valid";
  validationMessage?: string;
  skipIfMissing?: boolean;
  formStep?: boolean;
  noBack?: boolean;
}
interface RectState {
  top: number;
  left: number;
  width: number;
  height: number;
}
const TOUR_STORAGE_KEY = "kezek_business_owner_tour_completed";
const allSteps: TourStep[] = [
  {
    id: "business-open",
    stage: 1,
    stageTitle: "Бизнес",
    route: "/crm/my-businesses",
    target: '[data-tour="create-business"]',
    title: "Создайте первый бизнес",
    description: "Нажмите на выделенную кнопку «Создать бизнес».",
    action: "event",
    hint: "Все данные бизнеса можно будет изменить позже в разделе «Мои бизнесы». Сейчас достаточно заполнить основные настройки.",
    eventName: "kezek:business-modal-opened",
    waitingText: "Откройте форму создания бизнеса",
    noBack: true,
  },
  {
    id: "business-name",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-name"]',
    title: "Название бизнеса",
    description: "Введите название, которое будут видеть ваши клиенты.",
    action: "input",
    formStep: true,
    noBack: true,
  },
  {
    id: "business-description",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-description"]',
    title: "Описание бизнеса",
    description:
      "Кратко расскажите клиентам о вашем бизнесе, услугах и преимуществах.",
    action: "input",
    optional: true,
    formStep: true,
  },
  {
    id: "business-type",
    formStep: true,
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-type"]',
    title: "Тип заведения",
    description:
      "Выберите, как называется ваше заведение: салон, барбершоп, студия или другой тип. Тип заведения описывает бизнес, а направления ниже определяют его услуги.",
    action: "manual",
    tooltipPlacement: "select",
  },
  {
    id: "business-categories",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-categories"]',
    title: "Направления услуг",
    description:
      "Отметьте хотя бы одно направление. Можно выбрать несколько: например, маникюр и педикюр. Отметка всего раздела включает его категории; для выбора отдельных категорий снимите отметку с названия раздела. По выбранным направлениям появятся шаблоны услуг.",
    action: "manual",
    validation: "dataset-valid",
    validationMessage: "Выберите хотя бы одно направление услуг.",
    allowOutsideInteraction: true,
    formStep: true,
    tooltipPlacement: "select",
  },
  {
    id: "business-phone",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-phone"]',
    title: "Телефон",
    description:
      "Укажите номер телефона, по которому клиенты смогут связаться с бизнесом.",
    action: "input",
    formStep: true,
  },
  {
    id: "business-email",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-email"]',
    title: "Email",
    description: "Укажите рабочий Email. Это поле необязательное.",
    action: "input",
    optional: true,
    formStep: true,
  },
  {
    id: "business-city",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-city"]',
    title: "Город",
    description:
      "Проверьте выбранный город. Если нужно, откройте список и выберите другой.",
    action: "manual",
    allowOutsideInteraction: true,
    tooltipPlacement: "select",
    formStep: true,
  },
  {
    id: "business-address",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-address"]',
    title: "Адрес",
    description:
      "Введите точный адрес бизнеса: улицу, дом и при необходимости офис.",
    action: "input",
    formStep: true,
  },
  {
    id: "business-logo",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-logo"]',
    title: "Логотип бизнеса",
    description:
      "Добавьте логотип или фотографию бизнеса. Этот шаг можно пропустить.",
    action: "manual",
    optional: true,
    allowOutsideInteraction: true,
    formStep: true,
  },
  {
    id: "business-status",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-status"]',
    title: "Статус публикации",
    description:
      "«Активен» делает бизнес доступным клиентам, «Черновик» оставляет его скрытым.",
    action: "manual",
    formStep: true,
  },
  {
    id: "business-submit",
    stage: 1,
    stageTitle: "Бизнес",
    target: '[data-tour="business-submit"]',
    title: "Создайте бизнес",
    description:
      "Проверьте данные и нажмите «Создать бизнес». После успешного сохранения он станет выбранным бизнесом. При ошибке исправьте данные в форме и повторите отправку.",
    action: "event",
    eventName: "kezek:business-created",
    waitingText: "Ожидаем успешное создание бизнеса",
    formStep: true,
    errorEventName: "kezek:business-create-error",
    allowOutsideInteraction: true,
  },
  {
    id: "staff-open",
    stage: 2,
    stageTitle: "Мастер",
    route: "/crm/staff",
    target: '[data-tour="create-staff"]',
    title: "Добавьте первого мастера",
    description:
      "Бизнес готов. Теперь добавьте сотрудника, который будет выполнять услуги.",
    action: "click",
    hint: "Данные мастера, фотографию, должность и статус можно будет изменить позже в разделе «Сотрудники».",
    noBack: true,
  },
  {
    id: "staff-first-name",
    stage: 2,
    stageTitle: "Мастер",
    route: "/crm/staff/add",
    target: '[data-tour="staff-first-name"]',
    title: "Имя мастера",
    description: "Введите имя сотрудника. Это обязательное поле.",
    action: "input",
    noBack: true,
  },
  {
    id: "staff-last-name",
    stage: 2,
    stageTitle: "Мастер",
    target: '[data-tour="staff-last-name"]',
    title: "Фамилия",
    description:
      "Укажите фамилию сотрудника. Если не хотите, этот шаг можно пропустить.",
    action: "input",
    optional: true,
  },
  {
    id: "staff-position",
    stage: 2,
    stageTitle: "Мастер",
    target: '[data-tour="staff-position"]',
    title: "Должность",
    description:
      "Укажите должность или специализацию мастера, например «Старший барбер».",
    action: "input",
  },
  {
    id: "staff-description",
    stage: 2,
    stageTitle: "Мастер",
    target: '[data-tour="staff-description"]',
    title: "Описание специализации",
    description:
      "Кратко опишите опыт и навыки сотрудника. Этот шаг можно пропустить.",
    action: "input",
    optional: true,
  },
  {
    id: "staff-photo",
    stage: 2,
    stageTitle: "Мастер",
    target: '[data-tour="staff-photo"]',
    title: "Фотография мастера",
    description:
      "Добавьте фотографию сотрудника, чтобы клиентам было проще выбрать мастера. Этот шаг можно пропустить.",
    action: "manual",
    optional: true,
    allowOutsideInteraction: true,
  },
  {
    id: "staff-active",
    stage: 2,
    stageTitle: "Мастер",
    target: '[data-tour="staff-active"]',
    title: "Статус мастера",
    description:
      "Активный мастер доступен для работы и записи клиентов. При необходимости статус можно изменить.",
    action: "manual",
  },
  {
    id: "staff-submit",
    stage: 2,
    stageTitle: "Мастер",
    target: '[data-tour="staff-submit"]',
    title: "Сохраните мастера",
    description:
      "Нажмите «Сохранить». Следующий этап откроется только после успешного ответа сервера.",
    action: "event",
    eventName: "kezek:staff-created",
    waitingText: "Ожидаем успешное добавление мастера",
  },
  {
    id: "service-library-intro",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-library"]',
    title: "Библиотека услуг",
    description:
      "Здесь собраны шаблоны по направлениям выбранного бизнеса и ваши собственные услуги. Шаблон становится услугой бизнеса после настройки цены, времени и мастеров.",
    action: "manual",
    route: "/crm/services",
    noBack: true,
    validation: "dataset-valid",
    validationMessage:
      "Выберите бизнес в шапке и дождитесь загрузки библиотеки. При ошибке нажмите «Повторить».",
    allowOutsideInteraction: true,
  },
  {
    id: "service-directions",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-directions"]',
    title: "Направления бизнеса",
    description:
      "Направления определяют, какие шаблоны доступны. Кнопка «Настроить направления» позволяет изменить выбор. Сохранение направлений не удаляет ранее созданные услуги.",
    action: "manual",
    allowOutsideInteraction: true,
  },
  {
    id: "service-search",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-search"]',
    title: "Поиск по библиотеке",
    description:
      "Ищите услугу по названию или ключевому слову. Поиск работает вместе с фильтрами. Очистите поле, чтобы снова увидеть все подходящие услуги.",
    action: "manual",
    allowOutsideInteraction: true,
  },
  {
    id: "service-category-filter",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-category-filter"]',
    title: "Фильтр категорий",
    description:
      "Выберите категорию, чтобы сузить список. «Все категории» возвращает полный список по направлениям бизнеса.",
    action: "manual",
    tooltipPlacement: "select",
    allowOutsideInteraction: true,
  },
  {
    id: "service-status-filter",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-status-filter"]',
    title: "Включённые и выключенные",
    description:
      "Фильтр показывает включённые услуги, выключенные или все сразу. Новый шаблон относится к выключенным, пока вы не настроите его.",
    action: "manual",
    tooltipPlacement: "select",
    allowOutsideInteraction: true,
  },
  {
    id: "service-open",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-library-choices"]',
    title: "Выберите первую услугу",
    description:
      "Включите подходящий шаблон переключателем — откроется форма услуги. Для нишевой услуги нажмите «Создать услугу» в шапке. Можно также включить уже настроенную услугу: тогда перейдём к управлению библиотекой.",
    action: "event",
    eventName: "kezek:service-panel-opened",
    errorEventName: "kezek:service-library-error",
    waitingText: "Откройте шаблон или форму своей услуги",
    allowOutsideInteraction: true,
  },
  {
    id: "service-existing",
    noBack: true,
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-existing"]',
    title: "Связать уже созданную услугу",
    description:
      "Если у вас есть своя услуга с таким названием, можно явно выбрать её здесь. Форма загрузит её цену, время, мастеров и дополнения. Оставьте «Создать отдельную услугу», если нужна новая запись.",
    action: "manual",
    formStep: true,
    skipIfMissing: true,
  },
  {
    id: "service-name",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-name"]',
    title: "Название услуги",
    description:
      "Введите понятное название своей услуги. У шаблона название уже заполнено — проверьте его и при необходимости измените.",
    action: "input",
    formStep: true,
    noBack: true,
  },
  {
    id: "service-category",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-category"]',
    title: "Категория услуги",
    description:
      "У шаблона категория задана библиотекой и закреплена. При ручном создании можно выбрать категорию самостоятельно или оставить услугу без категории.",
    action: "manual",
    formStep: true,
    allowOutsideInteraction: true,
    tooltipPlacement: "select",
  },
  {
    id: "service-description",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-description"]',
    title: "Описание услуги",
    description:
      "Опишите, что входит в услугу. У шаблона описание может быть заполнено; его можно уточнить. Этот шаг необязательный.",
    action: "input",
    optional: true,
    formStep: true,
  },
  {
    id: "service-price",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-price"]',
    title: "Цена основной услуги",
    description:
      "Укажите стоимость в тенге. Можно поставить 0 ₸, если основная услуга бесплатная. Дополнения имеют собственную цену.",
    action: "input",
    validation: "nonnegative-number",
    validationMessage: "Введите цену от 0 ₸. Пустое поле нужно заполнить.",
    formStep: true,
  },
  {
    id: "service-duration",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-duration"]',
    title: "Длительность",
    description:
      "Укажите целое число минут больше нуля. По нему рассчитывается свободное время для записи. Рекомендованную длительность шаблона можно изменить.",
    action: "input",
    validation: "positive-integer",
    validationMessage: "Введите целое число минут больше 0.",
    formStep: true,
  },
  {
    id: "service-buffers",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-buffers"]',
    title: "Время до и после услуги",
    description:
      "Буферы резервируют время на подготовку и уборку. Если оно не нужно, оставьте 0. Время дополнений тоже учитывается при записи.",
    action: "manual",
    optional: true,
    formStep: true,
  },
  {
    id: "service-addons",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-addons"]',
    title: "Дополнительные услуги",
    description:
      "При необходимости добавьте опции: например, снятие покрытия или уход. Для каждой нужны уникальное название и цена от 0 ₸; дополнительное время может быть 0. Незавершённую опцию заполните или удалите.",
    action: "manual",
    optional: true,
    validation: "dataset-valid",
    validationMessage:
      "Проверьте название, цену и время каждого дополнения. Удалите незаполненные опции, если они не нужны.",
    allowOutsideInteraction: true,
    formStep: true,
  },
  {
    id: "service-active",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-active"]',
    title: "Доступность услуги",
    description:
      "Настройка шаблона или включение существующей услуги сохраняют её активной. При ручном создании можно оставить её выключенной как черновик. Позже статус меняется переключателем в библиотеке.",
    action: "manual",
    formStep: true,
  },
  {
    id: "service-staff",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-staff"]',
    title: "Мастера услуги",
    description:
      "Назначьте хотя бы одного доступного мастера для активной услуги. Уже назначенные мастера учитываются. Выключенный ручной черновик можно сохранить без мастеров.",
    action: "manual",
    validation: "dataset-valid",
    validationMessage:
      "Для активной услуги выберите хотя бы одного мастера. Если мастеров нет, добавьте активного сотрудника в разделе «Персонал».",
    formStep: true,
    allowOutsideInteraction: true,
  },
  {
    id: "service-submit",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-submit"]',
    title: "Сохраните услугу",
    description:
      "Нажмите «Сохранить и включить» для шаблона или существующей услуги, «Создать» — при ручном создании. Продолжим после успешного сохранения. Если не сохранилось дополнение, исправьте ошибку и повторите: основная услуга уже сохранена.",
    action: "event",
    eventName: "kezek:service-created",
    errorEventName: "kezek:service-create-error",
    waitingText: "Ожидаем успешное сохранение услуги и дополнений",
    allowOutsideInteraction: true,
    formStep: true,
  },
  {
    id: "service-management",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-library-choices"]',
    title: "Управление услугами",
    description:
      "Переключатель выключает и включает настроенную услугу. Если доступных назначенных мастеров нет, при включении снова откроется форма услуги. Выключение сохраняет настройки.",
    action: "manual",
    route: "/crm/services",
    noBack: true,
  },
  {
    id: "service-editing",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-library-choices"]',
    title: "Редактирование и удаление",
    description:
      "У созданных услуг есть кнопки редактирования и удаления. Если по услуге были записи, удаление выключит её и сохранит историю. Шаблон остаётся в библиотеке. В этом шаге достаточно прочитать подсказку.",
    action: "manual",
  },
  {
    id: "service-manual-create",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="create-service"], [data-tour="service-library"]',
    title: "Свои услуги",
    description:
      "Кнопка «Создать услугу» в шапке доступна для любых нишевых услуг. Используется та же форма настройки, а созданная услуга появляется в библиотеке с отметкой «Своя услуга». Сейчас создавать вторую услугу не требуется.",
    action: "manual",
  },
  {
    id: "service-pagination",
    stage: 3,
    stageTitle: "Услуги",
    target: '[data-tour="service-pagination"]',
    title: "Страницы библиотеки",
    description:
      "Кнопки «Назад» и «Далее» листают результаты поиска и фильтров. После смены фильтра список начинается с первой страницы. Базовая настройка услуг готова.",
    action: "manual",
  },
  {
    id: "schedule-specialist",
    stage: 4,
    stageTitle: "Расписание",
    route: "/crm/schedule",
    target: '[data-tour="schedule-specialist"]',
    title: "Выберите мастера",
    description:
      "Проверьте, для какого мастера настраивается график. При необходимости выберите другого специалиста.",
    action: "manual",
    allowOutsideInteraction: true,
    tooltipPlacement: "select",
    hint: "График каждого мастера настраивается отдельно. Его можно изменить в любое время в разделе «График работы».",
    noBack: true,
  },
  {
    id: "schedule-day",
    stage: 4,
    stageTitle: "Расписание",
    target: '[data-tour="schedule-day"]',
    title: "Откройте настройку дня",
    description:
      "Нажмите на выделенный день недели, чтобы открыть его рабочие настройки.",
    action: "click",
  },
  {
    id: "schedule-work-settings",
    stage: 4,
    stageTitle: "Расписание",
    target: '[data-tour="schedule-work-settings"]',
    title: "Настройте рабочее время",
    description:
      "Укажите, является ли день рабочим, и при необходимости измените начало и конец рабочего дня.",
    action: "manual",
    allowOutsideInteraction: true,
    hint: "Здесь же можно настроить перерыв и индивидуальный выходной. Мы не будем проходить каждый дополнительный параметр отдельно.",
  },
  {
    id: "schedule-save",
    stage: 4,
    stageTitle: "Расписание",
    target: '[data-tour="schedule-save"]',
    title: "Сохраните график",
    description:
      "Нажмите «Сохранить». Следующий этап откроется только после успешного сохранения графика на сервере.",
    action: "event",
    eventName: "kezek:schedule-saved",
    waitingText: "Ожидаем успешное сохранение графика",
  },
  {
    id: "settings-recording-rules",
    stage: 5,
    stageTitle: "Настройки записи",
    route: "/crm/settings",
    target: '[data-tour="settings-recording-rules"]',
    title: "Правила онлайн-записи",
    description:
      "Здесь задаются шаг свободных слотов, минимальное время до записи и максимальный период записи вперёд. Проверьте значения и при необходимости измените их.",
    action: "manual",
    hint: "Не нужно настраивать каждый параметр сейчас. Все правила можно изменить позже в разделе «Настройки».",
    noBack: true,
  },
  {
    id: "settings-confirmation",
    stage: 5,
    stageTitle: "Настройки записи",
    target: '[data-tour="settings-confirmation"]',
    title: "Подтверждение записей",
    description:
      "Выберите, будут ли новые записи подтверждаться автоматически или требовать ручного подтверждения.",
    action: "manual",
  },
  {
    id: "settings-prepayment",
    stage: 5,
    stageTitle: "Настройки записи",
    target: '[data-tour="settings-prepayment"]',
    title: "Предоплата",
    description:
      "Предоплату можно оставить выключенной. Если включите её, укажите процент предоплаты и ссылку Kaspi для клиента.",
    action: "manual",
    optional: true,
    hint: "Предоплата необязательна. Её можно включить позже, когда будете готовы принимать оплату перед записью.",
  },
  {
    id: "settings-cancellation",
    stage: 5,
    stageTitle: "Настройки записи",
    target: '[data-tour="settings-cancellation"]',
    title: "Отмена записи клиентом",
    description:
      "Решите, сможет ли клиент самостоятельно отменять запись, и при необходимости задайте минимальное время до визита для отмены.",
    action: "manual",
  },
  {
    id: "settings-save",
    stage: 5,
    stageTitle: "Настройки записи",
    target: '[data-tour="settings-save"]',
    title: "Настройки готовы",
    description:
      "Если вы изменили параметры, нажмите «Сохранить настройки». Если текущие значения вас устраивают и кнопка неактивна, нажмите «Настройки готовы» в подсказке.",
    action: "manual",
    nextLabel: "Настройки готовы",
    autoAdvanceEventName: "kezek:settings-saved",
    hint: "Любой из этих параметров можно изменить позже. Туториал не будет отдельно показывать процесс редактирования.",
  },
  {
    id: "appointments-overview",
    stage: 6,
    stageTitle: "Записи",
    route: "/crm/appointments",
    target: '[data-tour="appointments-header"]',
    title: "Раздел записей",
    description:
      "Здесь вы будете работать со всеми записями клиентов. Записи появляются автоматически после бронирования через Kezek. Если сейчас список пуст — это нормально.",
    action: "manual",
    noBack: true,
  },
  {
    id: "appointments-list",
    stage: 6,
    stageTitle: "Записи",
    target: '[data-tour="appointments-list"]',
    title: "Список и управление записями",
    description:
      "Здесь находятся поиск, фильтры и список записей. Когда появится первая запись, вы сможете открыть её, подтвердить, завершить, перенести или отменить. Сейчас создавать тестовую запись специально не нужно.",
    action: "manual",
  },
  {
    id: "appointments-stats",
    stage: 6,
    stageTitle: "Записи",
    target: '[data-tour="appointments-stats"]',
    title: "Статистика записей",
    description:
      "Этот блок помогает быстро оценивать загрузку и состояние записей. Показатели начнут заполняться автоматически по мере работы с клиентами.",
    action: "manual",
    nextLabel: "Завершить обучение",
  },
];
const scopeSteps = (scope: TourScope) =>
  allSteps.filter(
    (step) => scope === "all" || step.stage === (scope === "business" ? 1 : 3),
  );
const visibleElement = (selector: string): HTMLElement | null => {
  return (
    Array.from(document.querySelectorAll<HTMLElement>(selector)).find(
      (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      },
    ) ?? null
  );
};
const valueElement = (element: HTMLElement | null) => {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  )
    return element;
  return (
    element?.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select") ?? null
  );
};
const isValid = (step: TourStep, element: HTMLElement | null) => {
  if (!element) return false;
  if (step.validation === "dataset-valid")
    return element.dataset.tourValid === "true";
  if (step.validation === "addons-valid")
    return element.dataset.tourValid !== "false";
  const input = valueElement(element);
  if (
    step.validation === "positive-number" ||
    step.validation === "positive-integer" ||
    step.validation === "nonnegative-number"
  ) {
    const text = input?.value.trim().replace(",", ".") ?? "";
    if (!text) return false;
    const number = Number(text);
    if (!Number.isFinite(number)) return false;
    if (step.validation === "nonnegative-number") return number >= 0;
    return (
      number > 0 &&
      (step.validation !== "positive-integer" || Number.isInteger(number))
    );
  }
  if (step.action === "input" && !step.optional) return !!input?.value.trim();
  return true;
};
const tourWasCompleted = () => {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export default function CrmTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRunning, setIsRunning] = useState(() => !tourWasCompleted());
  const [scope, setScope] = useState<TourScope>("all");
  const [stepIndex, setStepIndex] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<RectState | null>(null);
  const [ready, setReady] = useState(false);
  const [waitingTooLong, setWaitingTooLong] = useState(false);
  const [retry, setRetry] = useState(0);
  const [actionError, setActionError] = useState("");
  const [serviceMode, setServiceMode] = useState<
    "template" | "manual" | "existing"
  >("manual");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(290);
  const [collapsed, setCollapsed] = useState(false);
  const steps = useMemo(() => scopeSteps(scope), [scope]);
  const step = steps[stepIndex];
  const handledEventRef = useRef(false);
  const clearTarget = useCallback(() => {
    setTarget(null);
    setRect(null);
    setReady(false);
    setActionError("");
    setWaitingTooLong(false);
  }, []);
  const stopTour = useCallback(() => {
    if (scope === "all") {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      } catch {
        /* Private storage can be disabled. */
      }
    }
    setIsRunning(false);
    clearTarget();
  }, [scope, clearTarget]);
  const goNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      stopTour();
      return;
    }
    clearTarget();
    setStepIndex((index) => index + 1);
  }, [stepIndex, steps.length, clearTarget, stopTour]);
  const goTo = useCallback(
    (id: string) => {
      const index = steps.findIndex((item) => item.id === id);
      if (index < 0) return;
      clearTarget();
      setStepIndex(index);
    },
    [steps, clearTarget],
  );
  const startTour = useCallback(
    (nextScope: TourScope) => {
      const nextSteps = scopeSteps(nextScope);
      // Restarting help while a form is already open keeps its unsaved values.
      const openForm =
        nextScope !== "services" &&
        visibleElement('[data-tour="business-name"]')
          ? "business-name"
          : nextScope === "services" &&
              visibleElement('[data-tour="service-name"]')
            ? "service-name"
            : null;
      clearTarget();
      setScope(nextScope);
      setStepIndex(
        openForm ? nextSteps.findIndex((item) => item.id === openForm) : 0,
      );
      setIsRunning(true);
    },
    [clearTarget],
  );
  useEffect(() => {
    const all = () => startTour("all"),
      business = () => startTour("business"),
      services = () => startTour("services");
    window.addEventListener("kezek:tour:restart", all);
    window.addEventListener("kezek:tour:business", business);
    window.addEventListener("kezek:tour:services", services);
    return () => {
      window.removeEventListener("kezek:tour:restart", all);
      window.removeEventListener("kezek:tour:business", business);
      window.removeEventListener("kezek:tour:services", services);
    };
  }, [startTour]);
  useEffect(() => {
    if (!isRunning || !step) return;
    const businessClosed = () => {
      if (step.stage === 1 && step.id !== "business-open")
        goTo("business-open");
    };
    const staffCancelled = () => {
      if (step.stage === 2) goTo("staff-open");
    };
    const serviceClosed = () => {
      if (step.stage === 3 && step.formStep) goTo("service-open");
    };
    const scheduleClosed = () => {
      if (
        step.stage === 4 &&
        !["schedule-specialist", "schedule-day"].includes(step.id)
      )
        goTo("schedule-day");
    };
    const enabled = () => {
      if (step.id === "service-open") goTo("service-management");
    };
    window.addEventListener("kezek:business-modal-closed", businessClosed);
    window.addEventListener("kezek:staff-add-cancelled", staffCancelled);
    window.addEventListener("kezek:service-panel-closed", serviceClosed);
    window.addEventListener("kezek:schedule-panel-closed", scheduleClosed);
    window.addEventListener("kezek:service-enabled", enabled);
    return () => {
      window.removeEventListener("kezek:business-modal-closed", businessClosed);
      window.removeEventListener("kezek:staff-add-cancelled", staffCancelled);
      window.removeEventListener("kezek:service-panel-closed", serviceClosed);
      window.removeEventListener("kezek:schedule-panel-closed", scheduleClosed);
      window.removeEventListener("kezek:service-enabled", enabled);
    };
  }, [isRunning, step, goTo]);
  useEffect(() => {
    handledEventRef.current = false;
    setCollapsed(false);
    setActionError("");
  }, [step?.id, scope, isRunning]);
  useEffect(() => {
    if (!isRunning || !step) return;
    const eventName =
      step.action === "event" ? step.eventName : step.autoAdvanceEventName;
    if (!eventName) return;
    const success = (event: Event) => {
      if (handledEventRef.current) return;
      handledEventRef.current = true;
      if (
        eventName === "kezek:service-panel-opened" &&
        event instanceof CustomEvent
      )
        setServiceMode(
          event.detail?.mode === "template"
            ? "template"
            : event.detail?.mode === "existing"
              ? "existing"
              : "manual",
        );
      goNext();
    };
    window.addEventListener(eventName, success);
    return () => window.removeEventListener(eventName, success);
  }, [isRunning, step, goNext]);
  useEffect(() => {
    if (!isRunning || !step?.errorEventName) return;
    const error = (event: Event) =>
      setActionError(
        event instanceof CustomEvent &&
          typeof event.detail?.message === "string"
          ? event.detail.message
          : "Не удалось сохранить. Проверьте данные и повторите.",
      );
    window.addEventListener(step.errorEventName, error);
    return () => window.removeEventListener(step.errorEventName!, error);
  }, [isRunning, step]);
  useEffect(() => {
    if (!isRunning || !step) return;
    clearTarget();
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
      return;
    }
    const startedAt = Date.now();
    let lastElement: HTMLElement | null = null;
    let skipped = false;
    const sync = () => {
      const element = visibleElement(step.target);
      if (!element) {
        setTarget(null);
        setRect(null);
        setReady(false);
        if (step.skipIfMissing && !skipped && Date.now() - startedAt > 400) {
          skipped = true;
          goNext();
        } else if (Date.now() - startedAt > 10000) setWaitingTooLong(true);
        return;
      }
      if (lastElement !== element) {
        lastElement = element;
        element.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "nearest",
        });
        setTarget(element);
      }
      setWaitingTooLong(false);
      setReady(isValid(step, element));
      const box = element.getBoundingClientRect();
      setRect((previous) =>
        previous &&
        previous.top === box.top &&
        previous.left === box.left &&
        previous.width === box.width &&
        previous.height === box.height
          ? previous
          : {
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
            },
      );
    };
    const interval = window.setInterval(sync, 120);
    const edit = () => setActionError("");
    document.addEventListener("input", edit);
    sync();
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("input", edit);
    };
  }, [
    isRunning,
    step,
    location.pathname,
    navigate,
    retry,
    clearTarget,
    goNext,
  ]);
  useEffect(() => {
    if (!isRunning || !step || !target || step.action !== "click") return;
    let timer: number | undefined;
    const click = (event: Event) => {
      if (
        (event.target as HTMLElement)?.closest(
          "button:disabled, input:disabled",
        )
      )
        return;
      timer = window.setTimeout(goNext, 0);
    };
    target.addEventListener("click", click);
    return () => {
      target.removeEventListener("click", click);
      window.clearTimeout(timer);
    };
  }, [isRunning, step, target, goNext]);
  useEffect(() => {
    if (!isRunning) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isRunning]);
  // Keep form saving on its dedicated step, even when a menu or file picker needs outside interaction.
  useEffect(() => {
    if (!isRunning || !step?.formStep) return;
    const selector =
      step.stage === 1
        ? '[data-tour="business-submit"]'
        : step.stage === 3
          ? '[data-tour="service-submit"]'
          : null;
    if (!selector || step.id.endsWith("-submit")) return;
    const block = (event: Event) => {
      const element = event.target;
      if (element instanceof Element && element.closest(selector)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const blockSubmit = (event: Event) => {
      if (
        event.target instanceof HTMLFormElement &&
        event.target.querySelector(selector)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    document.addEventListener("click", block, true);
    document.addEventListener("submit", blockSubmit, true);
    return () => {
      document.removeEventListener("click", block, true);
      document.removeEventListener("submit", blockSubmit, true);
    };
  }, [isRunning, step]);
  useEffect(() => {
    const element = tooltipRef.current;
    if (!isRunning || !element) return;
    const measure = () =>
      setTooltipHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isRunning, step?.id, rect !== null]);
  const next = () => {
    if (!step) return;
    if (!isValid(step, target)) {
      setActionError(step.validationMessage ?? "Заполните выделенное поле.");
      return;
    }
    goNext();
  };
  const back = () => {
    if (stepIndex > 0 && !step?.noBack) {
      clearTarget();
      setStepIndex((index) => index - 1);
    }
  };
  if (!isRunning || !step) return null;
  const stageSteps = steps.filter((item) => item.stage === step.stage);
  const stageIndex = stageSteps.findIndex((item) => item.id === step.id);
  const needsValidation =
    !!step.validation || (step.action === "input" && !step.optional);
  const showNext = step.action === "manual" || step.action === "input";
  const title =
    step.id === "service-submit"
      ? serviceMode === "manual"
        ? "Создайте свою услугу"
        : "Сохраните и включите услугу"
      : step.title;
  const width = Math.min(360, window.innerWidth - 32);
  const spotlight = rect
    ? {
        top: Math.max(0, rect.top - 8),
        left: Math.max(0, rect.left - 8),
        right: Math.min(window.innerWidth, rect.left + rect.width + 8),
        bottom: Math.min(window.innerHeight, rect.top + rect.height + 8),
      }
    : null;
  let left = Math.max(16, window.innerWidth - width - 16);
  let top = Math.max(16, window.innerHeight - tooltipHeight - 16);
  if (spotlight) {
    if (spotlight.right + width + 24 <= window.innerWidth) {
      left = spotlight.right + 16;
      top = spotlight.top;
    } else if (spotlight.left - width - 16 >= 16) {
      left = spotlight.left - width - 16;
      top = spotlight.top;
    } else {
      left = Math.min(
        Math.max(16, spotlight.left),
        window.innerWidth - width - 16,
      );
      top =
        window.innerHeight - spotlight.bottom >= tooltipHeight + 24
          ? spotlight.bottom + 16
          : spotlight.top - tooltipHeight - 16;
    }
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
  }
  const overlayClass = `fixed z-[9998] bg-black/65 ${step.allowOutsideInteraction || step.formStep ? "pointer-events-none" : "pointer-events-auto"}`;
  return createPortal(
    <>
      {spotlight && (
        <>
          <div
            className={overlayClass}
            style={{ top: 0, left: 0, right: 0, height: spotlight.top }}
          />
          <div
            className={overlayClass}
            style={{ top: spotlight.bottom, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className={overlayClass}
            style={{
              top: spotlight.top,
              left: 0,
              width: spotlight.left,
              height: Math.max(0, spotlight.bottom - spotlight.top),
            }}
          />
          <div
            className={overlayClass}
            style={{
              top: spotlight.top,
              left: spotlight.right,
              right: 0,
              height: Math.max(0, spotlight.bottom - spotlight.top),
            }}
          />
          <div
            className="pointer-events-none fixed z-[9999] rounded-xl border-2 border-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.18)]"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: Math.max(0, spotlight.right - spotlight.left),
              height: Math.max(0, spotlight.bottom - spotlight.top),
            }}
          />
        </>
      )}
      <div
        ref={tooltipRef}
        data-testid="crm-tour"
        data-tour-step={step.id}
        role="dialog"
        aria-label="Обучение CRM"
        aria-describedby={collapsed ? undefined : "crm-tour-description"}
        data-tour-scroll-allowed="true"
        className="fixed z-[10000] max-h-[calc(100dvh-32px)] overflow-y-auto rounded-2xl border border-[#D9DDEC] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)]"
        style={{ top, left, width }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
              Этап {step.stage} · {step.stageTitle} · {stageIndex + 1}/
              {stageSteps.length}
            </div>
            <h3 className="mt-1 text-[17px] font-bold text-slate-900">
              {title}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Закрыть обучение"
            onClick={stopTour}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={17} />
          </button>
        </div>
        {!collapsed && (
          <p
            id="crm-tour-description"
            className="mt-3 text-[13px] leading-5 text-slate-600"
          >
            {step.description}
          </p>
        )}
        {!collapsed && step.hint && (
          <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-slate-600">
            {step.hint}
          </p>
        )}
        {!rect && (
          <div
            role="status"
            className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800"
          >
            {waitingTooLong
              ? "Элемент шага пока недоступен. Дождитесь загрузки страницы, исправьте ошибку загрузки или повторите поиск элемента."
              : "Подготавливаем этот шаг…"}
            <button
              type="button"
              className="mt-2 block font-semibold underline"
              onClick={() => setRetry((value) => value + 1)}
            >
              Повторить поиск элемента
            </button>
          </div>
        )}
        {!collapsed && rect && step.action === "click" && (
          <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700">
            Нажмите на выделенный элемент
          </p>
        )}
        {!collapsed && rect && step.action === "event" && (
          <p
            role="status"
            className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700"
          >
            {step.waitingText ?? "Ожидаем успешное сохранение"}
          </p>
        )}
        {rect && needsValidation && !ready && !actionError && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            {step.validationMessage ?? "Сначала заполните выделенное поле"}
          </p>
        )}
        {actionError && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700"
          >
            {actionError}
          </p>
        )}
        <button
          type="button"
          aria-expanded={!collapsed}
          className="mt-3 text-xs font-medium text-indigo-600 underline"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? "Развернуть подсказку" : "Свернуть подсказку"}
        </button>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0 || step.noBack}
            className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft size={15} />
            Назад
          </button>
          {showNext && (
            <button
              type="button"
              onClick={next}
              disabled={!rect || (needsValidation && !ready)}
              className="inline-flex h-10 items-center gap-1 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {stepIndex === steps.length - 1
                ? "Завершить"
                : (step.nextLabel ??
                  (step.optional &&
                  step.action === "input" &&
                  !valueElement(target)?.value.trim()
                    ? "Пропустить"
                    : "Далее"))}
              <ChevronRight size={15} />
            </button>
          )}
        </div>
        <div className="mt-4 flex gap-1" aria-hidden="true">
          {stageSteps.map((item, index) => (
            <div
              key={item.id}
              className={`h-1.5 min-w-0 flex-1 rounded-full ${index <= stageIndex ? "bg-indigo-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
}

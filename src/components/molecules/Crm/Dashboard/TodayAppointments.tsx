import {
    Check,
    ExternalLink,
    Plus,
    X
} from 'lucide-react';

import {
    format
} from 'date-fns';

import {
    useNavigate
} from 'react-router-dom';

import {
    getAppointmentClientName,
    getAppointmentPhone,
    getAppointmentPrice,
    getAppointmentStaffName,
    type DashboardAppointment
} from '../../../../api/dashboard';


interface TodayAppointmentsProps {
    appointments: DashboardAppointment[];
    totalCount: number;
    isLoading: boolean;
    actionLoadingId: number | null;
    onConfirm: (
        appointmentId: number
    ) => void;
    onComplete: (
        appointmentId: number
    ) => void;
    onCancel: (
        appointmentId: number
    ) => void;
}


const getStatusConfig = (
    status: string
) => {
    switch (
        status
    ) {
        case 'pending':
            return {
                label: 'Ожидает',
                className:
                    'bg-[#FFF7ED] text-[#F79009]'
            };

        case 'confirmed':
            return {
                label: 'Подтверждена',
                className:
                    'bg-[#EFF8FF] text-[#2E90FA]'
            };

        case 'completed':
            return {
                label: 'Завершена',
                className:
                    'bg-[#ECFDF3] text-[#16A34A]'
            };

        case 'cancelled':
        case 'cancelled_by_client':
        case 'cancelled_by_business':
            return {
                label: 'Отменена',
                className:
                    'bg-[#FEF3F2] text-[#F04438]'
            };

        default:
            return {
                label: status,
                className:
                    'bg-[#F2F4F7] text-[#667085]'
            };
    }
};


const getClientInitials = (
    appointment: DashboardAppointment
) => {
    const firstName =
        appointment.client_first_name ??
        '';

    const lastName =
        appointment.client_last_name ??
        '';


    const initials =
        `${
            firstName.charAt(0)
        }${
            lastName.charAt(0)
        }`
            .trim()
            .toUpperCase();


    return initials || 'К';
};


export default function TodayAppointments({
    appointments,
    totalCount,
    isLoading,
    actionLoadingId,
    onConfirm,
    onComplete,
    onCancel
}: TodayAppointmentsProps) {
    const navigate =
        useNavigate();


    const completedCount =
        appointments.filter(
            appointment =>
                appointment.status ===
                'completed'
        ).length;


    const visibleAppointments =
        appointments
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        a.start_at
                    ).getTime() -
                    new Date(
                        b.start_at
                    ).getTime()
            )
            .slice(
                0,
                5
            );


    return (
        <div
            className="
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-[#D9DDEC]
                bg-white
                shadow-sm
            "
        >
            {/* HEADER */}

            <div
                className="
                    flex
                    min-w-0
                    flex-col
                    gap-3
                    px-4
                    py-4

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:gap-4
                    sm:px-6
                    sm:py-5
                "
            >
                <div
                    className="
                        min-w-0
                    "
                >
                    <h2
                        className="
                            text-[18px]
                            font-bold
                            leading-6
                            text-[#101828]

                            sm:text-[20px]
                        "
                    >
                        Записи на сегодня
                    </h2>


                    <p
                        className="
                            mt-1
                            text-[12px]
                            leading-5
                            text-[#98A2B3]

                            sm:text-[13px]
                        "
                    >
                        {totalCount} записей, {completedCount} завершено
                    </p>
                </div>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/crm/appointments/create'
                        )
                    }
                    className="
                        inline-flex
                        h-[44px]
                        w-full
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#4F46E5]
                        px-5
                        text-[13px]
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#4338CA]

                        sm:w-auto
                        sm:shrink-0
                    "
                >
                    <Plus
                        size={17}
                    />

                    Новая запись
                </button>
            </div>


            {/* CONTENT */}

            {isLoading ? (
                <div
                    className="
                        flex
                        min-h-[180px]
                        items-center
                        justify-center
                        border-t
                        border-[#EAECF0]
                        px-4
                        text-center
                        text-[13px]
                        text-[#98A2B3]

                        sm:min-h-[240px]
                        sm:text-[14px]
                    "
                >
                    Загрузка записей...
                </div>
            ) : visibleAppointments.length === 0 ? (
                <div
                    className="
                        flex
                        min-h-[180px]
                        flex-col
                        items-center
                        justify-center
                        border-t
                        border-[#EAECF0]
                        px-4
                        text-center

                        sm:min-h-[240px]
                        sm:px-6
                    "
                >
                    <div
                        className="
                            text-[14px]
                            font-medium
                            text-[#344054]

                            sm:text-[15px]
                        "
                    >
                        На сегодня записей нет
                    </div>


                    <div
                        className="
                            mt-1.5
                            text-[12px]
                            leading-5
                            text-[#98A2B3]

                            sm:text-[13px]
                        "
                    >
                        Новые записи появятся здесь автоматически.
                    </div>
                </div>
            ) : (
                <>
                    {/* MOBILE CARDS */}

                    <div
                        className="
                            divide-y
                            divide-[#EAECF0]
                            border-t
                            border-[#EAECF0]

                            md:hidden
                        "
                    >
                        {visibleAppointments.map(
                            appointment => {
                                const status =
                                    getStatusConfig(
                                        appointment.status
                                    );

                                const loading =
                                    actionLoadingId ===
                                    appointment.id;

                                const clientName =
                                    getAppointmentClientName(
                                        appointment
                                    );

                                const phone =
                                    getAppointmentPhone(
                                        appointment
                                    );

                                const staffName =
                                    getAppointmentStaffName(
                                        appointment
                                    );

                                const price =
                                    getAppointmentPrice(
                                        appointment
                                    );

                                const serviceName =
                                    appointment.service_name ??
                                    `Услуга #${appointment.service}`;


                                return (
                                    <div
                                        key={appointment.id}
                                        className="
                                            flex
                                            min-w-0
                                            flex-col
                                            gap-4
                                            p-4
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                items-start
                                                justify-between
                                                gap-3
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
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-2
                                                    "
                                                >
                                                    <span
                                                        className="
                                                            text-[17px]
                                                            font-bold
                                                            text-[#101828]
                                                        "
                                                    >
                                                        {
                                                            format(
                                                                new Date(
                                                                    appointment.start_at
                                                                ),
                                                                'HH:mm'
                                                            )
                                                        }
                                                    </span>


                                                    <span
                                                        className={`
                                                            inline-flex
                                                            whitespace-nowrap
                                                            rounded-md
                                                            px-2.5
                                                            py-1
                                                            text-[10px]
                                                            font-medium
                                                            ${status.className}
                                                        `}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </div>


                                                <div
                                                    className="
                                                        mt-2
                                                        break-words
                                                        text-[13px]
                                                        font-semibold
                                                        text-[#101828]
                                                    "
                                                >
                                                    {clientName}
                                                </div>


                                                <div
                                                    className="
                                                        mt-0.5
                                                        break-all
                                                        text-[11px]
                                                        text-[#98A2B3]
                                                    "
                                                >
                                                    {phone || 'Телефон не указан'}
                                                </div>
                                            </div>


                                            <div
                                                className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-[#EEF2FF]
                                                    text-[12px]
                                                    font-semibold
                                                    text-[#4F46E5]
                                                "
                                            >
                                                {
                                                    getClientInitials(
                                                        appointment
                                                    )
                                                }
                                            </div>
                                        </div>


                                        <div
                                            className="
                                                grid
                                                min-w-0
                                                grid-cols-1
                                                gap-3

                                                min-[360px]:grid-cols-2
                                            "
                                        >
                                            <div
                                                className="
                                                    min-w-0
                                                    rounded-xl
                                                    bg-[#F8F9FF]
                                                    p-3
                                                "
                                            >
                                                <div
                                                    className="
                                                        text-[10px]
                                                        font-semibold
                                                        uppercase
                                                        tracking-wide
                                                        text-[#98A2B3]
                                                    "
                                                >
                                                    Услуга
                                                </div>


                                                <div
                                                    className="
                                                        mt-1
                                                        break-words
                                                        text-[12px]
                                                        font-medium
                                                        text-[#344054]
                                                    "
                                                >
                                                    {serviceName}
                                                </div>
                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                    rounded-xl
                                                    bg-[#F8F9FF]
                                                    p-3
                                                "
                                            >
                                                <div
                                                    className="
                                                        text-[10px]
                                                        font-semibold
                                                        uppercase
                                                        tracking-wide
                                                        text-[#98A2B3]
                                                    "
                                                >
                                                    Мастер
                                                </div>


                                                <div
                                                    className="
                                                        mt-1
                                                        break-words
                                                        text-[12px]
                                                        font-medium
                                                        text-[#344054]
                                                    "
                                                >
                                                    {staffName}
                                                </div>
                                            </div>
                                        </div>


                                        <div
                                            className="
                                                flex
                                                flex-col
                                                gap-3
                                                border-t
                                                border-[#EAECF0]
                                                pt-3

                                                min-[390px]:flex-row
                                                min-[390px]:items-center
                                                min-[390px]:justify-between
                                            "
                                        >
                                            <div
                                                className="
                                                    text-[15px]
                                                    font-bold
                                                    text-[#101828]
                                                "
                                            >
                                                {
                                                    price.toLocaleString(
                                                        'ru-RU'
                                                    )
                                                } ₸
                                            </div>


                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-2
                                                "
                                            >
                                                {appointment.status ===
                                                    'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={loading}
                                                            onClick={() =>
                                                                onConfirm(
                                                                    appointment.id
                                                                )
                                                            }
                                                            className="
                                                                inline-flex
                                                                h-9
                                                                cursor-pointer
                                                                items-center
                                                                justify-center
                                                                gap-1.5
                                                                rounded-lg
                                                                bg-[#ECFDF3]
                                                                px-3
                                                                text-[11px]
                                                                font-medium
                                                                text-[#16A34A]
                                                                transition
                                                                hover:bg-[#D1FADF]
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                            "
                                                        >
                                                            <Check
                                                                size={14}
                                                            />
                                                            Подтвердить
                                                        </button>


                                                        <button
                                                            type="button"
                                                            disabled={loading}
                                                            onClick={() =>
                                                                onCancel(
                                                                    appointment.id
                                                                )
                                                            }
                                                            className="
                                                                inline-flex
                                                                h-9
                                                                cursor-pointer
                                                                items-center
                                                                justify-center
                                                                gap-1.5
                                                                rounded-lg
                                                                bg-[#FEF3F2]
                                                                px-3
                                                                text-[11px]
                                                                font-medium
                                                                text-[#F04438]
                                                                transition
                                                                hover:bg-[#FEE4E2]
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                            "
                                                        >
                                                            <X
                                                                size={14}
                                                            />
                                                            Отменить
                                                        </button>
                                                    </>
                                                )}


                                                {appointment.status ===
                                                    'confirmed' && (
                                                    <button
                                                        type="button"
                                                        disabled={loading}
                                                        onClick={() =>
                                                            onComplete(
                                                                appointment.id
                                                            )
                                                        }
                                                        className="
                                                            h-9
                                                            cursor-pointer
                                                            rounded-lg
                                                            bg-[#EEF2FF]
                                                            px-3
                                                            text-[11px]
                                                            font-medium
                                                            text-[#4F46E5]
                                                            transition
                                                            hover:bg-[#E0E7FF]
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        Завершить
                                                    </button>
                                                )}


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/crm/appointments/${appointment.id}`
                                                        )
                                                    }
                                                    className="
                                                        inline-flex
                                                        h-9
                                                        cursor-pointer
                                                        items-center
                                                        justify-center
                                                        gap-1.5
                                                        rounded-lg
                                                        border
                                                        border-[#EAECF0]
                                                        bg-white
                                                        px-3
                                                        text-[11px]
                                                        font-medium
                                                        text-[#667085]
                                                        transition
                                                        hover:bg-[#F9FAFB]
                                                        hover:text-[#4F46E5]
                                                    "
                                                >
                                                    <ExternalLink
                                                        size={14}
                                                    />
                                                    Открыть
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>


                    {/* DESKTOP TABLE */}

                    <div
                        className="
                            hidden
                            overflow-x-auto

                            md:block
                        "
                    >
                        <table
                            className="
                                w-full
                                min-w-[900px]
                                border-collapse
                            "
                        >
                            <thead>
                                <tr
                                    className="
                                        border-y
                                        border-[#EAECF0]
                                        bg-[#FCFCFD]
                                    "
                                >
                                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#667085]">
                                        Время
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#667085]">
                                        Клиент
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#667085]">
                                        Услуга
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#667085]">
                                        Мастер
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#667085]">
                                        Статус
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#667085]">
                                        Сумма
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-[12px] font-medium text-[#667085]">
                                        Действия
                                    </th>
                                </tr>
                            </thead>


                            <tbody>
                                {visibleAppointments.map(
                                    appointment => {
                                        const status =
                                            getStatusConfig(
                                                appointment.status
                                            );

                                        const loading =
                                            actionLoadingId ===
                                            appointment.id;

                                        const clientName =
                                            getAppointmentClientName(
                                                appointment
                                            );

                                        const phone =
                                            getAppointmentPhone(
                                                appointment
                                            );

                                        const staffName =
                                            getAppointmentStaffName(
                                                appointment
                                            );

                                        const price =
                                            getAppointmentPrice(
                                                appointment
                                            );


                                        return (
                                            <tr
                                                key={appointment.id}
                                                className="
                                                    border-b
                                                    border-[#EAECF0]
                                                    last:border-b-0
                                                    transition
                                                    hover:bg-[#FCFCFD]
                                                "
                                            >
                                                <td className="px-5 py-4 align-middle">
                                                    <div className="text-[14px] font-semibold text-[#344054]">
                                                        {
                                                            format(
                                                                new Date(
                                                                    appointment.start_at
                                                                ),
                                                                'HH:mm'
                                                            )
                                                        }
                                                    </div>
                                                </td>


                                                <td className="px-5 py-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-semibold text-[#4F46E5]">
                                                            {
                                                                getClientInitials(
                                                                    appointment
                                                                )
                                                            }
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="max-w-[180px] truncate text-[13px] font-semibold text-[#101828]">
                                                                {clientName}
                                                            </div>

                                                            <div className="mt-0.5 text-[11px] text-[#98A2B3]">
                                                                {phone || 'Телефон не указан'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>


                                                <td className="px-5 py-4 align-middle">
                                                    <div className="max-w-[180px] text-[13px] font-medium text-[#344054]">
                                                        {
                                                            appointment.service_name ??
                                                            `Услуга #${appointment.service}`
                                                        }
                                                    </div>
                                                </td>


                                                <td className="px-5 py-4 align-middle">
                                                    <div className="flex items-center gap-2 text-[13px] text-[#344054]">
                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#A855F7]" />
                                                        {staffName}
                                                    </div>
                                                </td>


                                                <td className="px-5 py-4 align-middle">
                                                    <span
                                                        className={`
                                                            inline-flex
                                                            whitespace-nowrap
                                                            rounded-md
                                                            px-2.5
                                                            py-1.5
                                                            text-[11px]
                                                            font-medium
                                                            ${status.className}
                                                        `}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </td>


                                                <td className="whitespace-nowrap px-5 py-4 align-middle text-[14px] font-semibold text-[#101828]">
                                                    {
                                                        price.toLocaleString(
                                                            'ru-RU'
                                                        )
                                                    } ₸
                                                </td>


                                                <td className="px-5 py-4 align-middle">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {appointment.status ===
                                                            'pending' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    disabled={loading}
                                                                    onClick={() =>
                                                                        onConfirm(
                                                                            appointment.id
                                                                        )
                                                                    }
                                                                    title="Подтвердить"
                                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#ECFDF3] text-[#16A34A] transition hover:bg-[#D1FADF] disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <Check size={15} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={loading}
                                                                    onClick={() =>
                                                                        onCancel(
                                                                            appointment.id
                                                                        )
                                                                    }
                                                                    title="Отменить"
                                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#FEF3F2] text-[#F04438] transition hover:bg-[#FEE4E2] disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <X size={15} />
                                                                </button>
                                                            </>
                                                        )}


                                                        {appointment.status ===
                                                            'confirmed' && (
                                                            <button
                                                                type="button"
                                                                disabled={loading}
                                                                onClick={() =>
                                                                    onComplete(
                                                                        appointment.id
                                                                    )
                                                                }
                                                                className="cursor-pointer rounded-lg bg-[#EEF2FF] px-3 py-2 text-[11px] font-medium text-[#4F46E5] transition hover:bg-[#E0E7FF] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Завершить
                                                            </button>
                                                        )}


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/crm/appointments/${appointment.id}`
                                                                )
                                                            }
                                                            title="Открыть запись"
                                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#4F46E5]"
                                                        >
                                                            <ExternalLink size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}


        <button
            type="button"
            onClick={() =>
                navigate(
                    '/crm/appointments?date_filter=today'
                )
            }
            className="
                w-full
                cursor-pointer
                border-t
                border-[#EAECF0]
                px-4
                py-3.5
                text-[12px]
                font-medium
                text-[#4F46E5]
                transition
                hover:bg-[#F9FAFB]
            "
        >
            Показать все записи на сегодня ({totalCount})
        </button>
        </div>
    );
}

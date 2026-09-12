import {
    Check,
    ExternalLink,
    MoreVertical,
    X
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';


type AppointmentStatus =
    | 'completed'
    | 'confirmed'
    | 'pending';


interface Appointment {
    id: number;
    time: string;

    client: string;
    phone: string;

    service: string;

    staff: string;
    staffColor: string;

    status: AppointmentStatus;

    price: string;
}


const appointments: Appointment[] = [
    {
        id: 15,
        time: '10:00',
        client: 'Алина С.',
        phone: '+7 777 123 4567',
        service: 'Стрижка женская',
        staff: 'Мария',
        staffColor: 'bg-purple-400',
        status: 'completed',
        price: '4 500 ₸'
    },
    {
        id: 16,
        time: '11:30',
        client: 'Данияр К.',
        phone: 'Постоянный',
        service: 'Моделирование бороды',
        staff: 'Тимур',
        staffColor: 'bg-red-500',
        status: 'confirmed',
        price: '2 500 ₸'
    },
    {
        id: 17,
        time: '14:00',
        client: 'Елена В.',
        phone: 'Новый клиент',
        service: 'Маникюр (Комплекс)',
        staff: 'Айгерим',
        staffColor: 'bg-green-500',
        status: 'pending',
        price: '3 000 ₸'
    }
];


const statusStyles = {
    completed: {
        text: 'Завершена',
        className:
            'bg-green-50 text-green-600'
    },

    confirmed: {
        text: 'Подтверждена',
        className:
            'bg-blue-50 text-blue-500'
    },

    pending: {
        text: 'Ожидает',
        className:
            'bg-orange-50 text-orange-500'
    }
};


export default function TodayAppointments() {

    const navigate =
        useNavigate();


    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[#D9DDED]
                bg-white
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-5
                    py-4
                "
            >

                <div>

                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-[#0F172A]
                        "
                    >
                        Записи на сегодня
                    </h2>

                    <p
                        className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                        "
                    >
                        12 записей, 4 завершено
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
                        rounded-lg
                        bg-[#4F46E5]
                        px-4
                        py-2
                        text-[11px]
                        font-medium
                        text-white
                        transition
                        hover:bg-[#4338CA]
                    "
                >
                    + &nbsp; Новая запись
                </button>

            </div>


            <div
                className="
                    overflow-x-auto
                "
            >

                <table
                    className="
                        w-full
                        min-w-[750px]
                        border-collapse
                    "
                >

                    <thead
                        className="
                            border-y
                            border-[#E8EAF2]
                            bg-[#FCFCFE]
                        "
                    >

                        <tr>

                            {[
                                'Время',
                                'Клиент',
                                'Услуга',
                                'Мастер',
                                'Статус',
                                'Сумма',
                                'Действия'
                            ].map(
                                title => (

                                    <th
                                        key={
                                            title
                                        }
                                        className="
                                            px-4
                                            py-3
                                            text-left
                                            text-[9px]
                                            font-medium
                                            text-slate-500
                                        "
                                    >
                                        {title}
                                    </th>

                                )
                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {appointments.map(
                            appointment => {

                                const status =
                                    statusStyles[
                                        appointment.status
                                    ];


                                return (
                                    <tr
                                        key={
                                            appointment.id
                                        }
                                        className="
                                            border-b
                                            border-[#EEF0F6]
                                            last:border-b-0
                                            hover:bg-slate-50/70
                                        "
                                    >

                                        <td
                                            className="
                                                px-4
                                                py-3
                                                text-xs
                                                font-medium
                                                text-slate-700
                                            "
                                        >
                                            {appointment.time}
                                        </td>


                                        <td
                                            className="
                                                px-4
                                                py-3
                                            "
                                        >

                                            <div
                                                className="
                                                    text-xs
                                                    font-medium
                                                    text-slate-800
                                                "
                                            >
                                                {appointment.client}
                                            </div>


                                            <div
                                                className="
                                                    mt-0.5
                                                    text-[9px]
                                                    text-slate-400
                                                "
                                            >
                                                {appointment.phone}
                                            </div>

                                        </td>


                                        <td
                                            className="
                                                max-w-[150px]
                                                px-4
                                                py-3
                                                text-[11px]
                                                text-slate-500
                                            "
                                        >
                                            {appointment.service}
                                        </td>


                                        <td
                                            className="
                                                px-4
                                                py-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    text-[11px]
                                                    text-slate-600
                                                "
                                            >

                                                <span
                                                    className={`
                                                        h-2
                                                        w-2
                                                        rounded-full
                                                        ${appointment.staffColor}
                                                    `}
                                                />

                                                {appointment.staff}

                                            </div>

                                        </td>


                                        <td
                                            className="
                                                px-4
                                                py-3
                                            "
                                        >

                                            <span
                                                className={`
                                                    rounded-md
                                                    px-2
                                                    py-1
                                                    text-[9px]
                                                    font-medium
                                                    ${status.className}
                                                `}
                                            >
                                                {status.text}
                                            </span>

                                        </td>


                                        <td
                                            className="
                                                px-4
                                                py-3
                                                text-xs
                                                font-semibold
                                                text-slate-800
                                            "
                                        >
                                            {appointment.price}
                                        </td>


                                        <td
                                            className="
                                                px-4
                                                py-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-end
                                                    gap-2
                                                "
                                            >

                                                {appointment.status ===
                                                    'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="
                                                                flex
                                                                h-7
                                                                w-7
                                                                items-center
                                                                justify-center
                                                                rounded-md
                                                                bg-green-50
                                                                text-green-600
                                                            "
                                                        >
                                                            <Check
                                                                size={14}
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="
                                                                flex
                                                                h-7
                                                                w-7
                                                                items-center
                                                                justify-center
                                                                rounded-md
                                                                bg-red-50
                                                                text-red-500
                                                            "
                                                        >
                                                            <X
                                                                size={14}
                                                            />
                                                        </button>
                                                    </>
                                                )}


                                                {appointment.status ===
                                                    'confirmed' && (

                                                    <button
                                                        type="button"
                                                        className="
                                                            rounded-md
                                                            bg-[#EEF2FF]
                                                            px-2
                                                            py-1.5
                                                            text-[9px]
                                                            font-medium
                                                            text-[#4F46E5]
                                                        "
                                                    >
                                                        Завершить
                                                    </button>

                                                )}


                                                {appointment.status ===
                                                    'completed' && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/crm/appointments/${appointment.id}`
                                                            )
                                                        }
                                                        className="
                                                            text-slate-400
                                                            hover:text-[#4F46E5]
                                                        "
                                                    >
                                                        <ExternalLink
                                                            size={14}
                                                        />
                                                    </button>

                                                )}


                                                <button
                                                    type="button"
                                                    className="
                                                        text-slate-400
                                                    "
                                                >
                                                    <MoreVertical
                                                        size={14}
                                                    />
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


            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/crm/appointments'
                    )
                }
                className="
                    w-full
                    border-t
                    border-[#E8EAF2]
                    py-3
                    text-[10px]
                    font-medium
                    text-[#4F46E5]
                    transition
                    hover:bg-slate-50
                "
            >
                Показать все записи на сегодня (12)
            </button>

        </div>
    );
}
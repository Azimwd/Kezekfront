import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Search } from 'lucide-react';
import Typography from '../../../atoms/Typography';
import Select, { type SelectOption } from '../../../atoms/Select';
import Icon from '../../../atoms/Icon';
import { filterAppointments } from '../../../../api/appointments';
import { useBusiness } from '../../../../context/BusinessContext';
import Button from '../../../atoms/Button';
import { useNavigate } from 'react-router-dom';

const DATE_OPTIONS: SelectOption[] = [
    { id: 0, label: 'Все даты' },
    { id: 1, label: 'Сегодня' },
    { id: 2, label: 'Завтра' },
    { id: 3, label: 'Неделя' }
];

const STATUS_OPTIONS: SelectOption[] = [
    { id: 0, label: 'Все статусы' },
    { id: 1, label: 'Ожидают' },
    { id: 2, label: 'Подтверждены' },
    { id: 3, label: 'Завершены' },
    { id: 4, label: 'Отменены' }
];

const formatAppointmentDate = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (diffDays === 0) {
        return `Сегодня, ${timeString}`;
    } else if (diffDays === 1) {
        return `Завтра, ${timeString}`;
    } else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}.${month}.${year}, ${timeString}`;
    }
};

export default function StatsGrid() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedDate, setSelectedDate] = useState<SelectOption>(
        DATE_OPTIONS[0]
    );
    const [selectedStatus, setSelectedStatus] = useState<SelectOption>(
        STATUS_OPTIONS[0]
    );

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleReset = () => {
        setSearch('');
        setDebouncedSearch('');
        setSelectedDate(DATE_OPTIONS[0]);
        setSelectedStatus(STATUS_OPTIONS[0]);
    };

    const { selectedBusiness } = useBusiness();
    const businessId = selectedBusiness?.id;

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: [
            'appointments',
            businessId,
            debouncedSearch,
            selectedDate.id,
            selectedStatus.id
        ],
        queryFn: async () => {
            const filters: Record<string, any> = {};

            if (debouncedSearch.trim()) {
                filters.search = debouncedSearch.trim();
            }

            if (selectedDate.id === 1) filters.date_filter = 'today';
            if (selectedDate.id === 2) filters.date_filter = 'tomorrow';
            if (selectedDate.id === 3) filters.date_filter = 'week';

            if (selectedStatus.id === 1) filters.status = 'pending';
            if (selectedStatus.id === 2) filters.status = 'confirmed';
            if (selectedStatus.id === 3) filters.status = 'completed';
            if (selectedStatus.id === 4) filters.status = 'canceled';

            const response = await filterAppointments(
                Number(businessId),
                filters
            );

            return response.data || [];
        },
        enabled: !!businessId
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="px-3 py-1 bg-[#fffbe2] text-[#d97706] rounded-full text-xs font-semibold">
                        Ожидает
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="px-3 py-1 bg-[#eef4ff] text-[#4031d0] rounded-full text-xs font-semibold">
                        Подтверждена
                    </span>
                );
            case 'completed':
                return (
                    <span className="px-3 py-1 bg-[#ecfdf5] text-[#15803d] rounded-full text-xs font-semibold">
                        Завершена
                    </span>
                );
            case 'canceled':
            case 'cancelled':
                return (
                    <span className="px-3 py-1 bg-[#fef2f2] text-[#b91c1c] rounded-full text-xs font-semibold">
                        Отменена
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full bg-white rounded-2xl border border-[#c7c4d8] flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 border-b border-[#e2e4f0]">
                <div className="relative w-full sm:w-[280px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon
                            icon={Search}
                            className="w-4 h-4 text-slate-400"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Поиск по клиенту..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-[#c7c4d8] rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#4031d0] focus:ring-1 focus:ring-[#4031d0] placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-[140px]">
                        <Select
                            options={DATE_OPTIONS}
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="w-full border border-[#c7c4d8] rounded-xl"
                        />
                    </div>
                    <div className="w-[160px]">
                        <Select
                            options={STATUS_OPTIONS}
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            className="w-full border border-[#c7c4d8] rounded-xl "
                        />
                    </div>

                    <button
                        onClick={handleReset}
                        className="text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors ml-2"
                    >
                        Сбросить
                    </button>
                </div>

                <div className="ml-auto hidden md:block">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300"></div>
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-[#e2e4f0]">
                        <tr>
                            <th className="py-4 px-6 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Дата и время
                            </th>
                            <th className="py-4 px-6 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Клиент
                            </th>
                            <th className="py-4 px-6 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Услуга
                            </th>
                            <th className="py-4 px-13 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Статус
                            </th>
                            <th className="py-4 px-6 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e4f0]">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-8 text-center text-slate-500"
                                >
                                    Загрузка...
                                </td>
                            </tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-8 text-center text-slate-500"
                                >
                                    Записей не найдено
                                </td>
                            </tr>
                        ) : (
                            appointments.map((row: any) => {
                                const isCanceled =
                                    row.status === 'canceled' ||
                                    row.status === 'cancelled';

                                return (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="py-4 px-6 align-middle">
                                            <div
                                                className={`text-sm font-semibold ${isCanceled ? 'line-through text-slate-400' : 'text-slate-900'}`}
                                            >
                                                {row.start_at
                                                    ? formatAppointmentDate(
                                                          row.start_at
                                                      )
                                                    : row.date}
                                            </div>
                                            {row.duration && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {row.duration}
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-4 px-6 align-middle">
                                            <div
                                                className={`text-sm font-semibold ${isCanceled ? 'line-through text-slate-400' : 'text-slate-900'}`}
                                            >
                                                {row.client_name ||
                                                    row.clientName ||
                                                    `Клиент #${row.client}`}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {row.clientPhone}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 align-middle">
                                            <div
                                                className={`text-sm font-medium ${isCanceled ? 'line-through text-slate-400' : 'text-slate-700'}`}
                                            >
                                                {row.service_name ||
                                                    row.serviceName}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {row.masterName}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 align-middle">
                                            {getStatusBadge(row.status)}
                                        </td>

                                        <td className="py-4 px-6 align-middle">
                                            <Button
                                                className="ml-6 cursor-pointer group"
                                                onClick={() =>
                                                    navigate(
                                                        `/crm/appointments/edit/${row.id}`
                                                    )
                                                }
                                            >
                                                <Icon
                                                    icon={Pencil}
                                                    size={20}
                                                    className="text-[#7c7c7c] group-hover:text-[#5a5a5a]"
                                                />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#e2e4f0] gap-4">
                <Typography
                    text={`Показано ${appointments.length > 0 ? 1 : 0}-${appointments.length} записей`}
                    className="text-sm text-slate-500"
                />

                <div className="flex items-center space-x-1">
                    <button className="px-3.5 py-1.5 border border-[#c7c4d8] rounded-l-lg text-sm font-medium text-slate-500 hover:bg-slate-50 bg-white transition-colors">
                        Пред.
                    </button>
                    <button className="px-3.5 py-1.5 border border-[#4031d0] bg-[#4031d0] text-sm font-medium text-white transition-colors">
                        1
                    </button>
                    <button className="px-3.5 py-1.5 border border-[#c7c4d8] rounded-r-lg text-sm font-medium text-slate-500 hover:bg-slate-50 bg-white transition-colors">
                        След.
                    </button>
                </div>
            </div>
        </div>
    );
}

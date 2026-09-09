import { useQuery } from '@tanstack/react-query';
import { getAllAppointments } from '../../../../api/appointments';
import { useBusiness } from '../../../../context/BusinessContext';
import {
    Calendar,
    CheckCircle,
    CheckCircle2,
    ClipboardList
} from 'lucide-react';

export default function DataTableArea() {
    const { selectedBusiness } = useBusiness();
    const businessId = selectedBusiness?.id;

    const { data: appointmentsResponse, isPending } = useQuery({
        queryKey: ['appointments', businessId],
        queryFn: () => getAllAppointments(Number(businessId)),
        enabled: !!businessId
    });

    const summary = appointmentsResponse?.summary || {
        today_count: 0,
        pending_count: 0,
        confirmed_count: 0,
        completed_count: 0
    };

    const statsCards = [
        {
            title: 'Сегодня',
            icon: Calendar,
            iconColor: 'text-[#4031d0]',
            topBarColor: null,
            value: summary.today_count,
            description: 'записей'
        },
        {
            title: 'Ожидают',
            icon: ClipboardList,
            iconColor: 'text-amber-500',
            topBarColor: 'bg-amber-500',
            value: summary.pending_count,
            description: 'требуют внимания'
        },
        {
            title: 'Подтверждены',
            icon: CheckCircle2,
            iconColor: 'text-[#4031d0]',
            topBarColor: 'bg-[#4031d0]',
            value: summary.confirmed_count,
            description: 'запланировано'
        },
        {
            title: 'Завершены',
            icon: CheckCircle,
            iconColor: 'text-emerald-500',
            topBarColor: 'bg-emerald-500',
            value: summary.completed_count,
            description: 'успешно'
        }
    ];

    return (
        <div className="flex flex-col w-full gap-10">
            <div className="w-full">
                {isPending ? (
                    <div className="w-full bg-white rounded-2xl p-6 border border-[#c7c4d8] flex justify-center items-center h-40">
                        <span className="animate-pulse text-slate-500 font-medium">
                            Загрузка записей...
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10">
                        {statsCards.map((card, index) => {
                            const IconComponent = card.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl  sm:p-6 border border-[#c7c4d8] relative overflow-hidden flex flex-col justify-between"
                                >
                                    {card.topBarColor && (
                                        <div
                                            className={`absolute top-0 left-0 w-full h-1 ${card.topBarColor}`}
                                        />
                                    )}

                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-semibold text-slate-600">
                                            {card.title}
                                        </span>
                                        <IconComponent
                                            className={`w-5 h-5 ${card.iconColor}`}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-4xl font-bold text-slate-900 mb-1">
                                            {card.value}
                                        </div>
                                        <div className="text-xs font-semibold text-slate-500">
                                            {card.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

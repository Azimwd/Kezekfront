import Typography from '../../components/atoms/Typography';
import Button from '../../components/atoms/Button';
import Icon from '../../components/atoms/Icon';
import { Scissors, Trash2 } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteService, listOfServices } from '../../api/services';

import EditService from '../../components/molecules/Crm/Services/EditService';

export default function Services() {
    const { selectedBusiness } = useBusiness();
    const queryClient = useQueryClient();

    const { isPending, error, data } = useQuery({
        queryKey: ['services', selectedBusiness?.id],
        queryFn: () => listOfServices(Number(selectedBusiness!.id)),
        enabled: !!selectedBusiness?.id,

        retry: false
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['services', selectedBusiness?.id]
            });
        },
        onError: (err) => {
            console.error('Ошибка при удалении услуги:', err);
            alert('Произошла ошибка при удалении услуги.');
        }
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isPending) {
        return (
            <div className="p-10 text-center text-gray-500">
                Загрузка сервисов...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex justify-center items-center py-10">
                <p className="text-red-500">
                    Произошла ошибка при загрузке сервисов. Возможно, сессия
                    истекла.
                </p>
            </div>
        );
    }

    if (!selectedBusiness) {
        return (
            <div className="p-10 text-center text-gray-500">
                Пожалуйста, выберите бизнес из списка сверху...
            </div>
        );
    }

    if (!selectedBusiness) {
        return (
            <div className="p-10 text-center text-gray-500">
                Пожалуйста, выберите бизнес из списка сверху...
            </div>
        );
    }

    return (
        <>
            <div className="w-full max-w-full  flex flex-col gap-10">
                <div className="flex flex-col p-4 md:p-5 bg-[#fff] border border-[#c7c4d8] rounded-2xl ">
                    <Typography
                        className="text-base md:text-lg font-medium text-gray-900 mb-1"
                        text={`Текущий бизнес: ${selectedBusiness.label || 'Не выбрано'}`}
                    />
                    <Typography
                        className="text-xs md:text-sm text-gray-600 leading-relaxed"
                        text={`Управляйте услугами бизнеса ${selectedBusiness.label || 'Не выбрано'}. Услуги создаются и отображаются только для выбранного бизнеса.`}
                    />
                </div>

                <div className="bg-white border border-[#c7c4d8] rounded-2xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-[#c7c4d8]">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Название
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Описание
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Цена
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Длительность
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Буфер до / после
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.data && data.data.length > 0 ? (
                                    data.data.map((service: any) => (
                                        <tr
                                            key={service.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                        service.is_active ===
                                                        false
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : 'bg-[#eeebff] text-[#6366f1]'
                                                    }`}
                                                >
                                                    <Icon
                                                        size={20}
                                                        icon={Scissors}
                                                    />
                                                </div>
                                                <span className="font-semibold text-slate-800 whitespace-nowrap">
                                                    {service.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {service.description || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                                                {Number(service.price)} ₸
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {service.duration_minutes} мин
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {service.buffer_before_minutes}{' '}
                                                мин /{' '}
                                                {service.buffer_after_minutes}{' '}
                                                мин
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap flex justify-end gap-5">
                                                <EditService
                                                    service={service}
                                                />

                                                <Button
                                                    className="cursor-pointer text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
                                                    onClick={() =>
                                                        handleDelete(service.id)
                                                    }
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                >
                                                    <Icon
                                                        icon={Trash2}
                                                        size={20}
                                                    />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-gray-500"
                                        >
                                            Услуги пока не добавлены.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#c7c4d8] bg-white">
                        <span className="text-sm text-gray-500 font-medium">
                            Показано 1-3 из 12 услуг
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-md text-sm hover:bg-gray-50 transition-colors">
                                Пред.
                            </button>
                            <button className="px-3 py-1.5 border border-[#4F46E5] bg-[#4F46E5] text-white font-medium rounded-md text-sm transition-colors shadow-sm">
                                1
                            </button>
                            <button className="px-3 py-1.5 border border-gray-200 text-gray-700 bg-white font-medium rounded-md text-sm hover:bg-gray-50 transition-colors">
                                2
                            </button>
                            <button className="px-3 py-1.5 border border-gray-200 text-gray-700 bg-white rounded-md text-sm hover:bg-gray-50 transition-colors">
                                След.
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

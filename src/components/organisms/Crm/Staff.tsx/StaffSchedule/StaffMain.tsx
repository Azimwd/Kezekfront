import { useEffect, useState } from 'react';
import {
    Clock,
    Coffee,
    Check,
    Frown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import SidePage from '../../../SidePage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getScheduleStaff,
    getScheduleStaffBreaks,
    getScheduleStaffDaysOff,
    patchScheduleStaff,
    patchScheduleStaffBreaks,
    deleteScheduleStaffBreaks,
    postScheduleStaffBreaks,
    postScheduleStaffDaysOff,
    patchScheduleStaffDaysOff,
    deleteScheduleStaffDaysOff
} from '../../../../../api/staff';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface StaffMainProps {
    staffId: number;
}

interface DaySchedule {
    id: string;
    recordId?: number;
    breakRecordId?: number;
    dayOffRecordId?: number;

    dayName: string;
    date: Date;

    isWorking: boolean;

    startTime: string;
    endTime: string;

    hasBreak: boolean;
    breakStart: string;
    breakEnd: string;

    hasDayOff: boolean;

    dayOffDate?: string;
    dayOffReason?: string;
}

const generateBaseSchedule = (weekStart: Date): DaySchedule[] => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = [
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
        'Воскресенье'
    ];

    return days.map((id, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);

        return {
            id,
            dayName: dayNames[index],
            date,

            isWorking: false,

            startTime: '10:00',
            endTime: '18:00',

            hasBreak: false,
            breakStart: '13:00',
            breakEnd: '14:00',

            hasDayOff: false,

            dayOffReason: ''
        };
    });
};


const HOUR_HEIGHT = 60;

const timeToHours = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
};

const getShortDayName = (dayName: string) => {
    const shorts: Record<string, string> = {
        Понедельник: 'Пн',
        Вторник: 'Вт',
        Среда: 'Ср',
        Четверг: 'Чт',
        Пятница: 'Пт',
        Суббота: 'Сб',
        Воскресенье: 'Вс'
    };
    return shorts[dayName] || dayName;
};

const reverseWeekdayMap: Record<string, number> = {
    mon: 0,
    tue: 1,
    wed: 2,
    thu: 3,
    fri: 4,
    sat: 5,
    sun: 6
};

export default function StaffMain({ staffId }: StaffMainProps) {
    const queryClient = useQueryClient();

    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Стабильная строка для использования в массиве зависимостей
    const weekStartIso = weekStart.toISOString();

    const [schedule, setSchedule] = useState<DaySchedule[]>(
        generateBaseSchedule(weekStart)
    );

    const workingDays = schedule.filter(
        (day) => day.isWorking
    );

    let gridStartHour = 8;
    let gridEndHour = 20;

    if (workingDays.length > 0) {
        const startHours = workingDays.map((day) =>
            Math.floor(timeToHours(day.startTime))
        );

        const endHours = workingDays.map((day) =>
            Math.ceil(timeToHours(day.endTime))
        );

        gridStartHour = Math.max(
            0,
            Math.min(...startHours) - 1
        );

        gridEndHour = Math.min(
            24,
            Math.max(...endHours) + 1
        );
    }

    const GRID_HOURS = Array.from(
        {
            length: gridEndHour - gridStartHour + 1
        },
        (_, index) => {
            const hour = gridStartHour + index;

            return `${String(hour).padStart(2, '0')}:00`;
        }
    );

    const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
    const [editForm, setEditForm] = useState<DaySchedule | null>(null);

    const formatWeekRange = () => {
        const startFormat = format(weekStart, 'd', { locale: ru });
        const endFormat = format(weekEnd, 'd MMMM yyyy', { locale: ru });

        if (weekStart.getMonth() !== weekEnd.getMonth()) {
            return `${format(weekStart, 'd MMMM', { locale: ru })} – ${endFormat}`;
        }
        return `${startFormat}–${endFormat}`;
    };

    const handlePrevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1));

    const { data: scheduleData, isLoading: isLoadingSchedule } = useQuery({
        queryKey: ['staffSchedule', staffId, weekStartIso],
        queryFn: () => getScheduleStaff(staffId),
        enabled: !!staffId
    });

    const { data: breaksData, isLoading: isLoadingBreaks } = useQuery({
        queryKey: ['staffBreaks', staffId, weekStartIso],
        queryFn: () => getScheduleStaffBreaks(staffId),
        enabled: !!staffId
    });

    const { data: daysOffData, isLoading: isLoadingDaysOff } = useQuery({
        queryKey: ['staffDaysOff', staffId, weekStartIso],
        queryFn: () => getScheduleStaffDaysOff(staffId),
        enabled: !!staffId
    });

    const updateScheduleMutation = useMutation({
        mutationFn: (data: {
            id: number;
            weekday: number;
            start_time: string;
            end_time: string;
            is_working_day: boolean;
        }) =>
            patchScheduleStaff(
                data.id,
                data.weekday,
                data.start_time,
                data.end_time,
                data.is_working_day
            ),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['staffSchedule', staffId]
            })
    });

    const createBreakMutation = useMutation({
        mutationFn: (data: {
            staffId: number;
            weekday: number;
            start_time: string;
            end_time: string;
        }) =>
            postScheduleStaffBreaks(
                data.staffId,
                data.weekday,
                data.start_time,
                data.end_time
            ),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['staffBreaks', staffId]
            })
    });

    const updateBreakMutation = useMutation({
        mutationFn: (data: {
            id: number;
            weekday: number;
            start_time: string;
            end_time: string;
        }) =>
            patchScheduleStaffBreaks(
                data.id,
                data.weekday,
                data.start_time,
                data.end_time
            ),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['staffBreaks', staffId]
            })
    });

    const deleteBreakMutation = useMutation({
        mutationFn: (id: number) => deleteScheduleStaffBreaks(id),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['staffBreaks', staffId]
            })
    });

    const createDayOffMutation = useMutation({
        mutationFn: (data: { staffId: number; date: string; reason: string }) =>
            postScheduleStaffDaysOff(data.staffId, data.date, data.reason),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['staffDaysOff', staffId]
            })
    });

    const updateDayOffMutation = useMutation({
        mutationFn: (data: { id: number; date: string; reason: string }) =>
            patchScheduleStaffDaysOff(data.id, data.date, data.reason),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['staffDaysOff', staffId]
            })
    });

    const deleteDayOffMutation = useMutation({
        mutationFn: (id: number) => deleteScheduleStaffDaysOff(id),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['staffDaysOff', staffId]
            })
    });

    const isLoading = isLoadingSchedule || isLoadingBreaks || isLoadingDaysOff;
    const isSaving =
        updateScheduleMutation.isPending ||
        createBreakMutation.isPending ||
        updateBreakMutation.isPending ||
        deleteBreakMutation.isPending ||
        createDayOffMutation.isPending ||
        updateDayOffMutation.isPending ||
        deleteDayOffMutation.isPending;

    useEffect(() => {
        if (scheduleData) {
            const extractArray = (data: any) =>
                Array.isArray(data) ? data : data?.data || [];

            const schedules = extractArray(scheduleData);
            const breaks = extractArray(breaksData);
            const daysOff = extractArray(daysOffData);

            const baseWeekSchedule = generateBaseSchedule(weekStart);

            const formattedSchedule = baseWeekSchedule.map((day, index) => {
                const targetDateStr = format(day.date, 'yyyy-MM-dd');

                const backendDayData = schedules.find(
                    (d: any) => d.weekday === index
                );
                const backendBreakData = breaks.find(
                    (b: any) => b.weekday === index
                );
                const backendDayOffData = daysOff.find(
                    (d: any) => d.date === targetDateStr
                );

                let updatedDay = { ...day };

                if (backendDayData) {
                    updatedDay.recordId = backendDayData.id;
                    updatedDay.isWorking = backendDayData.is_working_day;
                    updatedDay.startTime = backendDayData.start_time.slice(
                        0,
                        5
                    );
                    updatedDay.endTime = backendDayData.end_time.slice(0, 5);
                }

                if (backendBreakData) {
                    updatedDay.breakRecordId = backendBreakData.id;
                    updatedDay.hasBreak = true;
                    updatedDay.breakStart = backendBreakData.start_time.slice(
                        0,
                        5
                    );
                    updatedDay.breakEnd = backendBreakData.end_time.slice(0, 5);
                } else {
                    updatedDay.hasBreak = false;
                }

                if (backendDayOffData) {
                    updatedDay.hasDayOff = true;
                    updatedDay.dayOffRecordId = backendDayOffData.id;
                    updatedDay.dayOffReason = backendDayOffData.reason || '';
                    updatedDay.dayOffDate = backendDayOffData.date;
                } else {
                    updatedDay.hasDayOff = false;
                    updatedDay.dayOffRecordId = undefined;
                    updatedDay.dayOffReason = '';
                    updatedDay.dayOffDate = undefined;
                }

                return updatedDay;
            });

            setSchedule(formattedSchedule);
        }
        // Зависимость изменена на строковое представление weekStart
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduleData, breaksData, daysOffData, weekStartIso]);

    const handleOpenSidePage = (day: DaySchedule) => {
        setSelectedDay(day);
        const dateString = format(day.date, 'yyyy-MM-dd');
        const autoDate = day.dayOffDate || dateString;
        setEditForm({ ...day, dayOffDate: autoDate });
    };

    const handleSaveSchedule = () => {
        if (!editForm) return;

        const weekdayIndex = reverseWeekdayMap[editForm.id];

        if (editForm.recordId) {
            updateScheduleMutation.mutate({
                id: editForm.recordId,
                weekday: weekdayIndex,
                start_time:
                    editForm.startTime.length === 5
                        ? `${editForm.startTime}:00`
                        : editForm.startTime,
                end_time:
                    editForm.endTime.length === 5
                        ? `${editForm.endTime}:00`
                        : editForm.endTime,
                is_working_day: editForm.isWorking
            });
        }

        if (editForm.isWorking && editForm.hasBreak) {
            if (editForm.breakRecordId) {
                updateBreakMutation.mutate({
                    id: editForm.breakRecordId,
                    weekday: weekdayIndex,
                    start_time:
                        editForm.breakStart.length === 5
                            ? `${editForm.breakStart}:00`
                            : editForm.breakStart,
                    end_time:
                        editForm.breakEnd.length === 5
                            ? `${editForm.breakEnd}:00`
                            : editForm.breakEnd
                });
            } else {
                createBreakMutation.mutate({
                    staffId,
                    weekday: weekdayIndex,
                    start_time:
                        editForm.breakStart.length === 5
                            ? `${editForm.breakStart}:00`
                            : editForm.breakStart,
                    end_time:
                        editForm.breakEnd.length === 5
                            ? `${editForm.breakEnd}:00`
                            : editForm.breakEnd
                });
            }
        } else if (editForm.breakRecordId) {
            deleteBreakMutation.mutate(
                editForm.breakRecordId
            );
        }

        if (editForm.hasDayOff) {
            const reason =
                editForm.dayOffReason?.trim() ||
                'Личный выходной';

            if (editForm.dayOffRecordId) {
                updateDayOffMutation.mutate({
                    id: editForm.dayOffRecordId,
                    date: editForm.dayOffDate!,
                    reason
                });
            } else {
                createDayOffMutation.mutate({
                    staffId,
                    date: editForm.dayOffDate!,
                    reason
                });
            }
        } else if (editForm.dayOffRecordId) {
            deleteDayOffMutation.mutate(
                editForm.dayOffRecordId
            );
        }

        setSchedule((prev) =>
            prev.map((item) =>
                item.id === editForm.id
                    ? editForm
                    : item
            )
        );

        setSelectedDay(null);
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 text-sm md:text-base text-slate-500 flex justify-center items-center h-40">
                <span className="animate-pulse">Загрузка расписания...</span>
            </div>
        );
    }

    return (
        <div className="w-full bg-white p-3 sm:p-5 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-[#e2e4f0] md:border-none md:shadow-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 lg:mb-8 gap-4">
                <div className="w-full md:w-auto text-center md:text-left">
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                        Еженедельный график
                    </h1>
                    <p className="text-[11px] md:text-sm text-slate-500 mt-1">
                        Кликните на рабочий блок или колонку дня, чтобы
                        редактировать.
                    </p>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto bg-slate-50 md:bg-transparent rounded-xl p-1 md:p-0 border border-slate-200 md:border-none">
                    <button
                        onClick={handlePrevWeek}
                        className="p-2 hover:bg-slate-200 md:hover:bg-slate-100 rounded-lg md:rounded-full transition-colors text-[#4031d0]"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div className="px-2 text-xs sm:text-sm md:text-base font-semibold text-[#4031d0] text-center w-full md:min-w-[170px]">
                        {formatWeekRange()}
                    </div>
                    <button
                        onClick={handleNextWeek}
                        className="p-2 hover:bg-slate-200 md:hover:bg-slate-100 rounded-lg md:rounded-full transition-colors text-[#4031d0]"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>

            <div className="-mx-3 sm:mx-0 px-3 sm:px-0">
                <div className="w-full overflow-x-auto custom-scrollbar pb-3 md:pb-0">
                    <div className="min-w-[550px] md:min-w-[800px] lg:min-w-full border border-[#e2e4f0] rounded-xl lg:rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-[45px_repeat(7,1fr)] md:grid-cols-[60px_repeat(7,1fr)] border-b border-[#e2e4f0] bg-slate-50/60">
                            <div className="py-2 px-1 md:py-4 md:px-2 text-[8px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider text-center border-r border-[#e2e4f0] flex items-center justify-center">
                                Время
                            </div>
                            {schedule.map((day) => (
                                <div
                                    key={day.id}
                                    onClick={() => handleOpenSidePage(day)}
                                    className="py-2 px-1 md:py-4 md:px-3 text-[10px] md:text-sm font-bold text-slate-700 uppercase tracking-wider text-center border-r last:border-r-0 border-[#e2e4f0] cursor-pointer hover:bg-slate-100/80 transition-colors"
                                >
                                    <span className="lg:hidden">
                                        {getShortDayName(day.dayName)}
                                    </span>
                                    <span className="hidden lg:inline">
                                        {day.dayName}
                                    </span>
                                    <div className="text-[8px] md:text-[10px] text-slate-400 font-medium mt-0.5 md:hidden">
                                        {format(day.date, 'dd.MM')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-[45px_repeat(7,1fr)] md:grid-cols-[60px_repeat(7,1fr)] relative">
                            <div className="border-r border-[#e2e4f0] bg-white">
                                {GRID_HOURS.slice(0, -1).map((hour) => (
                                    <div
                                        key={hour}
                                        style={{
                                            height: `${HOUR_HEIGHT}px`
                                        }}
                                        className="px-1 md:px-2 text-[8px] md:text-[11px] font-semibold text-slate-400 flex items-start pt-1 border-b border-[#f0f0f5] justify-center"
                                    >
                                        {hour}
                                    </div>
                                ))}
                            </div>

                            {schedule.map((day) => {
                                const startOffset =
                                    timeToHours(day.startTime) - gridStartHour;

                                const endOffset =
                                    timeToHours(day.endTime) - gridStartHour;

                                const blockTop =
                                    startOffset * HOUR_HEIGHT;

                                const blockHeight =
                                    (endOffset - startOffset) * HOUR_HEIGHT;

                                const breakStartOffset =
                                    timeToHours(day.breakStart) -
                                    timeToHours(day.startTime);
                                const breakEndOffset =
                                    timeToHours(day.breakEnd) -
                                    timeToHours(day.startTime);
                                const breakTop = breakStartOffset * HOUR_HEIGHT;
                                const breakHeight =
                                    (breakEndOffset - breakStartOffset) *
                                    HOUR_HEIGHT;

                                return (
                                    <div
                                        key={day.id}
                                        onClick={() => handleOpenSidePage(day)}
                                        className="relative border-r last:border-r-0 border-[#e2e4f0] cursor-pointer hover:bg-slate-50/60 transition-colors"
                                        style={{
                                            height: `${(gridEndHour - gridStartHour) * HOUR_HEIGHT}px`
                                        }}
                                    >
                                        {GRID_HOURS.map((hour) => (
                                            <div
                                                key={hour}
                                                style={{
                                                    height: `${HOUR_HEIGHT}px`
                                                }}
                                                className="border-b border-[#f0f0f5] last:border-b-0 w-full"
                                            />
                                        ))}

                                        {day.isWorking && !day.hasDayOff && blockHeight > 0 && (
                                            <div
                                                style={{
                                                    top: `${blockTop}px`,
                                                    height: `${blockHeight}px`
                                                }}
                                                className="absolute left-0.5 right-0.5 md:left-1 md:right-1 bg-[#eff4ff] border-l-[3px] md:border-l-4 border-[#4031d0] rounded-r-md md:rounded-r-lg p-1 sm:p-1.5 md:p-2.5 shadow-sm overflow-hidden transition-all hover:ring-2 hover:ring-[#4031d0]/50 z-10"
                                            >
                                                <div className="text-[8px] sm:text-[9px] md:text-xs font-bold text-[#4031d0] leading-tight truncate">
                                                    Рабочий день
                                                </div>

                                                <div className="text-[7px] sm:text-[8px] md:text-[11px] font-medium text-slate-600 mt-0.5 truncate">
                                                    {day.startTime}–{day.endTime}
                                                </div>

                                                {day.hasBreak && breakHeight > 0 && (
                                                    <div
                                                        style={{
                                                            top: `${breakTop}px`,
                                                            height: `${breakHeight}px`
                                                        }}
                                                        className="absolute left-0 right-0 bg-[#fff9eb] border-l-[3px] md:border-l-4 border-[#f59e0b] p-0.5 sm:p-1 md:p-2 flex flex-col justify-center"
                                                    >
                                                        <div className="text-[8px] md:text-[11px] font-semibold text-[#b45309] truncate leading-tight">
                                                            Перерыв
                                                        </div>

                                                        <div className="text-[7px] md:text-[10px] text-slate-600 truncate">
                                                            {day.breakStart}–{day.breakEnd}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {day.hasDayOff && (
                                            <div className="absolute inset-1 top-20 bottom-20 sm:top-24 sm:bottom-24 bg-[#eef4ff] border border-[#d6e4fa] rounded-lg md:rounded-xl flex flex-col items-center justify-center z-20 overflow-hidden px-1 shadow-sm">
                                                <Frown className="w-4 h-4 md:w-6 md:h-6 text-[#6b7280] mb-0.5 md:mb-2 opacity-80" />

                                                <div className="text-[8px] sm:text-[9px] md:text-xs font-bold text-[#334155] text-center leading-tight">
                                                    Индив.
                                                    <br className="md:hidden" />
                                                    <span className="hidden md:inline"> </span>
                                                    выходной
                                                </div>

                                                <div className="text-[7px] sm:text-[8px] md:text-xs text-[#64748b] mt-0.5 md:mt-1 text-center font-medium line-clamp-2 leading-tight">
                                                    {day.dayOffReason || 'Личный выходной'}
                                                </div>
                                            </div>
                                        )}

                                        {!day.isWorking && !day.hasDayOff && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-[8px] sm:text-[9px] md:text-xs font-medium text-slate-300 uppercase tracking-widest -rotate-90">
                                                    Выходной
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <SidePage
                isOpen={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                title={
                    editForm
                        ? `Настройка: ${editForm.dayName}`
                        : 'Расписание'
                }
                description="Установите рабочее время, перерыв или индивидуальный выходной"
                maxWidth="max-w-md"
            >
                {editForm && (
                    <div className="flex flex-col h-full justify-between">

                        <div className="flex flex-col gap-5 md:gap-6">

                            {/* ПЕРЕКЛЮЧАТЕЛЬ РАБОЧЕГО ДНЯ */}
                            <div className="flex items-center justify-between p-3.5 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-200">
                                <span className="text-sm font-semibold text-slate-800">
                                    Рабочий день
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditForm({
                                            ...editForm,
                                            isWorking: !editForm.isWorking
                                        })
                                    }
                                    className={`w-12 h-7 rounded-full relative flex items-center px-1 transition-colors duration-200 ${
                                        editForm.isWorking
                                            ? 'bg-[#4031d0]'
                                            : 'bg-slate-300'
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                                            editForm.isWorking
                                                ? 'translate-x-5'
                                                : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>


                            {/* РАБОЧИЕ ЧАСЫ */}
                            {editForm.isWorking && (
                                <>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            Рабочие часы
                                        </label>

                                        <div className="flex items-center gap-2 md:gap-3">

                                            <div className="flex-1">
                                                <span className="text-xs text-slate-400 block mb-1">
                                                    Начало
                                                </span>

                                                <input
                                                    type="time"
                                                    value={editForm.startTime}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            startTime: e.target.value
                                                        })
                                                    }
                                                    className="w-full h-11 px-2 md:px-3 bg-[#fcfcfd] border border-slate-300 rounded-lg md:rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#4031d0] focus:ring-1 focus:ring-[#4031d0]"
                                                />
                                            </div>

                                            <span className="text-slate-400 mt-5">
                                                –
                                            </span>

                                            <div className="flex-1">
                                                <span className="text-xs text-slate-400 block mb-1">
                                                    Конец
                                                </span>

                                                <input
                                                    type="time"
                                                    value={editForm.endTime}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            endTime: e.target.value
                                                        })
                                                    }
                                                    className="w-full h-11 px-2 md:px-3 bg-[#fcfcfd] border border-slate-300 rounded-lg md:rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#4031d0] focus:ring-1 focus:ring-[#4031d0]"
                                                />
                                            </div>

                                        </div>
                                    </div>


                                    {/* ПЕРЕРЫВ */}
                                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">

                                        <div className="flex items-center justify-between">

                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <Coffee className="w-4 h-4 text-amber-500" />
                                                Обеденный перерыв
                                            </label>

                                            <input
                                                type="checkbox"
                                                checked={editForm.hasBreak}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        hasBreak: e.target.checked
                                                    })
                                                }
                                                className="w-4 h-4 md:w-5 md:h-5 text-[#4031d0] rounded border-slate-300 focus:ring-[#4031d0]"
                                            />

                                        </div>

                                        {editForm.hasBreak && (
                                            <div className="flex items-center gap-2 md:gap-3 mt-1">

                                                <div className="flex-1">
                                                    <span className="text-xs text-slate-400 block mb-1">
                                                        С
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={editForm.breakStart}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                breakStart: e.target.value
                                                            })
                                                        }
                                                        className="w-full h-11 px-2 md:px-3 bg-[#fcfcfd] border border-slate-300 rounded-lg md:rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#4031d0] focus:ring-1 focus:ring-[#4031d0]"
                                                    />
                                                </div>

                                                <span className="text-slate-400 mt-5">
                                                    –
                                                </span>

                                                <div className="flex-1">
                                                    <span className="text-xs text-slate-400 block mb-1">
                                                        До
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={editForm.breakEnd}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                breakEnd: e.target.value
                                                            })
                                                        }
                                                        className="w-full h-11 px-2 md:px-3 bg-[#fcfcfd] border border-slate-300 rounded-lg md:rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#4031d0] focus:ring-1 focus:ring-[#4031d0]"
                                                    />
                                                </div>

                                            </div>
                                        )}

                                    </div>
                                </>
                            )}


                            {/* ИНДИВИДУАЛЬНЫЙ ВЫХОДНОЙ */}
                            <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">

                                <div className="flex items-center justify-between gap-4">

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Frown className="w-4 h-4 text-slate-500" />

                                            <h3 className="text-sm font-semibold text-slate-800">
                                                Индивидуальный выходной
                                            </h3>
                                        </div>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Выходной только на выбранную дату.
                                            Недельный график не изменится.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditForm({
                                                ...editForm,
                                                hasDayOff: !editForm.hasDayOff
                                            })
                                        }
                                        className={`w-12 h-7 shrink-0 rounded-full relative flex items-center px-1 transition-colors duration-200 ${
                                            editForm.hasDayOff
                                                ? 'bg-[#4031d0]'
                                                : 'bg-slate-300'
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                                                editForm.hasDayOff
                                                    ? 'translate-x-5'
                                                    : 'translate-x-0'
                                            }`}
                                        />
                                    </button>

                                </div>


                                {editForm.hasDayOff && (
                                    <div className="flex flex-col gap-3">

                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">
                                                Дата
                                            </label>

                                            <input
                                                type="date"
                                                value={editForm.dayOffDate || ''}
                                                disabled
                                                className="w-full h-11 px-3 bg-slate-100 text-slate-500 border border-slate-300 rounded-xl text-sm font-medium outline-none cursor-not-allowed"
                                            />
                                        </div>


                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">
                                                Причина
                                            </label>

                                            <select
                                                value={
                                                    editForm.dayOffReason ||
                                                    'Личный выходной'
                                                }
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        dayOffReason: e.target.value
                                                    })
                                                }
                                                className="w-full h-11 px-3 bg-[#fcfcfd] border border-slate-300 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#4031d0] focus:ring-1 focus:ring-[#4031d0]"
                                            >
                                                <option value="Личный выходной">
                                                    Личный выходной
                                                </option>

                                                <option value="По болезни">
                                                    По болезни
                                                </option>

                                                <option value="Семейные обстоятельства">
                                                    Семейные обстоятельства
                                                </option>

                                                <option value="Отпуск">
                                                    Отпуск
                                                </option>

                                                <option value="Другое">
                                                    Другое
                                                </option>
                                            </select>
                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* КНОПКИ */}
                        <div className="flex items-center gap-2 sm:gap-3 pt-6 border-t border-slate-100 mt-6 md:mt-8 pb-4 md:pb-0">

                            <button
                                type="button"
                                onClick={() => setSelectedDay(null)}
                                className="flex-1 h-11 md:h-12 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors"
                            >
                                Отмена
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveSchedule}
                                disabled={isSaving}
                                className={`flex-1 h-11 md:h-12 rounded-xl text-white font-medium text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 ${
                                    isSaving
                                        ? 'bg-slate-400'
                                        : 'bg-[#4031d0] hover:bg-[#3426a8]'
                                }`}
                            >
                                {isSaving ? (
                                    <span className="animate-pulse">
                                        Сохранение...
                                    </span>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 md:w-5 md:h-5" />
                                        Сохранить
                                    </>
                                )}
                            </button>

                        </div>

                    </div>
                )}

            </SidePage>
        </div>
    );
}

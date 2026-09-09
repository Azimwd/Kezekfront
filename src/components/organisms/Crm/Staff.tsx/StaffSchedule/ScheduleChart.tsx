import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

// --- Типизация ---
interface DaySchedule {
    id: number;
    day: string;
    isActive: boolean;
    start: string;
    end: string;
}

const INITIAL_SCHEDULE: DaySchedule[] = [
    { id: 1, day: 'Понедельник', isActive: true, start: '10:00', end: '19:00' },
    { id: 2, day: 'Вторник', isActive: true, start: '10:00', end: '19:00' },
    { id: 3, day: 'Среда', isActive: true, start: '10:00', end: '19:00' },
    { id: 4, day: 'Четверг', isActive: true, start: '10:00', end: '19:00' },
    { id: 5, day: 'Пятница', isActive: true, start: '10:00', end: '19:00' },
    { id: 6, day: 'Суббота', isActive: true, start: '10:00', end: '15:00' },
    { id: 7, day: 'Воскресенье', isActive: false, start: '10:00', end: '19:00' }
];

function CustomTimePicker({
    value,
    onChange,
    disabled
}: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hours = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, '0')
    );
    const minutes = Array.from({ length: 12 }, (_, i) =>
        (i * 5).toString().padStart(2, '0')
    );

    const [selectedHour, selectedMinute] = value.split(':');

    const handleHourSelect = (h: string) => {
        onChange(`${h}:${selectedMinute}`);
    };

    const handleMinuteSelect = (m: string) => {
        onChange(`${selectedHour}:${m}`);
        setIsOpen(false);
    };

    return (
        <div
            className={`relative ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            ref={dropdownRef}
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-28 h-10 bg-[#fcfcfd] border border-[#e2e2ea] rounded-xl px-3 text-sm font-medium text-slate-700 cursor-pointer hover:border-[#4338ca] transition-colors select-none"
            >
                <span>{value}</span>
                <Clock className="w-4 h-4 text-slate-800 pointer-events-none" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-36 bg-white border border-[#e2e2ea] shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl flex h-56 z-50 overflow-hidden">
                    <div className="w-1/2 overflow-y-auto border-r border-[#e2e2ea] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="p-1">
                            {hours.map((h) => (
                                <div
                                    key={h}
                                    onClick={() => handleHourSelect(h)}
                                    className={`py-2 text-center text-sm rounded-lg cursor-pointer transition-colors ${
                                        selectedHour === h
                                            ? 'bg-indigo-50 text-indigo-600 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="p-1">
                            {minutes.map((m) => (
                                <div
                                    key={m}
                                    onClick={() => handleMinuteSelect(m)}
                                    className={`py-2 text-center text-sm rounded-lg cursor-pointer transition-colors ${
                                        selectedMinute === m
                                            ? 'bg-indigo-50 text-indigo-600 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Основной компонент ScheduleChart ---
export default function ScheduleChart() {
    const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);

    const toggleDay = (id: number) => {
        setSchedule((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isActive: !item.isActive } : item
            )
        );
    };

    const updateTime = (id: number, field: 'start' | 'end', value: string) => {
        setSchedule((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    return (
        <div className="w-full rounded-3xl bg-white">
            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-[#e2e2ea]">
                            <th className="px-6 py-4 text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider text-left w-1/3">
                                День
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider text-center w-1/3">
                                Активность
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider text-right w-1/3">
                                График
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-[#f0f0f5] last:border-0 hover:bg-slate-50 transition-colors"
                            >
                                <td className="px-6 py-6 text-left">
                                    <span className="text-[15px] font-semibold text-slate-800">
                                        {item.day}
                                    </span>
                                </td>

                                <td className="px-6 py-6">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleDay(item.id)}
                                            className={`w-12 h-[26px] rounded-full relative flex items-center px-1 transition-colors duration-200 ease-in-out focus:outline-none ${
                                                item.isActive
                                                    ? 'bg-[#4f46e5]'
                                                    : 'bg-[#d1d1d6]'
                                            }`}
                                        >
                                            <div
                                                className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                                                    item.isActive
                                                        ? 'translate-x-[22px]'
                                                        : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                        <span
                                            className={`text-[15px] ${
                                                item.isActive
                                                    ? 'text-[#333333] font-medium'
                                                    : 'text-[#a1a1aa]'
                                            }`}
                                        >
                                            {item.isActive
                                                ? 'Рабочий день'
                                                : 'Выходной'}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-6">
                                    <div className="flex items-end justify-end gap-3">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wide">
                                                Начало
                                            </span>
                                            <CustomTimePicker
                                                value={item.start}
                                                disabled={!item.isActive}
                                                onChange={(val) =>
                                                    updateTime(
                                                        item.id,
                                                        'start',
                                                        val
                                                    )
                                                }
                                            />
                                        </div>

                                        <span
                                            className={`mb-2.5 font-medium ${
                                                item.isActive
                                                    ? 'text-[#c7c7cc]'
                                                    : 'text-[#e5e5ea]'
                                            }`}
                                        >
                                            -
                                        </span>

                                        <div className="flex flex-col gap-1.5 items-start">
                                            <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wide">
                                                Конец
                                            </span>
                                            <CustomTimePicker
                                                value={item.end}
                                                disabled={!item.isActive}
                                                onChange={(val) =>
                                                    updateTime(
                                                        item.id,
                                                        'end',
                                                        val
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

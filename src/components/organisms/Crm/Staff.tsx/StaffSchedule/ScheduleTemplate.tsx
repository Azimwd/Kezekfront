import { useState } from 'react';
import ScheduleSelects from './ScheduleSelects';
import ScheduleTable from './ScheduleTable';

export default function ScheduleTemplate() {
    const [staffId, setStaffId] = useState<number | null>(null);

    return (
        <div className="flex gap-4 md:gap-10">
            <div className="flex flex-auto flex-col gap-6 md:gap-10 w-full">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <ScheduleSelects onStaffSelect={setStaffId} />
                </div>

                <div className="w-full border border-[#c7c4d8] rounded-2xl md:rounded-3xl bg-white overflow-hidden">
                    {staffId ? (
                        <ScheduleTable staffId={staffId} />
                    ) : (
                        <div className="text-gray-500 p-6 text-sm md:text-base text-center lg:text-left">
                            Выберите специалиста для просмотра расписания
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

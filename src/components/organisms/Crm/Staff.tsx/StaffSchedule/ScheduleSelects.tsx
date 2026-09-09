import { useState, useEffect } from 'react';
import Select, { type SelectOption } from '../../../../atoms/Select';
import Typography from '../../../../atoms/Typography';
import { useQuery } from '@tanstack/react-query';
import { listBusinesses } from '../../../../../api/businesses';
import { getMasters } from '../../../../../api/staff';

interface ScheduleSelectsProps {
    onStaffSelect: (id: number | null) => void;
}

export default function ScheduleSelects({
    onStaffSelect
}: ScheduleSelectsProps) {
    const [selectedBusiness, setSelectedBusiness] =
        useState<SelectOption | null>(null);
    const [selectedSpecialist, setSelectedSpecialist] =
        useState<SelectOption | null>(null);

    const { data: rawBusinesses, isPending: isBusinessesPending } = useQuery({
        queryKey: ['businesses'],
        queryFn: listBusinesses
    });

    const rawBizData = rawBusinesses as any;
    const businessesList = Array.isArray(rawBizData)
        ? rawBizData
        : rawBizData?.data || rawBizData?.results || [];

    const businessOptions: SelectOption[] = businessesList.map((b: any) => ({
        id: b.id,
        label: b.name
    }));

    const activeBusiness = selectedBusiness || businessOptions[0];

    const { data: rawMasters, isPending: isMastersPending } = useQuery({
        queryKey: ['masters', activeBusiness?.id],
        queryFn: () => getMasters(Number(activeBusiness?.id)),
        enabled: !!activeBusiness?.id
    });

    const rawMastersData = rawMasters as any;
    const mastersList = Array.isArray(rawMastersData)
        ? rawMastersData
        : rawMastersData?.data || [];

    const specialistOptions: SelectOption[] = mastersList.map((m: any) => ({
        id: m.id,
        label: `${m.first_name} (${m.position})`
    }));

    const activeSpecialist = selectedSpecialist || specialistOptions[0];

    useEffect(() => {
        if (activeSpecialist?.id) {
            onStaffSelect(Number(activeSpecialist.id));
        } else {
            onStaffSelect(null);
        }
    }, [activeSpecialist?.id, onStaffSelect]);

    if (isBusinessesPending) {
        return <div>Загрузка бизнесов...</div>;
    }

    return (
        <div className="flex gap-3 items-end bg-white p-3 border border-[#c7c4d8] rounded-3xl w-fit">
            <div className="flex-1">
                <Typography text={'Бизнес'} className="text-sm px-3 mb-1 " />
                <Select
                    options={businessOptions}
                    value={activeBusiness ?? { id: 0, label: 'Нет данных' }}
                    onChange={setSelectedBusiness}
                    className="w-full min-w-[220px]"
                />
            </div>

            <div className="w-px h-8 bg-gray-200 mb-3"></div>

            <div className="flex-1 relative">
                <Typography
                    text={'Специалист'}
                    className="text-sm px-3 mb-1 "
                />

                <Select
                    options={specialistOptions}
                    value={
                        selectedSpecialist ||
                        (specialistOptions[0] ?? {
                            id: 0,
                            label: isMastersPending ? '' : 'Выберите мастера'
                        })
                    }
                    onChange={setSelectedSpecialist}
                    className={`w-full min-w-[220px] ${!activeBusiness || isMastersPending ? 'opacity-50 pointer-events-none' : ''}`}
                />

                {isMastersPending && (
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 text-xs text-gray-500 mt-2">
                        Загрузка...
                    </span>
                )}
            </div>
        </div>
    );
}

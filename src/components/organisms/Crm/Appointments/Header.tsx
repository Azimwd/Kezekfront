import { useQuery } from '@tanstack/react-query';
import Select, { type SelectOption } from '../../../atoms/Select';
import Typography from '../../../atoms/Typography';
import { listBusinesses } from '../../../../api/businesses';
import { useEffect } from 'react';
import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import { Plus } from 'lucide-react';
import { useBusiness } from '../../../../context/BusinessContext';

export default function Header() {
    const { selectedBusiness, setSelectedBusiness } = useBusiness();

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

    useEffect(() => {
        if (businessOptions.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businessOptions[0]);
        }
    }, [businessesList, selectedBusiness, setSelectedBusiness]);

    if (isBusinessesPending) {
        return <div>Загрузка бизнесов...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-5">
            <div className="flex flex-col">
                <Typography
                    text={'Записи'}
                    className="font-bold text-3xl mb-1"
                />
                <Typography
                    text={
                        'Управляйте бронированиями клиентов, статусами и переносом времени.'
                    }
                    className="text-slate-500 text-sm"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
                <div className="w-full sm:w-[250px] bg-white">
                    <Select
                        options={businessOptions}
                        value={
                            selectedBusiness ?? { id: 0, label: 'Нет данных' }
                        }
                        onChange={setSelectedBusiness}
                        className="w-full border border-[#c7c4d8] rounded-xl"
                    />
                </div>

                <Button className="flex justify-center items-center w-full sm:w-auto px-6 py-3 border border-[#4031d0] bg-white text-[#4031d0] gap-2 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                    <Icon icon={Plus} size={20} />
                    <Typography
                        className="text-sm mr-2"
                        text={'Создать запись'}
                    />
                </Button>
            </div>
        </div>
    );
}

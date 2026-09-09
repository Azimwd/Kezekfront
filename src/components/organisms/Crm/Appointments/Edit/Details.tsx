import { formatDuration, type Duration } from 'date-fns';
import Typography from '../../../../atoms/Typography';
import Icon from '../../../../atoms/Icon';
import { Banknote, CalendarDays, Clock5, Scissors } from 'lucide-react';

interface DetailsProps {
    service_name: string;
    duration: Duration;
    description: string;
    price: string;
    format_date: string;
    format_time_from: string;
    format_time_to: string;
}

export default function Details({
    service_name,
    description,
    duration,
    price,
    format_date,
    format_time_from,
    format_time_to
}: DetailsProps) {
    const formattDuration = formatDuration(duration);

    return (
        <div className="px-6 py-4 bg-[#fff] border border-[#c7c4d8] rounded-2xl w-full flex flex-col gap-4">
            <Typography
                text={'Детали услуги'}
                className="text-xl font-medium "
            />
            <div className="grid grid-cols-[1fr_1fr] py-5">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#dce9ff] rounded-md">
                            <Icon icon={Scissors} className="text-[#4F46E5]" />
                        </div>
                        <div className="flex flex-col ">
                            <Typography
                                text={service_name}
                                className="font-medium text-xl"
                            />
                            <Typography
                                text={description}
                                className=" text-md"
                            />
                        </div>
                    </div>
                    <div className="flex gap-5">
                        <div className="flex flex-col">
                            <Typography
                                text={'Длительность'}
                                className="text-sm"
                            />
                            <div className="flex items-center gap-1">
                                <Icon
                                    icon={Clock5}
                                    size={13}
                                    className="mt-[2px] text-[#525252]"
                                />
                                <Typography
                                    text={formattDuration}
                                    className="text-md"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Typography
                                text={'Стоимость'}
                                className="text-sm"
                            />
                            <div className="flex items-center gap-1">
                                <Icon
                                    icon={Banknote}
                                    size={15}
                                    className="mt-[2px] text-[#525252]"
                                />
                                <Typography text={price} className="text-md " />
                                <Typography text={'₸'} className="text-md " />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="">
                    <Typography
                        text={'Время'}
                        className="uppercase text-xs tracking-wider"
                    />
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Icon
                                icon={CalendarDays}
                                size={23}
                                className="text-[#4F46E5]"
                            />
                            <Typography
                                text={format_date}
                                className="text-xl text-[#000000] font-medium"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Icon
                                icon={Clock5}
                                size={23}
                                className="text-[#4F46E5]"
                            />
                            <Typography
                                text={`${format_time_from} - ${format_time_to}`}
                                className="text-xl text-[#4F46E5] font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

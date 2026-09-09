import { User } from 'lucide-react';

import Icon from '../../../../atoms/Icon';
import Typography from '../../../../atoms/Typography';

interface ClientInforProps {
    name: string;
    last_name: string;
    phone_num: string;
    client_ltv: string;
    client_total_visit: number;
}

export default function ClientInfo({
    name,
    last_name,
    phone_num,
    client_ltv,
    client_total_visit
}: ClientInforProps) {
    return (
        <div className="w-full rounded-2xl border border-[#c7c4d8] bg-white px-6 py-5">
            <Typography
                text="Информация о клиенте"
                className="text-xl font-medium text-[#111827]"
            />

            <div className=" flex items-center gap-6 mt-6 py-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#4F46E5] bg-[#dce9ff]">
                    <Icon icon={User} size={28} className="text-[#4F46E5]" />
                </div>

                <div className="grid flex-1 grid-cols-3 gap-12">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                            <Typography
                                text={name}
                                className="text-lg font-medium text-[#111827]"
                            />

                            <Typography
                                text={last_name}
                                className="text-lg font-medium text-[#111827]"
                            />
                        </div>

                        <div className="flex items-baseline gap-2">
                            <Typography
                                text={client_total_visit}
                                className="text-base font-medium text-[#4F46E5]"
                            />
                            <Typography
                                text="визитов"
                                className="text-sm text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Typography
                            text="Номер"
                            className="text-sm text-gray-500"
                        />
                        <Typography
                            text={phone_num}
                            className="text-base font-medium text-[#111827]"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Typography
                            text="LTV"
                            className="text-sm text-gray-500"
                        />
                        <div className="flex gap-1">
                            <Typography
                                text={client_ltv}
                                className="text-base font-medium text-[#111827]"
                            />
                            <Typography
                                text={'₸'}
                                className="text-base font-medium text-[#111827]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

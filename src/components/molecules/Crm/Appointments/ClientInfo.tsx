import {
    Phone,
    User
} from 'lucide-react';

import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';


interface ClientInfoProps {
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
}: ClientInfoProps) {

    const fullName =
        `${name || ''} ${last_name || ''}`.trim();


    return (
        <div
            className="
                w-full
                rounded-2xl
                border
                border-[#E3E6ED]
                bg-white
                p-6
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
            "
        >

            <Typography
                text="Информация о клиенте"
                className="
                    text-xl
                    font-semibold
                    text-[#111827]
                "
            />


            <div
                className="
                    mt-5
                    border-t
                    border-[#EEF0F4]
                    pt-5
                "
            >

                <div
                    className="
                        flex
                        items-start
                        gap-5
                    "
                >

                    <div
                        className="
                            flex
                            h-14
                            w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#EEF2FF]
                        "
                    >
                        <Icon
                            icon={User}
                            size={25}
                            className="text-[#4F46E5]"
                        />
                    </div>


                    <div className="min-w-0 flex-1">

                        <Typography
                            text={fullName || 'Клиент'}
                            className="
                                text-base
                                font-semibold
                                text-[#111827]
                            "
                        />


                        <div
                            className="
                                mt-5
                                grid
                                grid-cols-1
                                gap-5
                                sm:grid-cols-3
                            "
                        >

                            {/* PHONE */}

                            <div>

                                <Typography
                                    text="Телефон"
                                    className="
                                        text-xs
                                        text-slate-500
                                    "
                                />

                                <div
                                    className="
                                        mt-1
                                        flex
                                        items-center
                                        gap-1.5
                                    "
                                >
                                    <Icon
                                        icon={Phone}
                                        size={13}
                                        className="text-[#4F46E5]"
                                    />

                                    <Typography
                                        text={phone_num || 'Не указан'}
                                        className="
                                            text-sm
                                            font-medium
                                            text-[#111827]
                                        "
                                    />
                                </div>

                            </div>


                            {/* VISITS */}

                            <div>

                                <Typography
                                    text="Всего визитов"
                                    className="
                                        text-xs
                                        text-slate-500
                                    "
                                />

                                <Typography
                                    text={String(client_total_visit)}
                                    className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-[#4F46E5]
                                    "
                                />

                            </div>


                            {/* LTV */}

                            <div>

                                <Typography
                                    text="LTV"
                                    className="
                                        text-xs
                                        text-slate-500
                                    "
                                />

                                <Typography
                                    text={`${Number(client_ltv).toLocaleString('ru-RU')} ₸`}
                                    className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-[#111827]
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
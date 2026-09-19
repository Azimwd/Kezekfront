import {
    Clock3,
    Plus,
    Scissors,
    WalletCards
} from 'lucide-react';

import Icon from '../../../../atoms/Icon';
import Typography from '../../../../atoms/Typography';


export interface AppointmentAddon {
    id: number;
    addon: number | null;
    name: string;
    price: string;
    duration_minutes: number;
}


interface DetailsProps {
    service_name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    addons?: AppointmentAddon[];
}


export default function Details({
    service_name,
    description,
    duration_minutes,
    price,
    addons = []
}: DetailsProps) {

    const formatDuration = (
        minutes: number
    ) => {

        const hours =
            Math.floor(
                minutes / 60
            );

        const mins =
            minutes % 60;


        if (
            hours > 0 &&
            mins > 0
        ) {
            return `${hours} ч ${mins} мин`;
        }


        if (
            hours > 0
        ) {
            return `${hours} ч`;
        }


        return `${mins} мин`;
    };


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
                text="Детали услуги"
                className="
                    text-xl
                    font-semibold
                    text-[#111827]
                "
            />


            <div
                className="
                    mt-4
                    border-t
                    border-[#EEF0F4]
                    pt-5
                "
            >

                {/* MAIN SERVICE */}

                <div
                    className="
                        flex
                        items-start
                        gap-4
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#E8EEFF]
                        "
                    >
                        <Icon
                            icon={Scissors}
                            size={20}
                            className="text-[#4F46E5]"
                        />
                    </div>


                    <div className="min-w-0 flex-1">

                        <Typography
                            text={service_name}
                            className="
                                text-base
                                font-semibold
                                text-[#111827]
                            "
                        />


                        {description && (
                            <Typography
                                text={description}
                                className="
                                    mt-1
                                    text-sm
                                    leading-5
                                    text-slate-500
                                "
                            />
                        )}

                    </div>

                </div>


                {/* ADDONS */}

                {addons.length > 0 && (

                    <div
                        className="
                            mt-5
                            border-t
                            border-[#EEF0F4]
                            pt-4
                        "
                    >

                        <Typography
                            text="Дополнительные услуги"
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-500
                            "
                        />


                        <div
                            className="
                                mt-3
                                flex
                                flex-col
                                gap-2
                            "
                        >

                            {addons.map(
                                addon => (

                                    <div
                                        key={addon.id}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            rounded-xl
                                            bg-[#F7F8FC]
                                            px-4
                                            py-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    h-7
                                                    w-7
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-md
                                                    bg-white
                                                "
                                            >
                                                <Icon
                                                    icon={Plus}
                                                    size={14}
                                                    className="text-[#4F46E5]"
                                                />
                                            </div>


                                            <div className="min-w-0">

                                                <Typography
                                                    text={addon.name}
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-medium
                                                        text-[#111827]
                                                    "
                                                />


                                                {addon.duration_minutes > 0 && (
                                                    <Typography
                                                        text={`+ ${formatDuration(addon.duration_minutes)}`}
                                                        className="
                                                            mt-0.5
                                                            text-xs
                                                            text-slate-500
                                                        "
                                                    />
                                                )}

                                            </div>

                                        </div>


                                        <Typography
                                            text={`+ ${Number(addon.price).toLocaleString('ru-RU')} ₸`}
                                            className="
                                                shrink-0
                                                text-sm
                                                font-semibold
                                                text-[#111827]
                                            "
                                        />

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}


                {/* BOTTOM */}

                <div
                    className="
                        mt-5
                        flex
                        flex-wrap
                        gap-8
                        border-t
                        border-[#EEF0F4]
                        pt-4
                    "
                >

                    <div>

                        <Typography
                            text="Длительность"
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
                                icon={Clock3}
                                size={14}
                                className="text-slate-500"
                            />

                            <Typography
                                text={formatDuration(duration_minutes)}
                                className="
                                    text-sm
                                    font-medium
                                    text-[#111827]
                                "
                            />
                        </div>

                    </div>


                    <div>

                        <Typography
                            text="Стоимость"
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
                                icon={WalletCards}
                                size={14}
                                className="text-slate-500"
                            />

                            <Typography
                                text={`${Number(price).toLocaleString('ru-RU')} ₸`}
                                className="
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
    );
}
import {
    ChevronRight
} from 'lucide-react';


const appointments = [
    {
        time: '09:00',
        client: 'Ольга Н.',
        service: 'Стрижка',
        staff: 'Мария'
    },
    {
        time: '10:30',
        client: 'Сабина К.',
        service: 'Окрашивание',
        staff: 'Айгерим'
    }
];


export default function TomorrowCard() {

    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[#D9DDED]
                bg-white
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[#E8EAF2]
                    px-4
                    py-3
                "
            >

                <div
                    className="
                        text-xs
                        font-semibold
                        text-slate-800
                    "
                >
                    Завтра, 14 Нояб
                </div>


                <ChevronRight
                    size={15}
                    className="
                        text-[#4F46E5]
                    "
                />

            </div>


            <div
                className="
                    space-y-4
                    p-4
                "
            >

                {appointments.map(
                    item => (

                        <div
                            key={
                                item.time
                            }
                            className="
                                grid
                                grid-cols-[44px_1fr]
                                gap-3
                            "
                        >

                            <div
                                className="
                                    text-[10px]
                                    font-medium
                                    text-slate-500
                                "
                            >
                                {item.time}
                            </div>


                            <div>

                                <div
                                    className="
                                        text-xs
                                        font-medium
                                        text-slate-800
                                    "
                                >
                                    {item.client}
                                </div>


                                <div
                                    className="
                                        mt-0.5
                                        text-[9px]
                                        text-slate-400
                                    "
                                >
                                    {item.service}
                                    {' '}
                                    ({item.staff})
                                </div>

                            </div>

                        </div>

                    )
                )}


                <div
                    className="
                        mt-3
                        space-y-2
                    "
                >
                    <div
                        className="
                            h-2
                            w-full
                            rounded
                            bg-slate-100
                        "
                    />

                    <div
                        className="
                            h-2
                            w-2/3
                            rounded
                            bg-slate-100
                        "
                    />
                </div>

            </div>

        </div>
    );
}
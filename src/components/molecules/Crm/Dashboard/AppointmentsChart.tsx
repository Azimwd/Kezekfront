const chartData = [
    {
        day: 'Пн',
        value: 6
    },
    {
        day: 'Вт',
        value: 8
    },
    {
        day: 'Ср',
        value: 5
    },
    {
        day: 'Чт',
        value: 10
    },
    {
        day: 'Пт',
        value: 7
    },
    {
        day: 'Сб',
        value: 12
    },
    {
        day: 'Вс',
        value: 9
    }
];


export default function AppointmentsChart() {

    const maxValue =
        Math.max(
            ...chartData.map(
                item =>
                    item.value
            )
        );


    return (
        <div
            className="
                h-full
                rounded-2xl
                border
                border-[#D9DDED]
                bg-white
                p-5
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                "
            >

                <div>

                    <h2
                        className="
                            text-[17px]
                            font-semibold
                            text-[#0F172A]
                        "
                    >
                        Динамика записей
                    </h2>


                    <p
                        className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                        "
                    >
                        Последние 7 дней
                    </p>

                </div>


                <div
                    className="
                        text-right
                    "
                >

                    <div
                        className="
                            text-[9px]
                            text-slate-400
                        "
                    >
                        Доход за 7 дн.
                    </div>


                    <div
                        className="
                            text-lg
                            font-bold
                            text-[#4F46E5]
                        "
                    >
                        145 000 ₸
                    </div>

                </div>

            </div>


            <div
                className="
                    mt-7
                    flex
                    h-[115px]
                    items-end
                    justify-between
                    gap-3
                    border-b
                    border-dashed
                    border-slate-200
                "
            >

                {chartData.map(
                    (
                        item,
                        index
                    ) => {

                        const height =
                            (
                                item.value /
                                maxValue
                            ) * 90;


                        return (
                            <div
                                key={
                                    item.day
                                }
                                className="
                                    flex
                                    flex-1
                                    flex-col
                                    items-center
                                    justify-end
                                "
                            >

                                <div
                                    style={{
                                        height:
                                            `${height}px`
                                    }}
                                    className={`
                                        w-full
                                        max-w-[46px]
                                        rounded-t-sm

                                        ${
                                            index ===
                                            chartData.length - 1

                                                ? 'bg-[#4F46E5]'

                                                : 'bg-[#D7E5FF]'
                                        }
                                    `}
                                />


                                <div
                                    className="
                                        mt-2
                                        text-[9px]
                                        text-slate-400
                                    "
                                >
                                    {item.day}
                                </div>

                            </div>
                        );
                    }
                )}

            </div>

        </div>
    );
}
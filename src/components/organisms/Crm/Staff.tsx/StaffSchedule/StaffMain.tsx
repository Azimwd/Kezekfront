import {
    useEffect,
    useState
} from 'react';

import {
    Clock,
    Coffee,
    Check,
    Frown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import {
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import {
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    format
} from 'date-fns';

import {
    ru
} from 'date-fns/locale';

import SidePage
    from '../../../SidePage';

import {
    getScheduleStaff,
    getScheduleStaffBreaks,
    getScheduleStaffDaysOff,
    patchScheduleStaff,
    patchScheduleStaffBreaks,
    deleteScheduleStaffBreaks,
    postScheduleStaffBreaks,
    postScheduleStaffDaysOff,
    patchScheduleStaffDaysOff,
    deleteScheduleStaffDaysOff
} from '../../../../../api/staff';


interface StaffMainProps {
    staffId: number;
}


interface DaySchedule {
    id: string;

    recordId?: number;

    breakRecordId?: number;

    dayOffRecordId?: number;

    dayName: string;

    date: Date;

    isWorking: boolean;

    startTime: string;

    endTime: string;

    hasBreak: boolean;

    breakStart: string;

    breakEnd: string;

    hasDayOff: boolean;

    dayOffDate?: string;

    dayOffReason?: string;
}


/*
 * ============================================================
 * BASE SCHEDULE
 * ============================================================
 */

const generateBaseSchedule = (
    weekStart: Date
): DaySchedule[] => {

    const days = [
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat',
        'sun'
    ];


    const dayNames = [
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
        'Воскресенье'
    ];


    return days.map(
        (
            id,
            index
        ) => {

            const date =
                new Date(
                    weekStart
                );


            date.setDate(
                date.getDate() +
                    index
            );


            return {
                id,

                dayName:
                    dayNames[index],

                date,

                isWorking:
                    false,

                startTime:
                    '10:00',

                endTime:
                    '18:00',

                hasBreak:
                    false,

                breakStart:
                    '13:00',

                breakEnd:
                    '14:00',

                hasDayOff:
                    false,

                dayOffReason:
                    ''
            };
        }
    );
};


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const HOUR_HEIGHT =
    60;


const timeToHours = (
    timeStr: string
): number => {

    const [
        hours,
        minutes
    ] =
        timeStr
            .split(':')
            .map(Number);


    return (
        hours +
        minutes / 60
    );
};


const getShortDayName = (
    dayName: string
) => {

    const shorts:
        Record<string, string> = {

        Понедельник:
            'Пн',

        Вторник:
            'Вт',

        Среда:
            'Ср',

        Четверг:
            'Чт',

        Пятница:
            'Пт',

        Суббота:
            'Сб',

        Воскресенье:
            'Вс'
    };


    return (
        shorts[dayName] ||
        dayName
    );
};


const reverseWeekdayMap:
    Record<string, number> = {

    mon:
        0,

    tue:
        1,

    wed:
        2,

    thu:
        3,

    fri:
        4,

    sat:
        5,

    sun:
        6
};


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function StaffMain({
    staffId
}: StaffMainProps) {

    const queryClient =
        useQueryClient();


    /*
     * ========================================================
     * WEEK
     * ========================================================
     */

    const [
        currentDate,
        setCurrentDate
    ] = useState(
        new Date()
    );


    const weekStart =
        startOfWeek(
            currentDate,
            {
                weekStartsOn:
                    1
            }
        );


    const weekEnd =
        endOfWeek(
            currentDate,
            {
                weekStartsOn:
                    1
            }
        );


    const weekStartIso =
        weekStart.toISOString();


    /*
     * ========================================================
     * SCHEDULE
     * ========================================================
     */

    const [
        schedule,
        setSchedule
    ] = useState<DaySchedule[]>(
        generateBaseSchedule(
            weekStart
        )
    );


    const workingDays =
        schedule.filter(
            day =>
                day.isWorking
        );


    let gridStartHour =
        8;


    let gridEndHour =
        20;


    if (
        workingDays.length >
        0
    ) {

        const startHours =
            workingDays.map(
                day =>
                    Math.floor(
                        timeToHours(
                            day.startTime
                        )
                    )
            );


        const endHours =
            workingDays.map(
                day =>
                    Math.ceil(
                        timeToHours(
                            day.endTime
                        )
                    )
            );


        gridStartHour =
            Math.max(
                0,
                Math.min(
                    ...startHours
                ) -
                    1
            );


        gridEndHour =
            Math.min(
                24,
                Math.max(
                    ...endHours
                ) +
                    1
            );
    }


    const GRID_HOURS =
        Array.from(
            {
                length:
                    gridEndHour -
                    gridStartHour +
                    1
            },
            (
                _,
                index
            ) => {

                const hour =
                    gridStartHour +
                    index;


                return `${String(
                    hour
                ).padStart(
                    2,
                    '0'
                )}:00`;
            }
        );


    /*
     * ========================================================
     * EDIT
     * ========================================================
     */

    const [
        selectedDay,
        setSelectedDay
    ] = useState<DaySchedule | null>(
        null
    );


    const [
        editForm,
        setEditForm
    ] = useState<DaySchedule | null>(
        null
    );


    /*
     * ========================================================
     * WEEK LABEL
     * ========================================================
     */

    const formatWeekRange =
        () => {

            const startFormat =
                format(
                    weekStart,
                    'd',
                    {
                        locale:
                            ru
                    }
                );


            const endFormat =
                format(
                    weekEnd,
                    'd MMMM yyyy',
                    {
                        locale:
                            ru
                    }
                );


            if (
                weekStart.getMonth() !==
                weekEnd.getMonth()
            ) {

                return `${
                    format(
                        weekStart,
                        'd MMMM',
                        {
                            locale:
                                ru
                        }
                    )
                } – ${endFormat}`;
            }


            return `${startFormat}–${endFormat}`;
        };


    const handlePrevWeek =
        () =>
            setCurrentDate(
                prev =>
                    subWeeks(
                        prev,
                        1
                    )
            );


    const handleNextWeek =
        () =>
            setCurrentDate(
                prev =>
                    addWeeks(
                        prev,
                        1
                    )
            );


    /*
     * ========================================================
     * QUERIES
     * ========================================================
     */

    const {
        data:
            scheduleData,

        isLoading:
            isLoadingSchedule
    } = useQuery({

        queryKey: [
            'staffSchedule',
            staffId,
            weekStartIso
        ],

        queryFn: () =>
            getScheduleStaff(
                staffId
            ),

        enabled:
            !!staffId
    });


    const {
        data:
            breaksData,

        isLoading:
            isLoadingBreaks
    } = useQuery({

        queryKey: [
            'staffBreaks',
            staffId,
            weekStartIso
        ],

        queryFn: () =>
            getScheduleStaffBreaks(
                staffId
            ),

        enabled:
            !!staffId
    });


    const {
        data:
            daysOffData,

        isLoading:
            isLoadingDaysOff
    } = useQuery({

        queryKey: [
            'staffDaysOff',
            staffId,
            weekStartIso
        ],

        queryFn: () =>
            getScheduleStaffDaysOff(
                staffId
            ),

        enabled:
            !!staffId
    });


    /*
     * ========================================================
     * UPDATE SCHEDULE
     * ========================================================
     */

    const updateScheduleMutation =
        useMutation({

            mutationFn:
                (
                    data: {
                        id:
                            number;

                        weekday:
                            number;

                        start_time:
                            string;

                        end_time:
                            string;

                        is_working_day:
                            boolean;
                    }
                ) =>
                    patchScheduleStaff(
                        data.id,
                        data.weekday,
                        data.start_time,
                        data.end_time,
                        data.is_working_day
                    ),


            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: [
                        'staffSchedule',
                        staffId
                    ]
                })
        });


    /*
     * ========================================================
     * BREAKS
     * ========================================================
     */

    const createBreakMutation =
        useMutation({

            mutationFn:
                (
                    data: {
                        staffId:
                            number;

                        weekday:
                            number;

                        start_time:
                            string;

                        end_time:
                            string;
                    }
                ) =>
                    postScheduleStaffBreaks(
                        data.staffId,
                        data.weekday,
                        data.start_time,
                        data.end_time
                    ),


            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: [
                        'staffBreaks',
                        staffId
                    ]
                })
        });


    const updateBreakMutation =
        useMutation({

            mutationFn:
                (
                    data: {
                        id:
                            number;

                        weekday:
                            number;

                        start_time:
                            string;

                        end_time:
                            string;
                    }
                ) =>
                    patchScheduleStaffBreaks(
                        data.id,
                        data.weekday,
                        data.start_time,
                        data.end_time
                    ),


            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: [
                        'staffBreaks',
                        staffId
                    ]
                })
        });


    const deleteBreakMutation =
        useMutation({

            mutationFn:
                (
                    id:
                        number
                ) =>
                    deleteScheduleStaffBreaks(
                        id
                    ),


            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: [
                        'staffBreaks',
                        staffId
                    ]
                })
        });


    /*
     * ========================================================
     * DAYS OFF
     * ========================================================
     */

    const createDayOffMutation =
        useMutation({

            mutationFn:
                (
                    data: {
                        staffId:
                            number;

                        date:
                            string;

                        reason:
                            string;
                    }
                ) =>
                    postScheduleStaffDaysOff(
                        data.staffId,
                        data.date,
                        data.reason
                    ),


            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: [
                        'staffDaysOff',
                        staffId
                    ]
                })
        });


    const updateDayOffMutation =
        useMutation({

            mutationFn:
                (
                    data: {
                        id:
                            number;

                        date:
                            string;

                        reason:
                            string;
                    }
                ) =>
                    patchScheduleStaffDaysOff(
                        data.id,
                        data.date,
                        data.reason
                    ),


            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: [
                        'staffDaysOff',
                        staffId
                    ]
                })
        });


    const deleteDayOffMutation =
        useMutation({

            mutationFn:
                (
                    id:
                        number
                ) =>
                    deleteScheduleStaffDaysOff(
                        id
                    ),


            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: [
                        'staffDaysOff',
                        staffId
                    ]
                })
        });


    /*
     * ========================================================
     * STATES
     * ========================================================
     */

    const isLoading =
        isLoadingSchedule ||
        isLoadingBreaks ||
        isLoadingDaysOff;


    const isSaving =
        updateScheduleMutation.isPending ||
        createBreakMutation.isPending ||
        updateBreakMutation.isPending ||
        deleteBreakMutation.isPending ||
        createDayOffMutation.isPending ||
        updateDayOffMutation.isPending ||
        deleteDayOffMutation.isPending;


    /*
     * ========================================================
     * FORMAT BACKEND DATA
     * ========================================================
     */

    useEffect(
        () => {

            if (
                !scheduleData
            ) {
                return;
            }


            const extractArray =
                (
                    data:
                        any
                ) =>
                    Array.isArray(
                        data
                    )
                        ? data
                        : data?.data ||
                            [];


            const schedules =
                extractArray(
                    scheduleData
                );


            const breaks =
                extractArray(
                    breaksData
                );


            const daysOff =
                extractArray(
                    daysOffData
                );


            const baseWeekSchedule =
                generateBaseSchedule(
                    weekStart
                );


            const formattedSchedule =
                baseWeekSchedule.map(
                    (
                        day,
                        index
                    ) => {

                        const targetDateStr =
                            format(
                                day.date,
                                'yyyy-MM-dd'
                            );


                        const backendDayData =
                            schedules.find(
                                (
                                    item:
                                        any
                                ) =>
                                    item.weekday ===
                                    index
                            );


                        const backendBreakData =
                            breaks.find(
                                (
                                    item:
                                        any
                                ) =>
                                    item.weekday ===
                                    index
                            );


                        const backendDayOffData =
                            daysOff.find(
                                (
                                    item:
                                        any
                                ) =>
                                    item.date ===
                                    targetDateStr
                            );


                        const updatedDay = {
                            ...day
                        };


                        if (
                            backendDayData
                        ) {

                            updatedDay.recordId =
                                backendDayData.id;


                            updatedDay.isWorking =
                                backendDayData.is_working_day;


                            updatedDay.startTime =
                                backendDayData.start_time.slice(
                                    0,
                                    5
                                );


                            updatedDay.endTime =
                                backendDayData.end_time.slice(
                                    0,
                                    5
                                );
                        }


                        if (
                            backendBreakData
                        ) {

                            updatedDay.breakRecordId =
                                backendBreakData.id;


                            updatedDay.hasBreak =
                                true;


                            updatedDay.breakStart =
                                backendBreakData.start_time.slice(
                                    0,
                                    5
                                );


                            updatedDay.breakEnd =
                                backendBreakData.end_time.slice(
                                    0,
                                    5
                                );

                        } else {

                            updatedDay.hasBreak =
                                false;
                        }


                        if (
                            backendDayOffData
                        ) {

                            updatedDay.hasDayOff =
                                true;


                            updatedDay.dayOffRecordId =
                                backendDayOffData.id;


                            updatedDay.dayOffReason =
                                backendDayOffData.reason ||
                                '';


                            updatedDay.dayOffDate =
                                backendDayOffData.date;

                        } else {

                            updatedDay.hasDayOff =
                                false;


                            updatedDay.dayOffRecordId =
                                undefined;


                            updatedDay.dayOffReason =
                                '';


                            updatedDay.dayOffDate =
                                undefined;
                        }


                        return updatedDay;
                    }
                );


            setSchedule(
                formattedSchedule
            );

        },
        [
            scheduleData,
            breaksData,
            daysOffData,
            weekStartIso
        ]
    );


    /*
     * ========================================================
     * OPEN EDITOR
     * ========================================================
     */

    const handleOpenSidePage =
        (
            day:
                DaySchedule
        ) => {

            setSelectedDay(
                day
            );


            const dateString =
                format(
                    day.date,
                    'yyyy-MM-dd'
                );


            const autoDate =
                day.dayOffDate ||
                dateString;


            setEditForm({
                ...day,

                dayOffDate:
                    autoDate
            });
        };


    /*
     * ========================================================
     * SAVE
     * ========================================================
     */

    const handleSaveSchedule =
        () => {

            if (
                !editForm
            ) {
                return;
            }


            const weekdayIndex =
                reverseWeekdayMap[
                    editForm.id
                ];


            /*
             * WORKING HOURS
             */

            if (
                editForm.recordId
            ) {

                updateScheduleMutation.mutate({

                    id:
                        editForm.recordId,

                    weekday:
                        weekdayIndex,

                    start_time:
                        editForm.startTime.length ===
                        5
                            ? `${editForm.startTime}:00`
                            : editForm.startTime,

                    end_time:
                        editForm.endTime.length ===
                        5
                            ? `${editForm.endTime}:00`
                            : editForm.endTime,

                    is_working_day:
                        editForm.isWorking
                });
            }


            /*
             * BREAK
             */

            if (
                editForm.isWorking &&
                editForm.hasBreak
            ) {

                if (
                    editForm.breakRecordId
                ) {

                    updateBreakMutation.mutate({

                        id:
                            editForm.breakRecordId,

                        weekday:
                            weekdayIndex,

                        start_time:
                            editForm.breakStart.length ===
                            5
                                ? `${editForm.breakStart}:00`
                                : editForm.breakStart,

                        end_time:
                            editForm.breakEnd.length ===
                            5
                                ? `${editForm.breakEnd}:00`
                                : editForm.breakEnd
                    });

                } else {

                    createBreakMutation.mutate({

                        staffId,

                        weekday:
                            weekdayIndex,

                        start_time:
                            editForm.breakStart.length ===
                            5
                                ? `${editForm.breakStart}:00`
                                : editForm.breakStart,

                        end_time:
                            editForm.breakEnd.length ===
                            5
                                ? `${editForm.breakEnd}:00`
                                : editForm.breakEnd
                    });
                }

            } else if (
                editForm.breakRecordId
            ) {

                deleteBreakMutation.mutate(
                    editForm.breakRecordId
                );
            }


            /*
             * INDIVIDUAL DAY OFF
             */

            if (
                editForm.hasDayOff
            ) {

                const reason =
                    editForm.dayOffReason?.trim() ||
                    'Личный выходной';


                if (
                    editForm.dayOffRecordId
                ) {

                    updateDayOffMutation.mutate({

                        id:
                            editForm.dayOffRecordId,

                        date:
                            editForm.dayOffDate!,

                        reason
                    });

                } else {

                    createDayOffMutation.mutate({

                        staffId,

                        date:
                            editForm.dayOffDate!,

                        reason
                    });
                }

            } else if (
                editForm.dayOffRecordId
            ) {

                deleteDayOffMutation.mutate(
                    editForm.dayOffRecordId
                );
            }


            /*
             * LOCAL UPDATE
             */

            setSchedule(
                prev =>
                    prev.map(
                        item =>
                            item.id ===
                            editForm.id
                                ? editForm
                                : item
                    )
            );


            setSelectedDay(
                null
            );
        };


    /*
     * ========================================================
     * LOADING
     * ========================================================
     */

    if (
        isLoading
    ) {

        return (
            <div
                className="
                    flex
                    h-40
                    items-center
                    justify-center
                    p-4
                    text-sm
                    text-slate-500

                    md:p-8
                    md:text-base
                "
            >

                <span
                    className="
                        animate-pulse
                    "
                >
                    Загрузка расписания...
                </span>

            </div>
        );
    }


    /*
     * ========================================================
     * RENDER
     * ========================================================
     */

    return (
        <div
            className="
                w-full
                min-w-0
                rounded-2xl
                border
                border-[#e2e4f0]
                bg-white
                p-4
                shadow-sm

                sm:p-5

                md:border-none
                md:shadow-none

                lg:rounded-3xl
                lg:p-8
            "
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    mb-5
                    flex
                    flex-col
                    gap-4

                    md:flex-row
                    md:items-center
                    md:justify-between

                    lg:mb-8
                "
            >

                <div
                    className="
                        w-full
                        min-w-0

                        md:w-auto
                    "
                >

                    <h1
                        className="
                            text-lg
                            font-bold
                            text-slate-900

                            md:text-2xl
                        "
                    >
                        Еженедельный график
                    </h1>


                    <p
                        className="
                            mt-1
                            text-[12px]
                            leading-5
                            text-slate-500

                            md:text-sm
                        "
                    >
                        Выберите день, чтобы изменить рабочее время,
                        перерыв или выходной.
                    </p>

                </div>


                {/* WEEK SWITCHER */}

                <div
                    className="
                        flex
                        w-full
                        min-w-0
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-1

                        md:w-auto
                        md:border-none
                        md:bg-transparent
                        md:p-0
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handlePrevWeek
                        }
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            text-[#4031d0]
                            transition-colors
                            hover:bg-slate-200

                            md:rounded-full
                            md:hover:bg-slate-100
                        "
                    >
                        <ChevronLeft
                            className="
                                h-5
                                w-5

                                md:h-6
                                md:w-6
                            "
                        />
                    </button>


                    <div
                        className="
                            min-w-0
                            flex-1
                            px-2
                            text-center
                            text-[13px]
                            font-semibold
                            text-[#4031d0]

                            sm:text-sm

                            md:min-w-[170px]
                            md:text-base
                        "
                    >
                        {formatWeekRange()}
                    </div>


                    <button
                        type="button"
                        onClick={
                            handleNextWeek
                        }
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            text-[#4031d0]
                            transition-colors
                            hover:bg-slate-200

                            md:rounded-full
                            md:hover:bg-slate-100
                        "
                    >
                        <ChevronRight
                            className="
                                h-5
                                w-5

                                md:h-6
                                md:w-6
                            "
                        />
                    </button>

                </div>

            </div>


            {/* =================================================
                MOBILE
            ================================================= */}

            <div
                className="
                    flex
                    flex-col
                    gap-3

                    md:hidden
                "
            >

                {schedule.map(
                    day => {

                        return (
                            <button
                                key={
                                    day.id
                                }
                                type="button"
                                onClick={() =>
                                    handleOpenSidePage(
                                        day
                                    )
                                }
                                className="
                                    w-full
                                    cursor-pointer
                                    rounded-2xl
                                    border
                                    border-[#e2e4f0]
                                    bg-white
                                    p-4
                                    text-left
                                    shadow-sm
                                    transition
                                    active:scale-[0.99]
                                "
                            >

                                {/* TOP */}

                                <div
                                    className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-3
                                    "
                                >

                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <div
                                            className="
                                                text-[15px]
                                                font-semibold
                                                text-slate-900
                                            "
                                        >
                                            {
                                                day.dayName
                                            }
                                        </div>


                                        <div
                                            className="
                                                mt-0.5
                                                text-[12px]
                                                text-slate-500
                                            "
                                        >
                                            {
                                                format(
                                                    day.date,
                                                    'd MMMM',
                                                    {
                                                        locale:
                                                            ru
                                                    }
                                                )
                                            }
                                        </div>

                                    </div>


                                    {/* STATUS */}

                                    {day.hasDayOff ? (

                                        <span
                                            className="
                                                shrink-0
                                                rounded-full
                                                bg-[#EEF4FF]
                                                px-2.5
                                                py-1
                                                text-[10px]
                                                font-semibold
                                                text-[#475467]
                                            "
                                        >
                                            Выходной
                                        </span>

                                    ) : day.isWorking ? (

                                        <span
                                            className="
                                                shrink-0
                                                rounded-full
                                                bg-[#EEF2FF]
                                                px-2.5
                                                py-1
                                                text-[10px]
                                                font-semibold
                                                text-[#4031d0]
                                            "
                                        >
                                            Рабочий
                                        </span>

                                    ) : (

                                        <span
                                            className="
                                                shrink-0
                                                rounded-full
                                                bg-slate-100
                                                px-2.5
                                                py-1
                                                text-[10px]
                                                font-semibold
                                                text-slate-500
                                            "
                                        >
                                            Не работает
                                        </span>

                                    )}

                                </div>


                                {/* DAY OFF */}

                                {day.hasDayOff ? (

                                    <div
                                        className="
                                            mt-4
                                            flex
                                            items-center
                                            gap-3
                                            rounded-xl
                                            border
                                            border-[#d6e4fa]
                                            bg-[#eef4ff]
                                            p-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-white
                                            "
                                        >
                                            <Frown
                                                className="
                                                    h-5
                                                    w-5
                                                    text-slate-500
                                                "
                                            />
                                        </div>


                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >

                                            <div
                                                className="
                                                    text-[12px]
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >
                                                Индивидуальный выходной
                                            </div>


                                            <div
                                                className="
                                                    mt-0.5
                                                    truncate
                                                    text-[11px]
                                                    text-slate-500
                                                "
                                            >
                                                {
                                                    day.dayOffReason ||
                                                    'Личный выходной'
                                                }
                                            </div>

                                        </div>

                                    </div>

                                ) : day.isWorking ? (

                                    <div
                                        className="
                                            mt-4
                                            grid
                                            grid-cols-2
                                            gap-3
                                        "
                                    >

                                        {/* WORK */}

                                        <div
                                            className="
                                                rounded-xl
                                                bg-[#eff4ff]
                                                p-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-1.5
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-[#4031d0]
                                                "
                                            >
                                                <Clock
                                                    className="
                                                        h-3.5
                                                        w-3.5
                                                    "
                                                />

                                                Работа
                                            </div>


                                            <div
                                                className="
                                                    mt-1.5
                                                    text-[13px]
                                                    font-semibold
                                                    text-slate-800
                                                "
                                            >
                                                {
                                                    day.startTime
                                                }
                                                {' – '}
                                                {
                                                    day.endTime
                                                }
                                            </div>

                                        </div>


                                        {/* BREAK */}

                                        <div
                                            className={`
                                                rounded-xl
                                                p-3

                                                ${
                                                    day.hasBreak
                                                        ? `
                                                            bg-[#fff9eb]
                                                        `
                                                        : `
                                                            bg-slate-50
                                                        `
                                                }
                                            `}
                                        >

                                            <div
                                                className={`
                                                    flex
                                                    items-center
                                                    gap-1.5
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide

                                                    ${
                                                        day.hasBreak
                                                            ? `
                                                                text-[#b45309]
                                                            `
                                                            : `
                                                                text-slate-400
                                                            `
                                                    }
                                                `}
                                            >

                                                <Coffee
                                                    className="
                                                        h-3.5
                                                        w-3.5
                                                    "
                                                />

                                                Перерыв

                                            </div>


                                            <div
                                                className="
                                                    mt-1.5
                                                    text-[13px]
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >
                                                {
                                                    day.hasBreak
                                                        ? `${day.breakStart} – ${day.breakEnd}`
                                                        : 'Нет'
                                                }
                                            </div>

                                        </div>

                                    </div>

                                ) : (

                                    <div
                                        className="
                                            mt-4
                                            rounded-xl
                                            bg-slate-50
                                            px-3
                                            py-4
                                            text-center
                                            text-[12px]
                                            font-medium
                                            text-slate-400
                                        "
                                    >
                                        Нерабочий день
                                    </div>

                                )}

                            </button>
                        );
                    }
                )}

            </div>


            {/* =================================================
                DESKTOP WEEK GRID
            ================================================= */}

            <div
                className="
                    hidden
                    w-full
                    overflow-x-auto
                    pb-3

                    md:block
                    md:pb-0
                "
            >

                <div
                    className="
                        min-w-[800px]
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#e2e4f0]

                        lg:min-w-full
                    "
                >

                    {/* HEADER */}

                    <div
                        className="
                            grid
                            grid-cols-[60px_repeat(7,1fr)]
                            border-b
                            border-[#e2e4f0]
                            bg-slate-50/60
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-center
                                border-r
                                border-[#e2e4f0]
                                px-2
                                py-4
                                text-center
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-slate-400
                            "
                        >
                            Время
                        </div>


                        {schedule.map(
                            day => (

                                <div
                                    key={
                                        day.id
                                    }
                                    onClick={() =>
                                        handleOpenSidePage(
                                            day
                                        )
                                    }
                                    className="
                                        cursor-pointer
                                        border-r
                                        border-[#e2e4f0]
                                        px-3
                                        py-4
                                        text-center
                                        text-sm
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-700
                                        transition-colors
                                        last:border-r-0
                                        hover:bg-slate-100/80
                                    "
                                >

                                    <span
                                        className="
                                            lg:hidden
                                        "
                                    >
                                        {
                                            getShortDayName(
                                                day.dayName
                                            )
                                        }
                                    </span>


                                    <span
                                        className="
                                            hidden
                                            lg:inline
                                        "
                                    >
                                        {
                                            day.dayName
                                        }
                                    </span>


                                    <div
                                        className="
                                            mt-0.5
                                            text-[10px]
                                            font-medium
                                            text-slate-400

                                            lg:hidden
                                        "
                                    >
                                        {
                                            format(
                                                day.date,
                                                'dd.MM'
                                            )
                                        }
                                    </div>

                                </div>

                            )
                        )}

                    </div>


                    {/* GRID */}

                    <div
                        className="
                            relative
                            grid
                            grid-cols-[60px_repeat(7,1fr)]
                        "
                    >

                        {/* HOURS */}

                        <div
                            className="
                                border-r
                                border-[#e2e4f0]
                                bg-white
                            "
                        >

                            {GRID_HOURS
                                .slice(
                                    0,
                                    -1
                                )
                                .map(
                                    hour => (

                                        <div
                                            key={
                                                hour
                                            }
                                            style={{
                                                height:
                                                    `${HOUR_HEIGHT}px`
                                            }}
                                            className="
                                                flex
                                                items-start
                                                justify-center
                                                border-b
                                                border-[#f0f0f5]
                                                px-2
                                                pt-1
                                                text-[11px]
                                                font-semibold
                                                text-slate-400
                                            "
                                        >
                                            {
                                                hour
                                            }
                                        </div>

                                    )
                                )}

                        </div>


                        {/* DAYS */}

                        {schedule.map(
                            day => {

                                const startOffset =
                                    timeToHours(
                                        day.startTime
                                    ) -
                                    gridStartHour;


                                const endOffset =
                                    timeToHours(
                                        day.endTime
                                    ) -
                                    gridStartHour;


                                const blockTop =
                                    startOffset *
                                    HOUR_HEIGHT;


                                const blockHeight =
                                    (
                                        endOffset -
                                        startOffset
                                    ) *
                                    HOUR_HEIGHT;


                                const breakStartOffset =
                                    timeToHours(
                                        day.breakStart
                                    ) -
                                    timeToHours(
                                        day.startTime
                                    );


                                const breakEndOffset =
                                    timeToHours(
                                        day.breakEnd
                                    ) -
                                    timeToHours(
                                        day.startTime
                                    );


                                const breakTop =
                                    breakStartOffset *
                                    HOUR_HEIGHT;


                                const breakHeight =
                                    (
                                        breakEndOffset -
                                        breakStartOffset
                                    ) *
                                    HOUR_HEIGHT;


                                return (
                                    <div
                                        key={
                                            day.id
                                        }
                                        onClick={() =>
                                            handleOpenSidePage(
                                                day
                                            )
                                        }
                                        className="
                                            relative
                                            cursor-pointer
                                            border-r
                                            border-[#e2e4f0]
                                            transition-colors
                                            last:border-r-0
                                            hover:bg-slate-50/60
                                        "
                                        style={{
                                            height:
                                                `${
                                                    (
                                                        gridEndHour -
                                                        gridStartHour
                                                    ) *
                                                    HOUR_HEIGHT
                                                }px`
                                        }}
                                    >

                                        {GRID_HOURS.map(
                                            hour => (

                                                <div
                                                    key={
                                                        hour
                                                    }
                                                    style={{
                                                        height:
                                                            `${HOUR_HEIGHT}px`
                                                    }}
                                                    className="
                                                        w-full
                                                        border-b
                                                        border-[#f0f0f5]
                                                        last:border-b-0
                                                    "
                                                />

                                            )
                                        )}


                                        {/* WORK BLOCK */}

                                        {day.isWorking &&
                                            !day.hasDayOff &&
                                            blockHeight >
                                                0 && (

                                            <div
                                                style={{
                                                    top:
                                                        `${blockTop}px`,

                                                    height:
                                                        `${blockHeight}px`
                                                }}
                                                className="
                                                    absolute
                                                    left-1
                                                    right-1
                                                    z-10
                                                    overflow-hidden
                                                    rounded-r-lg
                                                    border-l-4
                                                    border-[#4031d0]
                                                    bg-[#eff4ff]
                                                    p-2.5
                                                    shadow-sm
                                                    transition-all
                                                    hover:ring-2
                                                    hover:ring-[#4031d0]/50
                                                "
                                            >

                                                <div
                                                    className="
                                                        truncate
                                                        text-xs
                                                        font-bold
                                                        leading-tight
                                                        text-[#4031d0]
                                                    "
                                                >
                                                    Рабочий день
                                                </div>


                                                <div
                                                    className="
                                                        mt-0.5
                                                        truncate
                                                        text-[11px]
                                                        font-medium
                                                        text-slate-600
                                                    "
                                                >
                                                    {
                                                        day.startTime
                                                    }
                                                    –
                                                    {
                                                        day.endTime
                                                    }
                                                </div>


                                                {day.hasBreak &&
                                                    breakHeight >
                                                        0 && (

                                                    <div
                                                        style={{
                                                            top:
                                                                `${breakTop}px`,

                                                            height:
                                                                `${breakHeight}px`
                                                        }}
                                                        className="
                                                            absolute
                                                            left-0
                                                            right-0
                                                            flex
                                                            flex-col
                                                            justify-center
                                                            border-l-4
                                                            border-[#f59e0b]
                                                            bg-[#fff9eb]
                                                            p-2
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                truncate
                                                                text-[11px]
                                                                font-semibold
                                                                leading-tight
                                                                text-[#b45309]
                                                            "
                                                        >
                                                            Перерыв
                                                        </div>


                                                        <div
                                                            className="
                                                                truncate
                                                                text-[10px]
                                                                text-slate-600
                                                            "
                                                        >
                                                            {
                                                                day.breakStart
                                                            }
                                                            –
                                                            {
                                                                day.breakEnd
                                                            }
                                                        </div>

                                                    </div>

                                                )}

                                            </div>

                                        )}


                                        {/* DAY OFF */}

                                        {day.hasDayOff && (

                                            <div
                                                className="
                                                    absolute
                                                    inset-1
                                                    bottom-24
                                                    top-24
                                                    z-20
                                                    flex
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    rounded-xl
                                                    border
                                                    border-[#d6e4fa]
                                                    bg-[#eef4ff]
                                                    px-1
                                                    shadow-sm
                                                "
                                            >

                                                <Frown
                                                    className="
                                                        mb-2
                                                        h-6
                                                        w-6
                                                        text-[#6b7280]
                                                        opacity-80
                                                    "
                                                />


                                                <div
                                                    className="
                                                        text-center
                                                        text-xs
                                                        font-bold
                                                        leading-tight
                                                        text-[#334155]
                                                    "
                                                >
                                                    Индивидуальный выходной
                                                </div>


                                                <div
                                                    className="
                                                        mt-1
                                                        line-clamp-2
                                                        text-center
                                                        text-xs
                                                        font-medium
                                                        leading-tight
                                                        text-[#64748b]
                                                    "
                                                >
                                                    {
                                                        day.dayOffReason ||
                                                        'Личный выходной'
                                                    }
                                                </div>

                                            </div>

                                        )}


                                        {/* OFF */}

                                        {!day.isWorking &&
                                            !day.hasDayOff && (

                                            <div
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    inset-0
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                            >

                                                <span
                                                    className="
                                                        -rotate-90
                                                        text-xs
                                                        font-medium
                                                        uppercase
                                                        tracking-widest
                                                        text-slate-300
                                                    "
                                                >
                                                    Выходной
                                                </span>

                                            </div>

                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                SIDE PAGE
            ================================================= */}

            <SidePage
                isOpen={
                    !!selectedDay
                }
                onClose={() =>
                    setSelectedDay(
                        null
                    )
                }
                title={
                    editForm
                        ? `Настройка: ${editForm.dayName}`
                        : 'Расписание'
                }
                description="Установите рабочее время, перерыв или индивидуальный выходной"
                maxWidth="max-w-md"
            >

                {editForm && (

                    <div
                        className="
                            flex
                            h-full
                            min-w-0
                            flex-col
                            justify-between
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-5

                                md:gap-6
                            "
                        >

                            {/* =========================================
                                WORK SWITCH
                            ========================================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-3.5

                                    md:rounded-2xl
                                    md:p-4
                                "
                            >

                                <span
                                    className="
                                        text-sm
                                        font-semibold
                                        text-slate-800
                                    "
                                >
                                    Рабочий день
                                </span>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditForm({
                                            ...editForm,

                                            isWorking:
                                                !editForm.isWorking
                                        })
                                    }
                                    className={`
                                        relative
                                        flex
                                        h-7
                                        w-12
                                        shrink-0
                                        cursor-pointer
                                        items-center
                                        rounded-full
                                        px-1
                                        transition-colors
                                        duration-200

                                        ${
                                            editForm.isWorking
                                                ? `
                                                    bg-[#4031d0]
                                                `
                                                : `
                                                    bg-slate-300
                                                `
                                        }
                                    `}
                                >

                                    <div
                                        className={`
                                            h-5
                                            w-5
                                            transform
                                            rounded-full
                                            bg-white
                                            shadow-sm
                                            transition-transform
                                            duration-200

                                            ${
                                                editForm.isWorking
                                                    ? `
                                                        translate-x-5
                                                    `
                                                    : `
                                                        translate-x-0
                                                    `
                                            }
                                        `}
                                    />

                                </button>

                            </div>


                            {/* =========================================
                                WORK HOURS
                            ========================================= */}

                            {editForm.isWorking && (

                                <>

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-3
                                        "
                                    >

                                        <label
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-slate-500
                                            "
                                        >

                                            <Clock
                                                className="
                                                    h-4
                                                    w-4
                                                    text-slate-400
                                                "
                                            />

                                            Рабочие часы

                                        </label>


                                        <div
                                            className="
                                                grid
                                                grid-cols-1
                                                gap-3

                                                sm:grid-cols-[1fr_auto_1fr]
                                                sm:items-end
                                            "
                                        >

                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <span
                                                    className="
                                                        mb-1
                                                        block
                                                        text-xs
                                                        text-slate-400
                                                    "
                                                >
                                                    Начало
                                                </span>


                                                <input
                                                    type="time"
                                                    value={
                                                        editForm.startTime
                                                    }
                                                    onChange={
                                                        event =>
                                                            setEditForm({
                                                                ...editForm,

                                                                startTime:
                                                                    event.target.value
                                                            })
                                                    }
                                                    className="
                                                        h-11
                                                        w-full
                                                        min-w-0
                                                        rounded-xl
                                                        border
                                                        border-slate-300
                                                        bg-[#fcfcfd]
                                                        px-3
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                        outline-none
                                                        focus:border-[#4031d0]
                                                        focus:ring-1
                                                        focus:ring-[#4031d0]
                                                    "
                                                />

                                            </div>


                                            <span
                                                className="
                                                    hidden
                                                    pb-3
                                                    text-slate-400

                                                    sm:block
                                                "
                                            >
                                                –
                                            </span>


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <span
                                                    className="
                                                        mb-1
                                                        block
                                                        text-xs
                                                        text-slate-400
                                                    "
                                                >
                                                    Конец
                                                </span>


                                                <input
                                                    type="time"
                                                    value={
                                                        editForm.endTime
                                                    }
                                                    onChange={
                                                        event =>
                                                            setEditForm({
                                                                ...editForm,

                                                                endTime:
                                                                    event.target.value
                                                            })
                                                    }
                                                    className="
                                                        h-11
                                                        w-full
                                                        min-w-0
                                                        rounded-xl
                                                        border
                                                        border-slate-300
                                                        bg-[#fcfcfd]
                                                        px-3
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                        outline-none
                                                        focus:border-[#4031d0]
                                                        focus:ring-1
                                                        focus:ring-[#4031d0]
                                                    "
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* =================================
                                        BREAK
                                    ================================= */}

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-3
                                            border-t
                                            border-slate-100
                                            pt-4
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-3
                                            "
                                        >

                                            <label
                                                className="
                                                    flex
                                                    items-center
                                                    gap-1.5
                                                    text-xs
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-slate-500
                                                "
                                            >

                                                <Coffee
                                                    className="
                                                        h-4
                                                        w-4
                                                        shrink-0
                                                        text-amber-500
                                                    "
                                                />

                                                Обеденный перерыв

                                            </label>


                                            <input
                                                type="checkbox"
                                                checked={
                                                    editForm.hasBreak
                                                }
                                                onChange={
                                                    event =>
                                                        setEditForm({
                                                            ...editForm,

                                                            hasBreak:
                                                                event.target.checked
                                                        })
                                                }
                                                className="
                                                    h-5
                                                    w-5
                                                    shrink-0
                                                    rounded
                                                    border-slate-300
                                                    text-[#4031d0]
                                                    focus:ring-[#4031d0]
                                                "
                                            />

                                        </div>


                                        {editForm.hasBreak && (

                                            <div
                                                className="
                                                    mt-1
                                                    grid
                                                    grid-cols-1
                                                    gap-3

                                                    sm:grid-cols-[1fr_auto_1fr]
                                                    sm:items-end
                                                "
                                            >

                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            mb-1
                                                            block
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        С
                                                    </span>


                                                    <input
                                                        type="time"
                                                        value={
                                                            editForm.breakStart
                                                        }
                                                        onChange={
                                                            event =>
                                                                setEditForm({
                                                                    ...editForm,

                                                                    breakStart:
                                                                        event.target.value
                                                                })
                                                        }
                                                        className="
                                                            h-11
                                                            w-full
                                                            min-w-0
                                                            rounded-xl
                                                            border
                                                            border-slate-300
                                                            bg-[#fcfcfd]
                                                            px-3
                                                            text-sm
                                                            font-medium
                                                            text-slate-800
                                                            outline-none
                                                            focus:border-[#4031d0]
                                                            focus:ring-1
                                                            focus:ring-[#4031d0]
                                                        "
                                                    />

                                                </div>


                                                <span
                                                    className="
                                                        hidden
                                                        pb-3
                                                        text-slate-400

                                                        sm:block
                                                    "
                                                >
                                                    –
                                                </span>


                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            mb-1
                                                            block
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        До
                                                    </span>


                                                    <input
                                                        type="time"
                                                        value={
                                                            editForm.breakEnd
                                                        }
                                                        onChange={
                                                            event =>
                                                                setEditForm({
                                                                    ...editForm,

                                                                    breakEnd:
                                                                        event.target.value
                                                                })
                                                        }
                                                        className="
                                                            h-11
                                                            w-full
                                                            min-w-0
                                                            rounded-xl
                                                            border
                                                            border-slate-300
                                                            bg-[#fcfcfd]
                                                            px-3
                                                            text-sm
                                                            font-medium
                                                            text-slate-800
                                                            outline-none
                                                            focus:border-[#4031d0]
                                                            focus:ring-1
                                                            focus:ring-[#4031d0]
                                                        "
                                                    />

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </>

                            )}


                            {/* =========================================
                                INDIVIDUAL DAY OFF
                            ========================================= */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                    border-t
                                    border-slate-100
                                    pt-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-3
                                    "
                                >

                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >

                                            <Frown
                                                className="
                                                    h-4
                                                    w-4
                                                    shrink-0
                                                    text-slate-500
                                                "
                                            />


                                            <h3
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-slate-800
                                                "
                                            >
                                                Индивидуальный выходной
                                            </h3>

                                        </div>


                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                leading-5
                                                text-slate-500
                                            "
                                        >
                                            Выходной только на выбранную дату.
                                            Недельный график не изменится.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditForm({
                                                ...editForm,

                                                hasDayOff:
                                                    !editForm.hasDayOff
                                            })
                                        }
                                        className={`
                                            relative
                                            flex
                                            h-7
                                            w-12
                                            shrink-0
                                            cursor-pointer
                                            items-center
                                            rounded-full
                                            px-1
                                            transition-colors
                                            duration-200

                                            ${
                                                editForm.hasDayOff
                                                    ? `
                                                        bg-[#4031d0]
                                                    `
                                                    : `
                                                        bg-slate-300
                                                    `
                                            }
                                        `}
                                    >

                                        <div
                                            className={`
                                                h-5
                                                w-5
                                                transform
                                                rounded-full
                                                bg-white
                                                shadow-sm
                                                transition-transform
                                                duration-200

                                                ${
                                                    editForm.hasDayOff
                                                        ? `
                                                            translate-x-5
                                                        `
                                                        : `
                                                            translate-x-0
                                                        `
                                                }
                                            `}
                                        />

                                    </button>

                                </div>


                                {editForm.hasDayOff && (

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-3
                                        "
                                    >

                                        <div>

                                            <label
                                                className="
                                                    mb-1
                                                    block
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                Дата
                                            </label>


                                            <input
                                                type="date"
                                                value={
                                                    editForm.dayOffDate ||
                                                    ''
                                                }
                                                disabled
                                                className="
                                                    h-11
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-300
                                                    bg-slate-100
                                                    px-3
                                                    text-sm
                                                    font-medium
                                                    text-slate-500
                                                    outline-none
                                                    cursor-not-allowed
                                                "
                                            />

                                        </div>


                                        <div>

                                            <label
                                                className="
                                                    mb-1
                                                    block
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                Причина
                                            </label>


                                            <select
                                                value={
                                                    editForm.dayOffReason ||
                                                    'Личный выходной'
                                                }
                                                onChange={
                                                    event =>
                                                        setEditForm({
                                                            ...editForm,

                                                            dayOffReason:
                                                                event.target.value
                                                        })
                                                }
                                                className="
                                                    h-11
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-300
                                                    bg-[#fcfcfd]
                                                    px-3
                                                    text-sm
                                                    font-medium
                                                    text-slate-800
                                                    outline-none
                                                    focus:border-[#4031d0]
                                                    focus:ring-1
                                                    focus:ring-[#4031d0]
                                                "
                                            >

                                                <option
                                                    value="Личный выходной"
                                                >
                                                    Личный выходной
                                                </option>


                                                <option
                                                    value="По болезни"
                                                >
                                                    По болезни
                                                </option>


                                                <option
                                                    value="Семейные обстоятельства"
                                                >
                                                    Семейные обстоятельства
                                                </option>


                                                <option
                                                    value="Отпуск"
                                                >
                                                    Отпуск
                                                </option>


                                                <option
                                                    value="Другое"
                                                >
                                                    Другое
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* =============================================
                            BUTTONS
                        ============================================= */}

                        <div
                            className="
                                mt-6
                                flex
                                flex-col-reverse
                                gap-3
                                border-t
                                border-slate-100
                                pb-4
                                pt-5

                                sm:flex-row

                                md:mt-8
                                md:pb-0
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedDay(
                                        null
                                    )
                                }
                                className="
                                    h-11
                                    flex-1
                                    cursor-pointer
                                    rounded-xl
                                    border
                                    border-slate-300
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    transition-colors
                                    hover:bg-slate-50

                                    md:h-12
                                "
                            >
                                Отмена
                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleSaveSchedule
                                }
                                disabled={
                                    isSaving
                                }
                                className={`
                                    flex
                                    h-11
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    text-sm
                                    font-medium
                                    text-white
                                    shadow-sm
                                    transition-colors

                                    md:h-12

                                    ${
                                        isSaving
                                            ? `
                                                cursor-not-allowed
                                                bg-slate-400
                                            `
                                            : `
                                                cursor-pointer
                                                bg-[#4031d0]
                                                hover:bg-[#3426a8]
                                            `
                                    }
                                `}
                            >

                                {isSaving ? (

                                    <span
                                        className="
                                            animate-pulse
                                        "
                                    >
                                        Сохранение...
                                    </span>

                                ) : (

                                    <>

                                        <Check
                                            className="
                                                h-4
                                                w-4

                                                md:h-5
                                                md:w-5
                                            "
                                        />

                                        Сохранить

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                )}

            </SidePage>

        </div>
    );
}
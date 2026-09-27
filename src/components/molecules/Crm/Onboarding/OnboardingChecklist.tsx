import {
    Check,
    ChevronRight,
    Circle,
    Rocket,
    X
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import type {
    BusinessOwnerOnboarding
} from '../../../../api/onboarding';


interface OnboardingChecklistProps {
    onboarding: BusinessOwnerOnboarding;
    onDismiss: () => void;
    isDismissing?: boolean;
}


export default function OnboardingChecklist({
    onboarding,
    onDismiss,
    isDismissing = false
}: OnboardingChecklistProps) {

    const navigate =
        useNavigate();


    if (
        onboarding.completed ||
        onboarding.dismissed
    ) {
        return null;
    }


    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[#D9DDEC]
                bg-white
                shadow-sm
            "
        >
            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                    border-b
                    border-[#EAECF0]
                    px-5
                    py-5
                    sm:px-6
                "
            >
                <div
                    className="
                        flex
                        min-w-0
                        items-start
                        gap-3
                    "
                >
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#EEF2FF]
                            text-[#4F46E5]
                        "
                    >
                        <Rocket
                            size={19}
                        />
                    </div>

                    <div
                        className="
                            min-w-0
                        "
                    >
                        <div
                            className="
                                text-[16px]
                                font-semibold
                                text-[#101828]
                            "
                        >
                            Настройка Kezek
                        </div>

                        <div
                            className="
                                mt-1
                                text-[12px]
                                text-[#667085]
                            "
                        >
                            Выполните основные шаги, чтобы начать принимать записи
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={
                        onDismiss
                    }
                    disabled={
                        isDismissing
                    }
                    className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-[#98A2B3]
                        transition
                        hover:bg-[#F2F4F7]
                        hover:text-[#344054]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <X
                        size={17}
                    />
                </button>
            </div>

            <div
                className="
                    px-5
                    pt-5
                    sm:px-6
                "
            >
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                    "
                >
                    <span
                        className="
                            text-[12px]
                            font-medium
                            text-[#667085]
                        "
                    >
                        {
                            onboarding.completed_steps
                        } из {
                            onboarding.total_steps
                        } выполнено
                    </span>

                    <span
                        className="
                            text-[12px]
                            font-semibold
                            text-[#4F46E5]
                        "
                    >
                        {
                            onboarding.progress
                        }%
                    </span>
                </div>

                <div
                    className="
                        mt-2
                        h-2
                        w-full
                        overflow-hidden
                        rounded-full
                        bg-[#EAECF0]
                    "
                >
                    <div
                        className="
                            h-full
                            rounded-full
                            bg-[#4F46E5]
                            transition-all
                            duration-500
                        "
                        style={{
                            width:
                                `${onboarding.progress}%`
                        }}
                    />
                </div>
            </div>

            <div
                className="
                    space-y-2
                    p-5
                    sm:p-6
                "
            >
                {
                    onboarding.steps.map(
                        (
                            step,
                            index
                        ) => {

                            const isCurrent =
                                onboarding.current_step ===
                                step.key;

                            return (
                                <button
                                    key={
                                        step.key
                                    }
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            step.route
                                        )
                                    }
                                    className={`
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-xl
                                        border
                                        px-4
                                        py-3.5
                                        text-left
                                        transition

                                        ${
                                            isCurrent
                                                ? `
                                                    border-[#A5B4FC]
                                                    bg-[#F5F3FF]
                                                    shadow-sm
                                                `
                                                : `
                                                    border-transparent
                                                    hover:border-[#E4E7EC]
                                                    hover:bg-[#F9FAFB]
                                                `
                                        }
                                    `}
                                >
                                    <div
                                        className={`
                                            relative
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full

                                            ${
                                                step.completed
                                                    ? `
                                                        bg-[#ECFDF3]
                                                        text-[#16A34A]
                                                    `
                                                    : isCurrent
                                                        ? `
                                                            bg-[#4F46E5]
                                                            text-white
                                                        `
                                                        : `
                                                            bg-[#F2F4F7]
                                                            text-[#98A2B3]
                                                        `
                                            }
                                        `}
                                    >
                                        {
                                            isCurrent &&
                                            !step.completed && (
                                                <span
                                                    className="
                                                        absolute
                                                        inset-0
                                                        animate-ping
                                                        rounded-full
                                                        bg-[#4F46E5]/30
                                                    "
                                                />
                                            )
                                        }

                                        {
                                            step.completed
                                                ? (
                                                    <Check
                                                        size={16}
                                                    />
                                                )
                                                : (
                                                    <Circle
                                                        size={13}
                                                        fill={
                                                            isCurrent
                                                                ? 'currentColor'
                                                                : 'none'
                                                        }
                                                    />
                                                )
                                        }
                                    </div>

                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-2
                                            "
                                        >
                                            <span
                                                className={`
                                                    text-[13px]
                                                    font-semibold

                                                    ${
                                                        step.completed
                                                            ? 'text-[#667085]'
                                                            : 'text-[#101828]'
                                                    }
                                                `}
                                            >
                                                {
                                                    index + 1
                                                }. {
                                                    step.title
                                                }
                                            </span>

                                            {
                                                isCurrent && (
                                                    <span
                                                        className="
                                                            rounded-md
                                                            bg-[#EEF2FF]
                                                            px-2
                                                            py-0.5
                                                            text-[9px]
                                                            font-semibold
                                                            uppercase
                                                            tracking-wide
                                                            text-[#4F46E5]
                                                        "
                                                    >
                                                        Следующий шаг
                                                    </span>
                                                )
                                            }
                                        </div>

                                        {
                                            (
                                                isCurrent ||
                                                !step.completed
                                            ) && (
                                                <div
                                                    className="
                                                        mt-1
                                                        text-[11px]
                                                        leading-4
                                                        text-[#667085]
                                                    "
                                                >
                                                    {
                                                        step.description
                                                    }
                                                </div>
                                            )
                                        }
                                    </div>

                                    <ChevronRight
                                        size={16}
                                        className="
                                            shrink-0
                                            text-[#98A2B3]
                                        "
                                    />
                                </button>
                            );
                        }
                    )
                }
            </div>
        </div>
    );
}

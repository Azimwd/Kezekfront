import Input from '../../../../atoms/Input';
import Typography from '../../../../atoms/Typography';

interface EditInfoProps {
    fullName: string;
    onFullNameChange: (value: string) => void;

    position: string;
    onPositionChange: (value: string) => void;

    description: string;
    onDescriptionChange: (value: string) => void;

    isActive: boolean;
    onIsActiveChange: (value: boolean) => void;
}

export default function EditInfo({
    fullName,
    onFullNameChange,
    position,
    onPositionChange,
    description,
    onDescriptionChange,
    isActive,
    onIsActiveChange
}: EditInfoProps) {
    return (
        <div className="flex w-full flex-col gap-6">

            {/* ИМЯ + ДОЛЖНОСТЬ */}

            <div className="flex flex-col gap-5 sm:flex-row">

                <div className="flex-1">
                    <Typography
                        className="
                            mb-2
                            block
                            text-[13.5px]
                            font-medium
                            text-[#475569]
                        "
                        text="Имя и Фамилия"
                    />

                    <Input
                        type="text"
                        className="
                            w-full
                            rounded-xl
                            border
                            border-[#CBD5E1]
                            bg-white
                            px-4
                            py-2.5
                            text-[15px]
                            text-[#0F172A]
                            focus:border-[#4F46E5]
                            focus:outline-none
                        "
                        placeholder="Али Сагунов"
                        value={fullName}
                        onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                        ) =>
                            onFullNameChange(
                                e.target.value
                            )
                        }
                    />
                </div>


                <div className="flex-1">
                    <Typography
                        className="
                            mb-2
                            block
                            text-[13.5px]
                            font-medium
                            text-[#475569]
                        "
                        text="Должность / Специализация"
                    />

                    <Input
                        type="text"
                        className="
                            w-full
                            rounded-xl
                            border
                            border-[#CBD5E1]
                            bg-white
                            px-4
                            py-2.5
                            text-[15px]
                            text-[#0F172A]
                            focus:border-[#4F46E5]
                            focus:outline-none
                        "
                        placeholder="Барбер, врач, консультант..."
                        value={position}
                        onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                        ) =>
                            onPositionChange(
                                e.target.value
                            )
                        }
                    />
                </div>

            </div>


            {/* ОПИСАНИЕ */}

            <div>
                <Typography
                    className="
                        mb-2
                        block
                        text-[13.5px]
                        font-medium
                        text-[#475569]
                    "
                    text="Описание специалиста"
                />

                <textarea
                    className="
                        min-h-[100px]
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-[#CBD5E1]
                        bg-white
                        px-4
                        py-3
                        text-[15px]
                        text-[#0F172A]
                        focus:border-[#4F46E5]
                        focus:outline-none
                    "
                    placeholder="Расскажите об опыте и специализации..."
                    value={description}
                    onChange={(
                        e: React.ChangeEvent<HTMLTextAreaElement>
                    ) =>
                        onDescriptionChange(
                            e.target.value
                        )
                    }
                />
            </div>


            {/* ACTIVE STATUS */}

            <div
                className="
                    mt-2
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-[#E2E8F0]
                    bg-[#F4F6FF]
                    p-4
                    gap-4
                "
            >

                <div className="flex flex-col">

                    <Typography
                        className="
                            mb-0.5
                            text-[14.5px]
                            font-semibold
                            text-[#0F172A]
                        "
                        text="Специалист активен"
                    />

                    <Typography
                        className="
                            text-[13px]
                            text-[#64748B]
                        "
                        text="Отображать специалиста в онлайн-записи"
                    />

                </div>


                <label
                    className="
                        relative
                        inline-flex
                        shrink-0
                        cursor-pointer
                        items-center
                    "
                >

                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={isActive}
                        onChange={(e) =>
                            onIsActiveChange(
                                e.target.checked
                            )
                        }
                    />


                    <div
                        className="
                            peer
                            relative
                            h-6
                            w-11
                            rounded-full
                            bg-[#CBD5E1]
                            transition-colors
                            duration-200

                            after:absolute
                            after:left-[2px]
                            after:top-[2px]
                            after:h-5
                            after:w-5
                            after:rounded-full
                            after:border
                            after:border-gray-300
                            after:bg-white
                            after:content-['']
                            after:transition-transform
                            after:duration-200

                            peer-checked:bg-[#3B28CC]
                            peer-checked:after:translate-x-full
                            peer-checked:after:border-white
                        "
                    />

                </label>

            </div>

        </div>
    );
}
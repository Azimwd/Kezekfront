import {
    useEffect,
    useRef,
    useState
} from 'react';

import {
    Camera,
    X
} from 'lucide-react';

import Icon
    from '../../../../atoms/Icon';

import Typography
    from '../../../../atoms/Typography';


interface StaffImageProps {
    photo: File | null;

    onChange: (
        file: File | null
    ) => void;
}


export default function StaffImage({
    photo,
    onChange
}: StaffImageProps) {

    const [
        preview,
        setPreview
    ] = useState<string | null>(
        null
    );


    const [
        error,
        setError
    ] = useState('');


    const inputRef =
        useRef<HTMLInputElement>(
            null
        );


    /*
     * ============================================================
     * PREVIEW
     * ============================================================
     */

    useEffect(
        () => {

            if (
                !photo
            ) {

                setPreview(
                    null
                );

                return;
            }


            const url =
                URL.createObjectURL(
                    photo
                );


            setPreview(
                url
            );


            return () => {

                URL.revokeObjectURL(
                    url
                );
            };

        },
        [
            photo
        ]
    );


    /*
     * ============================================================
     * FILE CHANGE
     * ============================================================
     */

    const handleFileChange =
        (
            event:
                React.ChangeEvent<HTMLInputElement>
        ) => {

            setError(
                ''
            );


            const file =
                event.target.files?.[0];


            if (
                !file
            ) {

                return;
            }


            /*
             * Разрешённые форматы.
             */

            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                setError(
                    'Можно загрузить только JPG, PNG или WEBP.'
                );


                onChange(
                    null
                );


                event.target.value =
                    '';


                return;
            }


            /*
             * Максимум 2 MB.
             */

            const maxSize =
                2 *
                1024 *
                1024;


            if (
                file.size >
                maxSize
            ) {

                setError(
                    'Размер фотографии не должен превышать 2 MB.'
                );


                onChange(
                    null
                );


                event.target.value =
                    '';


                return;
            }


            onChange(
                file
            );
        };


    /*
     * ============================================================
     * REMOVE
     * ============================================================
     */

    const handleRemove =
        (
            event:
                React.MouseEvent<HTMLButtonElement>
        ) => {

            event.preventDefault();

            event.stopPropagation();


            setError(
                ''
            );


            onChange(
                null
            );


            if (
                inputRef.current
            ) {

                inputRef.current.value =
                    '';
            }
        };


    return (
        <div
            className="
                flex
                w-full
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-white
                p-5
                sm:rounded-3xl
                sm:p-8
            "
        >

            <label
                className="
                    group
                    flex
                    w-full
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                "
            >

                {/* PHOTO */}

                <div
                    className="
                        relative
                        mb-4
                        flex
                        h-[100px]
                        w-[100px]
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        border-2
                        border-dashed
                        border-[#C3D2EF]
                        bg-[#f8f9ff]
                        transition-colors
                        group-hover:bg-[#E2EAF6]
                        sm:mb-5
                        sm:h-[130px]
                        sm:w-[130px]
                    "
                >

                    {preview ? (

                        <img
                            src={
                                preview
                            }
                            alt="Фото мастера"
                            className="
                                h-full
                                w-full
                                object-cover
                            "
                        />

                    ) : (

                        <Icon
                            icon={
                                Camera
                            }
                            size={
                                28
                            }
                            className="
                                text-[#64748B]
                            "
                        />

                    )}


                    {/* OVERLAY */}

                    {preview && (

                        <div
                            className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-black/0
                                transition-all
                                group-hover:bg-black/30
                            "
                        >

                            <Camera
                                size={
                                    26
                                }
                                className="
                                    text-white
                                    opacity-0
                                    transition-opacity
                                    group-hover:opacity-100
                                "
                            />

                        </div>

                    )}


                    {/* REMOVE */}

                </div>


                {/* TEXT */}

                <div
                    className="
                        flex
                        flex-col
                        text-center
                    "
                >

                    <Typography
                        className="
                            mb-1
                            text-[14px]
                            font-medium
                            text-[#1E293B]
                            sm:text-[15px]
                        "
                        text={
                            preview
                                ? 'Нажмите, чтобы изменить'
                                : 'Фотография профиля'
                        }
                    />


                    <Typography
                        className="
                            whitespace-pre-line
                            text-[12px]
                            leading-snug
                            text-[#64748B]
                            sm:text-[13px]
                        "
                        text={
                            'Рекомендуемый размер\n500x500px, до 2MB.'
                        }
                    />

                </div>


                <input
                    ref={
                        inputRef
                    }
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                        handleFileChange
                    }
                />

            </label>


            {/* ERROR */}

            {error && (

                <div
                    className="
                        mt-3
                        text-center
                        text-xs
                        font-medium
                        text-red-500
                    "
                >
                    {error}
                </div>

            )}

        </div>
    );
}
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


interface EditImageProps {
    currentPhoto?: string | null;

    photo: File | null;

    onChange: (
        file: File | null
    ) => void;
}


export default function EditImage({
    currentPhoto,
    photo,
    onChange
}: EditImageProps) {

    const [
        preview,
        setPreview
    ] = useState<string | null>(
        currentPhoto ?? null
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
     * CURRENT PHOTO
     * ============================================================
     */

    useEffect(
        () => {

            if (
                photo
            ) {
                return;
            }


            setPreview(
                currentPhoto ?? null
            );

        },
        [
            currentPhoto,
            photo
        ]
    );


    /*
     * ============================================================
     * NEW PHOTO PREVIEW
     * ============================================================
     */

    useEffect(
        () => {

            if (
                !photo
            ) {
                return;
            }


            const objectUrl =
                URL.createObjectURL(
                    photo
                );


            setPreview(
                objectUrl
            );


            return () => {

                URL.revokeObjectURL(
                    objectUrl
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


            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];


            /*
             * TYPE
             */

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                setError(
                    'Можно загрузить только JPG, PNG или WEBP.'
                );


                event.target.value =
                    '';


                return;
            }


            /*
             * SIZE
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
     * CANCEL NEW PHOTO
     * ============================================================
     */

    const handleRemoveNewPhoto =
        (
            event:
                React.MouseEvent<HTMLButtonElement>
        ) => {

            event.preventDefault();

            event.stopPropagation();


            setError(
                ''
            );


            /*
             * Убираем только выбранное новое фото.
             *
             * Старое фото мастера снова появится.
             */

            onChange(
                null
            );


            setPreview(
                currentPhoto ?? null
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
                w-[130px]
                flex-col
                items-center
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
                "
            >

                <div
                    className="
                        relative
                        mb-3
                        flex
                        h-[120px]
                        w-[120px]
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        border-[2px]
                        border-dashed
                        border-[#CBD5E1]
                        bg-[#f8f9ff]
                        transition-colors
                        group-hover:bg-[#E2EAF6]
                    "
                >

                    {/* PHOTO */}

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
                                32
                            }
                            className="
                                text-[#64748B]
                            "
                        />

                    )}


                    {/* HOVER */}

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
                                    28
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


                    {/* REMOVE ONLY NEW PHOTO */}


                </div>


                <div
                    className="
                        text-center
                    "
                >

                    <Typography
                        className="
                            text-[12px]
                            font-medium
                            text-[#64748B]
                        "
                        text={
                            photo
                                ? 'Выбрано новое фото'
                                : preview
                                    ? 'Нажмите, чтобы изменить'
                                    : 'JPG, PNG до 2MB'
                        }
                    />


                    {preview && !photo && (

                        <Typography
                            className="
                                mt-1
                                text-[11px]
                                text-[#94A3B8]
                            "
                            text="JPG, PNG до 2MB"
                        />

                    )}

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
                        mt-2
                        text-center
                        text-[11px]
                        font-medium
                        leading-4
                        text-red-500
                    "
                >
                    {error}
                </div>

            )}

        </div>
    );
}
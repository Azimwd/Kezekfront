import Typography from '../../../atoms/Typography';


interface AppointmentCommentProps {
    comment: string | null;
}


export default function AppointmentComment({
    comment
}: AppointmentCommentProps) {

    return (
        <div
            className="
                w-full
                rounded-2xl
                border
                border-[#c7c4d8]
                bg-white
                px-6
                py-5
            "
        >

            <Typography
                text="КОММЕНТАРИЙ ПОД ЗАПИСЬЮ"
                className="
                    text-xs
                    font-medium
                    uppercase
                    text-slate-700
                "
            />


            <Typography
                text={
                    comment?.trim()
                        ? comment
                        : 'Комментарий отсутствует'
                }
                className="
                    mt-2
                    text-base
                    text-[#111827]
                "
            />

        </div>
    );
}
import Typography from '../../../../atoms/Typography';

interface CommentAppointmentProps {
    comment: string;
}

export default function CommentAppointment({
    comment
}: CommentAppointmentProps) {
    return (
        <div className="px-6 py-4 bg-white border border-[#c7c4d8] rounded-2xl w-full flex flex-col">
            <Typography
                text={'Комментарий под записью'}
                className="uppercase text-xs tracking-wider"
            />
            <Typography text={comment} />
        </div>
    );
}

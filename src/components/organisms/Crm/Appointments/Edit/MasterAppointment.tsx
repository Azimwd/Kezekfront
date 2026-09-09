import Typography from '../../../../atoms/Typography';

interface MasterAppointmentProps {
    name: string;
    last_name: string;
    position: string;
}

export default function MasterAppointment({
    name,
    last_name,
    position
}: MasterAppointmentProps) {
    return (
        <div className="px-6 py-4 bg-white border border-[#c7c4d8] rounded-2xl w-full">
            <Typography
                text={'мастер'}
                className="uppercase text-xs tracking-wider"
            />
            <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                    <Typography
                        text={name}
                        className="text-lg font-medium text-[#111827]"
                    />

                    <Typography
                        text={last_name}
                        className="text-lg font-medium text-[#111827]"
                    />
                </div>
                <div className="flex">
                    <Typography
                        text={position}
                        className="text-md  text-[#323333]"
                    />
                </div>
            </div>
        </div>
    );
}

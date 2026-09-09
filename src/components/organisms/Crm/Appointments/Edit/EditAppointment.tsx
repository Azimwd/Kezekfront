import { useParams } from 'react-router-dom';
import EditHeader from './EditHeader';
import ClientInfo from './ClientInfo';
import { useQuery } from '@tanstack/react-query';
import { appointmentById } from '../../../../../api/appointments';
import { format, intervalToDuration } from 'date-fns';
import ManageAppoinment from './ManageAppoinment';
import Details from './Details';
import MasterAppointment from './MasterAppointment';
import CommentAppointment from './CommentAppointment';

export default function EditAppointment() {
    const { id } = useParams();

    const { data, isPending, isError } = useQuery({
        queryKey: ['editAppointment', id],
        queryFn: () => appointmentById(Number(id)),
        enabled: !!id
    });

    if (isPending) {
        return <div>Загрузка данных...</div>;
    }

    if (isError || !data) {
        return <div>Ошибка загрузки или запись не найдена</div>;
    }

    const formatDate = format(data.data.start_at, 'do MMMM, yyyy');

    const formatTimeFrom = format(data.data.start_at, 'HH:mm');

    const formatTimeTo = format(data.data.end_at, 'HH:mm');

    const formatCreateAt = format(data.data.created_at, 'dd.MM.yyyy');

    const formatTimeCreateAt = format(data.data.created_at, 'HH:mm');

    const duration = intervalToDuration({
        start: data.data.start_at,
        end: data.data.end_at
    });

    return (
        <div className="flex flex-col gap-10 ">
            <EditHeader
                id={`${id}`}
                created_at={formatCreateAt}
                created_time={formatTimeCreateAt}
            />
            <div className="grid gap-10 grid-cols-[2fr_1fr]">
                <div className="flex flex-col gap-10 w-full">
                    <ClientInfo
                        name={data.data.client_first_name}
                        phone_num={data.data.client_phone}
                        client_ltv={data.data.client_ltv}
                        last_name={data.data.client_last_name}
                        client_total_visit={data.data.client_total_visits}
                    />
                    <Details
                        service_name={data.data.service_name}
                        description={data.data.service_description}
                        duration={duration}
                        price={data.data.price}
                        format_date={formatDate}
                        format_time_from={formatTimeFrom}
                        format_time_to={formatTimeTo}
                    />
                </div>
                <div className=" w-full flex flex-col gap-10">
                    <ManageAppoinment />
                    <CommentAppointment comment={data.data.comment} />
                    <MasterAppointment
                        name={data.data.staff_first_name}
                        last_name={data.data.staff_last_name}
                        position={data.data.staff_position}
                    />
                </div>
            </div>
        </div>
    );
}

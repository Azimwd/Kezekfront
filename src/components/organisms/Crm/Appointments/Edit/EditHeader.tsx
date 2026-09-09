import { ArrowLeft } from 'lucide-react';
import Icon from '../../../../atoms/Icon';
import Typography from '../../../../atoms/Typography';
import Button from '../../../../atoms/Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    id: string;
    created_at: string;
    created_time: string;
}

export default function EditHeader({
    id,
    created_at,
    created_time
}: HeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-6">
            <Button
                onClick={() => navigate('/crm/appointments')}
                className="cursor-pointer"
            >
                <Icon icon={ArrowLeft} />
            </Button>
            <div className="flex flex-col">
                <Typography
                    text={`Запись #${id}`}
                    className="text-2xl font-medium"
                />
                <Typography
                    text={`${created_at}, ${created_time}`}
                    className="text-md text-[#4d4d4d]"
                />
            </div>
        </div>
    );
}

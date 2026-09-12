import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { editMasters, getStaffById } from '../../api/staff'; // <-- Импортируем getStaffById

import EditImage from '../../components/molecules/Crm/Staff/StaffEdit/EditImage';
import EditInfo from '../../components/molecules/Crm/Staff/StaffEdit/EditInfo';
import StaffEditHeader from '../../components/organisms/Crm/Staff.tsx/StaffEdit/StaffEditHeader';
import Icon from '../../components/atoms/Icon';
import Typography from '../../components/atoms/Typography';
import StaffActiveStatus from '../../components/organisms/Crm/Staff.tsx/StaffEdit/StaffActiveStatus';
import StaffEditButtons from '../../components/organisms/Crm/Staff.tsx/StaffEdit/StaffEditButtons';
import Button from '../../components/atoms/Button';

export default function EditStaff() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [fullName, setFullName] = useState('');
    const [position, setPosition] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    const { data: staffResponse, isLoading } = useQuery({
        queryKey: ['staff', id],
        queryFn: () => getStaffById(Number(id)),
        enabled: !!id
    });

    useEffect(() => {
        if (staffResponse?.data) {
            const staff = staffResponse.data;
            setFullName(
                `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
            );
            setPosition(staff.position || '');
            setDescription(staff.description || '');
            setIsActive(staff.is_active ?? true);
        }
    }, [staffResponse]);

    const editStaffMutation = useMutation({
        mutationFn: editMasters,
        onSuccess: (data) => {
            console.log('Мастер успешно обновлен:', data);
            queryClient.invalidateQueries({ queryKey: ['masters'] });
            navigate(-1);
        },
        onError: (error) => {
            console.error('Ошибка при сохранении мастера:', error);
            alert('Произошла ошибка при сохранении.');
        }
    });

    const handleSave = () => {
        if (!id) return;

        const nameParts = fullName.trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        editStaffMutation.mutate({
            id: Number(id),
            first_name,
            last_name,
            position,
            description,
            is_active: isActive
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 border bg-white border-[#c7c4d8] rounded-2xl p-5">
                <span className="text-gray-500 text-lg">
                    Загрузка данных мастера...
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <StaffEditHeader />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                <div className="lg:col-span-3 w-full flex flex-col gap-10">
                    <div className="w-full p-6 sm:p-8 bg-white border border-[#c7c4d8] rounded-3xl">
                        <div className="flex items-center gap-2 mb-8">
                            <Icon
                                icon={User}
                                className="text-[#3B28CC] w-6 h-6"
                            />
                            <Typography
                                className="text-xl sm:text-[22px] font-medium text-[#0F172A]"
                                text={'Основная информация'}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                            <div className="flex-shrink-0 flex justify-center w-full md:w-auto md:justify-start">
                                <EditImage />
                            </div>

                            <div className="flex-grow w-full">
                                <EditInfo
                                    fullName={fullName}
                                    onFullNameChange={setFullName}
                                    position={position}
                                    onPositionChange={setPosition}
                                    description={description}
                                    onDescriptionChange={setDescription}
                                    isActive={isActive}
                                    onIsActiveChange={setIsActive}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end w-full gap-5">
                        <Button
                            className="w-full sm:w-auto px-8 py-3 bg-[#E2E8FF] rounded-xl hover:bg-[#D1DBFF] transition-colors"
                            onClick={() => navigate(-1)}
                        >
                            <Typography
                                text={'Отмена'}
                                className="text-[#3B28CC] font-medium text-[15px]"
                            />
                        </Button>
                        <Button
                            className="w-full sm:w-auto px-8 py-3 bg-[#3B28CC] text-white rounded-xl hover:bg-[#2b1d96] transition-colors disabled:opacity-50"
                            onClick={handleSave}
                            disabled={editStaffMutation.isPending}
                        >
                            <Typography
                                text={
                                    editStaffMutation.isPending
                                        ? 'Сохранение...'
                                        : 'Сохранить'
                                }
                                className="text-white font-medium text-[15px]"
                            />
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-2 w-full flex flex-col gap-10">
                    <StaffActiveStatus
                        name={fullName}
                        position={position}
                        isActive={isActive}
                    />

                    <StaffEditButtons
                        fullName={fullName}
                    />
                </div>
            </div>
        </div>
    );
}

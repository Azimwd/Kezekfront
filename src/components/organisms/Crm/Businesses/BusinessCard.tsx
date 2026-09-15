import { Ellipsis, MapPin, Phone } from 'lucide-react';
import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';
import type { Business } from '../../../../api/businesses';
import EditBusiness from '../../../molecules/Crm/Businesses/EditBusiness';
import DeleteBusiness from './DeleteBusiness';

interface BusinessCardProps {
    business: Business;
}

const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path}`;
};

export default function BusinessCard({ business }: BusinessCardProps) {
    const isActive = business.status === 'active';
    const statusColor = isActive ? 'bg-[#11c255]' : 'bg-gray-500';
    const statusText = isActive ? 'АКТИВЕН' : 'ЧЕРНОВИК';

    const fullAddress = business.city_name
        ? `${business.city_name}, ${business.address}`
        : business.address;

    const logoUrl = getImageUrl(business.logo);
    const firstImageUrl = business.images?.length
        ? getImageUrl(business.images[0])
        : null;
    const defaultImage =
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop';

    const finalImageUrl = logoUrl || firstImageUrl || defaultImage;

    return (
        <div className="w-full h-full bg-white rounded-[20px] border border-[#c7c4d8] flex flex-col font-sans transition-transform hover:shadow-md">
            <div className="relative h-50 w-full shrink-0 rounded-t-[20px] overflow-hidden">
                <img
                    src={finalImageUrl}
                    alt={business.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                <div
                    className={`absolute top-4 left-4 ${statusColor} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase`}
                >
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    <Typography
                        text={statusText}
                        className="text-[10px] font-bold tracking-wider uppercase"
                    />
                </div>

                <Typography
                    className="absolute bottom-4 left-5 right-5 text-white text-[19px] font-bold leading-tight"
                    text={business.name}
                />
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex flex-col gap-3 mb-5 text-[#687387] text-[14px]">
                    <div className="flex items-center gap-3">
                        <Icon
                            icon={MapPin}
                            size={19}
                            className="text-[#687387] shrink-0"
                        />
                        <span className="text-[#687387] truncate">
                            {fullAddress}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icon
                            icon={Phone}
                            size={17}
                            className="text-[#687387] shrink-0"
                        />
                        <span className="text-[#687387]">{business.phone}</span>
                    </div>
                </div>

                <div className="mt-auto">
                    <hr className="border-slate-100 mb-4" />

                    <div className="grid grid-cols-3 divide-x divide-slate-100 mb-4 text-center">
                        <div className="flex flex-col">
                            <Typography
                                className="text-[18px] font-bold text-[#5c4cf7]"
                                text={0}
                            />
                            <Typography
                                className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-1"
                                text={'Услуги'}
                            />
                        </div>
                        <div className="flex flex-col">
                            <Typography
                                className="text-[18px] font-bold text-[#5c4cf7]"
                                text={0}
                            />
                            <Typography
                                className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-1"
                                text={'Мастера'}
                            />
                        </div>
                        <div className="flex flex-col">
                            <Typography
                                className="text-[18px] font-bold text-[#5c4cf7]"
                                text={0}
                            />
                            <Typography
                                className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-1 leading-tight"
                                text={'Записи\n(СЕГОДНЯ)'}
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100 mb-5" />

                    <div className="flex gap-3">
                        <EditBusiness business={business} />
                        <DeleteBusiness businessId={business.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

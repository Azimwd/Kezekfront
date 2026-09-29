import Header from '../../components/organisms/Crm/Appointments/Header';
import DataTableArea from '../../components/organisms/Crm/Appointments/DataTableArea';
import StatsGrid from '../../components/organisms/Crm/Appointments/StatsGrid';

export default function Appointments() {
    return (
        <div className="flex w-full">
            <div className="w-full flex flex-col gap-10">
                <div data-tour="appointments-header">
                    <Header />
                </div>

                <div data-tour="appointments-list">
                    <DataTableArea />
                </div>

                <div data-tour="appointments-stats">
                    <StatsGrid />
                </div>
            </div>
        </div>
    );
}


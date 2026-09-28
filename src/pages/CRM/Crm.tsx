import HeroSection from '../../components/templates/Crm/HeroSection';
import {
    Outlet
} from 'react-router-dom';

import CrmTour
    from '../../components/organisms/Crm/Onboarding/CrmTour';

export default function CrmPage() {
    return (
        <>           
            <CrmTour />

            <div className="...">
                <HeroSection />\
                <Outlet />
            </div>
        </>
    );
}

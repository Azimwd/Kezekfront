import {
    Outlet
} from 'react-router-dom';

import HeroSection
    from '../../components/templates/Crm/HeroSection';

import CrmTour
    from '../../components/organisms/Crm/Onboarding/CrmTour';

import {
    BusinessProvider
} from '../../context/BusinessContext';


export default function CrmPage() {
    return (
        <BusinessProvider>
            <CrmTour />

            <div>
                <HeroSection />

                <Outlet />
            </div>
        </BusinessProvider>
    );
}
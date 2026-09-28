import {
    Outlet
} from 'react-router-dom';

import HeroSection
    from '../../components/templates/Crm/HeroSection';

import {
    BusinessProvider
} from '../../context/BusinessContext';


export default function CrmPage() {
    return (
        <BusinessProvider>
            <div>
                <HeroSection />

                <Outlet />
            </div>
        </BusinessProvider>
    );
}
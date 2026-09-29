import CrmTour
    from '../../components/organisms/Crm/Onboarding/CrmTour';

import CrmTemplate
    from '../../components/templates/Crm/CrmTemplate';

import {
    BusinessProvider
} from '../../context/BusinessContext';


export default function CrmPage() {
    return (
        <BusinessProvider>
            <CrmTour />

            <CrmTemplate />
        </BusinessProvider>
    );
}
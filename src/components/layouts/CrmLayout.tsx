import {
    Outlet
} from 'react-router-dom';

import CrmTour
    from '../organisms/Crm/Onboarding/CrmTour';


export default function CrmLayout() {
    return (
        <>
            <CrmTour />

            <Outlet />
        </>
    );
}
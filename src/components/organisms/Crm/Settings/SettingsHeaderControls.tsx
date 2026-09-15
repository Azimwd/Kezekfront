import {
    useBusiness
} from '../../../../context/BusinessContext';

import ServiceSelector
    from '../../../molecules/Crm/Services/ServiceSelector';


export default function SettingsHeaderControls() {

    const {
        selectedBusiness
    } = useBusiness();


    return (
        <div
            className="
                flex
                w-full
                min-w-0
                flex-col
                gap-3

                sm:flex-row
                sm:items-center

                lg:w-auto
                lg:justify-end
            "
        >

            {/* =================================================
                BUSINESS SELECT
            ================================================= */}

            <div
                className="
                    w-full
                    min-w-0

                    sm:flex-1

                    lg:w-[250px]
                    lg:flex-none
                "
            >
                <ServiceSelector />
            </div>

        </div>
    );
}
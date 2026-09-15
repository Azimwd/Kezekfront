import ServiceSelector
    from '../../../molecules/Crm/Services/ServiceSelector';

import NewService
    from '../../../molecules/Crm/Services/NewService';


export default function ServicesHeader() {
    return (
        <div
            className="
                flex
                w-full
                min-w-0
                flex-col
                gap-3

                md:w-auto
                md:flex-row
                md:items-center
                md:gap-4
            "
        >

            {/* SELECT */}

            <div
                className="
                    w-full
                    min-w-0

                    md:w-[220px]
                    md:shrink-0
                "
            >
                <ServiceSelector />
            </div>


            {/* DIVIDER — ТОЛЬКО НА ПК */}

            <div
                className="
                    hidden
                    h-8
                    w-px
                    shrink-0
                    bg-gray-200

                    md:block
                "
            />


            {/* CREATE BUTTON */}

            <div
                className="
                    w-full

                    md:w-auto
                    md:shrink-0
                "
            >
                <NewService />
            </div>

        </div>
    );
}
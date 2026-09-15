import type { ComponentProps } from 'react';

import CatalogHeader from '../../organisms/Catalog/CatalogHeader';
import Sidebar from '../../organisms/Catalog/FilterSidebar';
import Pagination from '../../organisms/Catalog/Pagination';
import SearchBar from '../../organisms/Catalog/SearchBar';
import ServiceCard from '../../organisms/Catalog/ServiceCard';
import CatalogTemplate from './CatalogTemplate';

interface HeroSectionProps {
    searchBarProps: ComponentProps<typeof SearchBar>;
    serviceCardProps: ComponentProps<typeof ServiceCard>;
}

export default function HeroSection({
    searchBarProps,
    serviceCardProps
}: HeroSectionProps) {
    return (
        <div className="bg-[#f8f9ff] min-h-screen">
            <CatalogTemplate
                header={<CatalogHeader />}
                filter={<Sidebar />}
                search={
                    <SearchBar
                        {...searchBarProps}
                    />
                }
                catalog={
                    <ServiceCard
                        {...serviceCardProps}
                    />
                }
                pagination={<Pagination />}
            />
        </div>
    );
}
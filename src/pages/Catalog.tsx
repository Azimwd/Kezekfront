import CatalogControl from '../components/organisms/Catalog/CatalogControl';

export default function Catalog() {
    return (
        <div
            className="
                min-h-screen
                w-full
                bg-[#F7F8FD]
                px-4
                py-5
                sm:px-6
                lg:px-8
            "
        >
            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1600px]
                "
            >
                <CatalogControl />
            </div>
        </div>
    );
}
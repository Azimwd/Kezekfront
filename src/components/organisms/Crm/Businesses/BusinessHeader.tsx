import NewBusiness from '../../../molecules/Crm/Businesses/NewBusiness';
import Searchbar from '../../../molecules/Crm/Businesses/Searchbar';

export default function BusinessHeader() {
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
        "
    >
        {/* 1 РЯД — ПОИСК */}

        <div
            className="
                w-full
                min-w-0
                sm:flex-1
            "
        >
            <Searchbar />
        </div>


        {/* 2 РЯД — КНОПКА */}

        <div
            className="
                w-full
                sm:w-auto
                sm:shrink-0
            "
        >
            <NewBusiness />
        </div>
    </div>
    );
}

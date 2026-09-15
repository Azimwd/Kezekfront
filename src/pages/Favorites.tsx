import FavoritesControl
    from '../components/organisms/Favorites/Favorites';


export default function Favorites() {

    return (
        <main
            className="
                min-h-screen
                bg-[#F7F8FD]
                px-4
                py-8

                md:px-8
                lg:px-16
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    max-w-7xl
                "
            >

                <FavoritesControl />

            </div>

        </main>
    );
}
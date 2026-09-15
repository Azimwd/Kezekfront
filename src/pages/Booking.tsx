import BookingControl
    from '../components/organisms/Booking/BookingControl';


export default function Booking() {

    return (
        <main
            className="
                min-h-screen
                bg-[#F7F8FD]
                px-4
                py-6

                md:px-8
                lg:px-10
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1500px]
                "
            >

                <BookingControl />

            </div>

        </main>
    );
}
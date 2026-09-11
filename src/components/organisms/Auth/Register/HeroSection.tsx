import RegisterTemplate from './RegisterTemplate';

export default function HeroSection() {
    return (
        <section
            className="
                flex
                min-h-[calc(100vh-70px)]
                w-full
                items-center
                justify-center
                bg-[#F8F9FE]
                px-4
                py-6
            "
        >
            <div
                className="
                    grid
                    w-full
                    max-w-[1000px]
                    overflow-hidden
                    rounded-[16px]
                    border
                    border-[#D9DCE8]
                    bg-white
                    shadow-[0_10px_40px_rgba(30,40,80,0.06)]
                    lg:grid-cols-2
                "
            >
                {/* LEFT */}
                <div
                    className="
                        relative
                        hidden
                        min-h-[680px]
                        overflow-hidden
                        lg:block
                    "
                >
                    <img
                        src="/register-office.jpg"
                        alt="Kezek.kz"
                        className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                        "
                    />

                    {/* затемнение снизу */}
                    <div
                        className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-[#13213A]/90
                            via-[#13213A]/15
                            to-transparent
                        "
                    />

                    <div className="absolute bottom-10 left-10 right-8 text-white">
                        <h1 className="text-[38px] font-bold tracking-tight">
                            Присоединяйтесь к Kezek.kz
                        </h1>

                        <p className="mt-3 max-w-[400px] text-[16px] leading-6 text-white/85">
                            Упростите запись на услуги.
                            Находите специалистов или
                            управляйте своим бизнесом
                            в одном месте.
                        </p>
                    </div>
                </div>

                {/* RIGHT */}
                <div
                    className="
                        flex
                        items-center
                        justify-center
                        px-6
                        py-10
                        sm:px-10
                        lg:px-14
                    "
                >
                    <div className="w-full max-w-[430px]">
                        <RegisterTemplate />
                    </div>
                </div>
            </div>
        </section>
    );
}
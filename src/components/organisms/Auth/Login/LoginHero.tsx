import LoginForm from './LoginForm';

export default function LoginHero() {
    return (
        <section className="relative flex min-h-[calc(100vh-70px)] w-full justify-center overflow-hidden bg-[#F7F8FE] px-4 py-3">
            {/* Фоновые светлые пятна */}
            <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#DDE8FF]/70 blur-[100px]" />

            <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-[#DDE8FF]/70 blur-[100px]" />

            <div className="relative z-10 flex w-full flex-col items-center">
                {/* Заголовок */}
                <div className="text-center">
                    <h1 className="text-[32px] font-bold tracking-tight text-[#3129DB]">
                        Kezek.kz
                    </h1>

                    <p className="mt-2 text-[15px] text-[#45454F]">
                        Welcome back. Please enter your details.
                    </p>
                </div>

                {/* Карточка */}
                <div className="mt-8 w-full max-w-[432px]">
                    <LoginForm />
                </div>
            </div>
        </section>
    );
}
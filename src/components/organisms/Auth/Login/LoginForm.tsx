import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    Eye,
    EyeOff,
    LockKeyhole,
    UserRound
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { loginUser } from '../../../../api/auth';
import { useUser } from '../../../../context/UserContext';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { setUser } = useUser();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: () => loginUser(email, password),

        onSuccess: (data) => {
            setUser(data.data);

            if (data.data.role === 'business_owner') {
                navigate('/crm/dashboard');
                return;
            }

            navigate('/');
        },

        onError: (error) => {
            console.error('Ошибка авторизации:', error);
        }
    });

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            return;
        }

        loginMutation.mutate();
    };

    const getErrorMessage = () => {
        if (!loginMutation.isError) {
            return null;
        }

        if (axios.isAxiosError(loginMutation.error)) {
            if (loginMutation.error.response?.status === 401) {
                return 'Неверный email или пароль';
            }

            const data = loginMutation.error.response?.data as {
                detail?: string;
                message?: string;
            };

            return data?.detail || data?.message || null;
        }

        return 'Ошибка авторизации';
    };

    const errorMessage = getErrorMessage();

    return (
        <div
            className="
                w-full
                rounded-[24px]
                border
                border-[#E0E3EC]
                bg-white
                px-8
                py-8
                shadow-[0_12px_35px_rgba(40,48,90,0.08)]
            "
        >
            <form onSubmit={handleSubmit}>

                {/* Email или телефон */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-[14px] font-medium text-[#172033]"
                    >
                        Email или телефон
                    </label>

                    <div className="relative">
                        <UserRound
                            size={19}
                            strokeWidth={1.8}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-[#7C7D91]
                            "
                        />

                        <input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Введите email или телефон"
                            autoComplete="username"
                            className="
                                h-[49px]
                                w-full
                                rounded-[8px]
                                border
                                border-[#BEC0D4]
                                bg-[#FCFCFE]
                                pl-10
                                pr-4
                                text-[15px]
                                text-[#22232D]
                                outline-none
                                transition
                                placeholder:text-[#818293]
                                focus:border-[#4F46E5]
                                focus:ring-2
                                focus:ring-[#4F46E5]/10
                            "
                        />
                    </div>
                </div>

                {/* Пароль */}
                <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-[14px] font-medium text-[#172033]"
                        >
                            Пароль
                        </label>

                        <button
                            type="button"
                            className="text-[13px] font-medium text-[#3429EE] hover:underline"
                        >
                            Забыли пароль?
                        </button>
                    </div>

                    <div className="relative">
                        <LockKeyhole
                            size={19}
                            strokeWidth={1.8}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-[#7C7D91]
                            "
                        />

                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="
                                h-[49px]
                                w-full
                                rounded-[8px]
                                border
                                border-[#BEC0D4]
                                bg-[#FCFCFE]
                                pl-10
                                pr-11
                                text-[15px]
                                text-[#22232D]
                                outline-none
                                transition
                                placeholder:text-[#77788B]
                                focus:border-[#4F46E5]
                                focus:ring-2
                                focus:ring-[#4F46E5]/10
                            "
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((prev) => !prev)
                            }
                            className="
                                absolute
                                right-4
                                top-1/2
                                -translate-y-1/2
                                text-[#77788B]
                                hover:text-[#4F46E5]
                            "
                            aria-label={
                                showPassword
                                    ? 'Скрыть пароль'
                                    : 'Показать пароль'
                            }
                        >
                            {showPassword ? (
                                <Eye size={20} />
                            ) : (
                                <EyeOff size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Ошибка */}
                {errorMessage && (
                    <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                        {errorMessage}
                    </div>
                )}

                {/* Кнопка входа */}
                <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="
                        mt-6
                        flex
                        h-[44px]
                        w-full
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-[8px]
                        bg-[#4F46E5]
                        text-[14px]
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#4338CA]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {loginMutation.isPending
                        ? 'Вход...'
                        : 'Войти'}
                </button>

                {/* Разделитель */}
                <div className="my-7 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#C7C9D6]" />

                    <span className="whitespace-nowrap text-[12px] font-medium uppercase text-[#4F5060]">
                        или продолжить через
                    </span>

                    <div className="h-px flex-1 bg-[#C7C9D6]" />
                </div>

                {/* Вход через сервисы */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        className="
                            flex
                            h-[42px]
                            items-center
                            justify-center
                            gap-2
                            rounded-[8px]
                            border
                            border-[#BFC1D5]
                            bg-white
                            text-[14px]
                            font-medium
                            text-[#172033]
                            transition
                            hover:bg-[#F7F7FA]
                        "
                    >
                        <span className="text-[18px] font-bold text-[#4285F4]">
                            G
                        </span>

                        Google
                    </button>

                    <button
                        type="button"
                        className="
                            flex
                            h-[42px]
                            items-center
                            justify-center
                            gap-2
                            rounded-[8px]
                            border
                            border-[#BFC1D5]
                            bg-white
                            text-[14px]
                            font-medium
                            text-[#172033]
                            transition
                            hover:bg-[#F7F7FA]
                        "
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-[17px] w-[17px] fill-[#102033]"
                        >
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.1zM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>

                        Apple
                    </button>
                </div>

                {/* Регистрация */}
                <div className="mt-8 text-center text-[15px] text-[#484956]">
                    Нет аккаунта?{' '}

                    <NavLink
                        to="/auth/register"
                        className="font-medium text-[#2518EE] hover:underline"
                    >
                        Зарегистрироваться
                    </NavLink>
                </div>

            </form>
        </div>
    );
}
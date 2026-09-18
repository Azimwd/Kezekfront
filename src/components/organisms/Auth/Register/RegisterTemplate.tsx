import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    UserRound,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { registerUser } from '../../../../api/auth';

export default function RegisterTemplate() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [role, setRole] = useState<'client' | 'business_owner'>('client');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [agreement, setAgreement] = useState(false);
    const [validationError, setValidationError] = useState('');

    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: () =>
            registerUser({
                email,
                first_name: firstName,
                last_name: lastName,
                role,
                password,
                confirm_password: confirmPassword
            }),

        onSuccess: (data) => {
            console.log('Успешная регистрация:', data);

            navigate('/auth/login');
        },

        onError: (error) => {
            console.error('Ошибка регистрации:', error);
        }
    });

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setValidationError('');

        if (
            !email.trim() ||
            !firstName.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            setValidationError('Пожалуйста, заполните все поля');
            return;
        }

        if (password !== confirmPassword) {
            setValidationError('Пароли не совпадают');
            return;
        }

        if (!agreement) {
            setValidationError(
                'Необходимо принять пользовательское соглашение'
            );
            return;
        }

        registerMutation.mutate();
    };

    const getServerError = () => {
        if (!registerMutation.isError) {
            return null;
        }

        if (axios.isAxiosError(registerMutation.error)) {
            const data = registerMutation.error.response?.data;

            if (typeof data?.message === 'string') {
                return data.message;
            }

            if (typeof data?.detail === 'string') {
                return data.detail;
            }

            if (data?.email) {
                return Array.isArray(data.email)
                    ? data.email[0]
                    : data.email;
            }
        }

        return 'Ошибка при регистрации. Проверьте введённые данные.';
    };

    const serverError = getServerError();

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full"
        >
            {/* Заголовок */}
            <div>
                <h2 className="text-[26px] font-bold text-[#14213D]">
                    Создать аккаунт
                </h2>

                <p className="mt-1 text-sm text-[#646879]">
                    Заполните данные, чтобы начать работу.
                </p>
            </div>

            {/* ROLE */}
            <div className="mt-6 flex h-[42px] rounded-lg bg-[#E8EEFF] p-1">
                <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`
                        flex-1
                        cursor-pointer
                        rounded-md
                        text-sm
                        font-medium
                        transition
                        ${
                            role === 'client'
                                ? 'bg-white text-[#4F46E5] shadow-sm'
                                : 'text-[#4C5060]'
                        }
                    `}
                >
                    Клиент
                </button>

                <button
                    type="button"
                    onClick={() => setRole('business_owner')}
                    className={`
                        flex-1
                        cursor-pointer
                        rounded-md
                        text-sm
                        font-medium
                        transition
                        ${
                            role === 'business_owner'
                                ? 'bg-white text-[#4F46E5] shadow-sm'
                                : 'text-[#4C5060]'
                        }
                    `}
                >
                    Владелец бизнеса
                </button>
            </div>

            {/* Имя + Фамилия */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#172033]">
                        Имя *
                    </label>

                    <div className="relative">
                        <UserRound
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D91]"
                        />

                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) =>
                                setFirstName(e.target.value)
                            }
                            placeholder="Имя"
                            autoComplete="given-name"
                            className="
                                h-[46px]
                                w-full
                                rounded-[7px]
                                border
                                border-[#AEB2C5]
                                bg-white
                                pl-10
                                pr-3
                                text-sm
                                outline-none
                                transition
                                placeholder:text-[#8A8C9C]
                                focus:border-[#4F46E5]
                                focus:ring-2
                                focus:ring-[#4F46E5]/10
                            "
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#172033]">
                        Фамилия
                    </label>

                    <div className="relative">
                        <UserRound
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D91]"
                        />

                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) =>
                                setLastName(e.target.value)
                            }
                            placeholder="Фамилия"
                            autoComplete="family-name"
                            className="
                                h-[46px]
                                w-full
                                rounded-[7px]
                                border
                                border-[#AEB2C5]
                                bg-white
                                pl-10
                                pr-3
                                text-sm
                                outline-none
                                transition
                                placeholder:text-[#8A8C9C]
                                focus:border-[#4F46E5]
                                focus:ring-2
                                focus:ring-[#4F46E5]/10
                            "
                        />
                    </div>
                </div>
            </div>

            {/* EMAIL */}
            <div className="mt-4">
                <label className="mb-2 block text-[13px] font-medium text-[#172033]">
                    Email *
                </label>

                <div className="relative">
                    <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D91]"
                    />

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="example@mail.com"
                        autoComplete="email"
                        className="
                            h-[46px]
                            w-full
                            rounded-[7px]
                            border
                            border-[#AEB2C5]
                            bg-white
                            pl-10
                            pr-3
                            text-sm
                            outline-none
                            transition
                            placeholder:text-[#8A8C9C]
                            focus:border-[#4F46E5]
                            focus:ring-2
                            focus:ring-[#4F46E5]/10
                        "
                    />
                </div>
            </div>

            {/* PASSWORD */}
            <div className="mt-4">
                <label className="mb-2 block text-[13px] font-medium text-[#172033]">
                    Пароль *
                </label>

                <div className="relative">
                    <LockKeyhole
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D91]"
                    />

                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Введите пароль"
                        autoComplete="new-password"
                        className="
                            h-[46px]
                            w-full
                            rounded-[7px]
                            border
                            border-[#AEB2C5]
                            bg-white
                            pl-10
                            pr-11
                            text-sm
                            outline-none
                            transition
                            placeholder:text-[#8A8C9C]
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
                            right-3
                            top-1/2
                            -translate-y-1/2
                            cursor-pointer
                            text-[#7C7D91]
                            hover:text-[#4F46E5]
                        "
                    >
                        {showPassword ? (
                            <Eye size={19} />
                        ) : (
                            <EyeOff size={19} />
                        )}
                    </button>
                </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mt-4">
                <label className="mb-2 block text-[13px] font-medium text-[#172033]">
                    Подтвердите пароль *
                </label>

                <div className="relative">
                    <LockKeyhole
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D91]"
                    />

                    <input
                        type={
                            showConfirmPassword
                                ? 'text'
                                : 'password'
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        placeholder="Повторите пароль"
                        autoComplete="new-password"
                        className="
                            h-[46px]
                            w-full
                            rounded-[7px]
                            border
                            border-[#AEB2C5]
                            bg-white
                            pl-10
                            pr-11
                            text-sm
                            outline-none
                            transition
                            placeholder:text-[#8A8C9C]
                            focus:border-[#4F46E5]
                            focus:ring-2
                            focus:ring-[#4F46E5]/10
                        "
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(
                                (prev) => !prev
                            )
                        }
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            cursor-pointer
                            text-[#7C7D91]
                            hover:text-[#4F46E5]
                        "
                    >
                        {showConfirmPassword ? (
                            <Eye size={19} />
                        ) : (
                            <EyeOff size={19} />
                        )}
                    </button>
                </div>
            </div>

            {/* AGREEMENT */}
            <label className="mt-5 flex cursor-pointer items-start gap-3">
                <input
                    type="checkbox"
                    checked={agreement}
                    onChange={(e) =>
                        setAgreement(e.target.checked)
                    }
                    className="
                        mt-[2px]
                        h-4
                        w-4
                        cursor-pointer
                        accent-[#4F46E5]
                    "
                />

                <span className="text-[12px] leading-5 text-[#505365]">
                    Я принимаю{' '}
                    <a
                        href="/terms"
                        className="text-[#4F46E5] hover:underline"
                    >
                        пользовательское соглашение
                    </a>{' '}
                    и{' '}
                    <a
                        href="/privacy"
                        className="text-[#4F46E5] hover:underline"
                    >
                        политику конфиденциальности
                    </a>
                </span>
            </label>

            {/* ERRORS */}
            {validationError && (
                <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                    {validationError}
                </div>
            )}

            {serverError && (
                <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                    {serverError}
                </div>
            )}

            {/* SUBMIT */}
            <button
                type="submit"
                disabled={registerMutation.isPending}
                className="
                    mt-6
                    flex
                    h-[46px]
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-[7px]
                    bg-[#4F46E5]
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#4338CA]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                "
            >
                {registerMutation.isPending
                    ? 'Регистрация...'
                    : 'Создать аккаунт'}
            </button>

            {/* LOGIN */}
            <div className="mt-6 text-center text-[13px] text-[#666979]">
                Уже есть аккаунт?{' '}

                <NavLink
                    to="/auth/login"
                    className="font-medium text-[#4F46E5] hover:underline"
                >
                    Войти
                </NavLink>
            </div>
        </form>
    );
}
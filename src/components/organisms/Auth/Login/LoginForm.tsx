import GoogleButton from "../Google/GoogleButton";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getAuthReturnPath,
  clearAuthReturnPath,
  verificationRequired,
} from "../../../../api/accountSecurity";

import { loginUser } from "../../../../api/auth";
import { useUser } from "../../../../context/UserContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const loginMutation = useMutation({
    mutationFn: () => loginUser(email, password),

    onSuccess: (data) => {
      setUser(data.data);

      const from = getAuthReturnPath(
        (location.state as { from?: unknown } | null)?.from,
      );
      clearAuthReturnPath();
      navigate(from ?? (data.data.role === "business_owner" ? "/crm" : "/"), {
        replace: true,
      });
    },
    onError: (error) => {
      if (verificationRequired(error)) {
        setUser(null);
        navigate("/auth/verify-email", {
          state: {
            email: email.trim(),
            from: (location.state as { from?: string } | null)?.from,
          },
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        return "Неверный email или пароль";
      }

      const data = loginMutation.error.response?.data as {
        detail?: string;
        message?: string;
      };

      return data?.detail || data?.message || null;
    }

    return "Ошибка авторизации";
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="w-full rounded-[24px] border border-[#E0E3EC] bg-white px-8 py-8 shadow-[0_12px_35px_rgba(40,48,90,0.08)]">
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-[14px] font-medium text-[#172033]"
          >
            Email
          </label>

          <div className="relative">
            <UserRound
              size={19}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C7D91]"
            />

            <input
              id="email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              autoComplete="username"
              className="h-[49px] w-full rounded-[8px] border border-[#BEC0D4] bg-[#FCFCFE] pl-10 pr-4 text-[15px] text-[#22232D] outline-none transition placeholder:text-[#818293] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10"
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

            <NavLink
              to="/auth/forgot-password"
              state={{
                email,
                from: (location.state as { from?: string } | null)?.from,
              }}
              className="text-[13px] font-medium text-[#3429EE] hover:underline"
            >
              Забыли пароль?
            </NavLink>
          </div>

          <div className="relative">
            <LockKeyhole
              size={19}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C7D91]"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-[49px] w-full rounded-[8px] border border-[#BEC0D4] bg-[#FCFCFE] pl-10 pr-11 text-[15px] text-[#22232D] outline-none transition placeholder:text-[#77788B] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77788B] hover:text-[#4F46E5]"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
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
          className="mt-6 flex h-[44px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#4F46E5] text-[14px] font-semibold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? "Вход..." : "Войти"}
        </button>

        {/* Разделитель */}
        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#C7C9D6]" />

          <span className="whitespace-nowrap text-[12px] font-medium uppercase text-[#4F5060]">
            или продолжить через
          </span>

          <div className="h-px flex-1 bg-[#C7C9D6]" />
        </div>

        <GoogleButton disabled={loginMutation.isPending} />

        {/* Регистрация */}
        <div className="mt-8 text-center text-[15px] text-[#484956]">
          Нет аккаунта?{" "}
          <NavLink
            to="/auth/register"
            state={location.state}
            className="font-medium text-[#2518EE] hover:underline"
          >
            Зарегистрироваться
          </NavLink>
        </div>
      </form>
    </div>
  );
}

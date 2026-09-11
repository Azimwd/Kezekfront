import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getCurrentUser } from '../api/auth';

export default function BusinessOwnerRoute() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await getCurrentUser();

                const userRole =
                    response?.data?.role ??
                    response?.role;

                setIsAuthenticated(true);
                setRole(userRole);
            } catch {
                setIsAuthenticated(false);
                setRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, []);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    // Не авторизован
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    // Авторизован, но не владелец бизнеса
    if (role !== 'business_owner') {
        return <Navigate to="/" replace />;
    }

    // business_owner
    return <Outlet />;
}
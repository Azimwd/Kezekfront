import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
export default function BusinessOwnerRoute() {
  const { user, isLoadingUser } = useUser();
  const location = useLocation();
  if (isLoadingUser)
    return (
      <div role="status" className="p-6 text-slate-500">
        Загрузка…
      </div>
    );
  if (!user)
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  if (user.role !== "business_owner") return <Navigate to="/" replace />;
  return <Outlet />;
}

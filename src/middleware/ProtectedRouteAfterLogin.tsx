import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../services/auth.service";
import { MainLayoutShimmer } from "../components/shared/Shimmer";

// Guards the login page itself — if a valid session already exists,
// skip straight past the login form instead of showing it.
export const ProtectedRouteAfterLogin = () => {
  const { data: admin, isLoading } = useMe();

  if (isLoading) {
    return <MainLayoutShimmer />;
  }

  if (admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

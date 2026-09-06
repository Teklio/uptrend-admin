import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../services/auth.service";
import { useAppDispatch } from "../store/hooks";
import { loginSuccess, logoutSuccess } from "../store/slices/authSlice";
import { MainLayoutShimmer } from "../components/shared/Shimmer";

// Verifies the session against the server on every mount (via GET
// /v1/admin/auth/me) rather than trusting persisted Redux state alone —
// the backend's authenticateAdmin middleware silently refreshes an expired
// access token from the refresh-token cookie, so this call also exercises
// that refresh. React Query's staleTime keeps this cheap across route
// changes within the same session.
export const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const { data: admin, isLoading, isError, isFetched } = useMe();

  useEffect(() => {
    if (admin) {
      dispatch(loginSuccess(admin));
    } else if (isFetched && isError) {
      dispatch(logoutSuccess());
    }
  }, [admin, isFetched, isError, dispatch]);

  if (isLoading) {
    return <MainLayoutShimmer />;
  }

  if (!admin) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <Outlet />;
};

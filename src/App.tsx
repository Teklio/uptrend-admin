import { lazy, Suspense } from "react";
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import { MainLayoutShimmer } from "./components/shared/Shimmer";
import { ProtectedRoute } from "./middleware/ProtectedRoute";
import { ProtectedRouteAfterLogin } from "./middleware/ProtectedRouteAfterLogin";
import { AppToaster } from "./components/shared/AppToaster";
import { BeforeUnloadGuard } from "./components/shared/BeforeUnloadGuard";

const MainLayout = lazy(() => import("./components/layout/MainLayout"));
const LoginPage = lazy(() => import("./pages/login"));
const DashboardPage = lazy(() => import("./pages/dashboard"));
const CoursesPage = lazy(() => import("./pages/courses"));
const CourseDetailPage = lazy(() => import("./pages/courses/detail"));
const PaymentsPage = lazy(() => import("./pages/payments"));
const UsersPage = lazy(() => import("./pages/users"));
const ReviewsPage = lazy(() => import("./pages/reviews"));
const ProfilePage = lazy(() => import("./pages/profile"));

// A data router (rather than plain BrowserRouter) is required for
// useBlocker, which the course-detail page uses to confirm in-app
// navigation away from an in-progress video upload.
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRouteAfterLogin />}>
        <Route path="/auth/signin" element={<LoginPage />} />
      </Route>
    </>,
  ),
);

function App() {
  return (
    <>
      <BeforeUnloadGuard />
      <Suspense fallback={<MainLayoutShimmer />}>
        <RouterProvider router={router} />
      </Suspense>
      <AppToaster />
    </>
  );
}

export default App;

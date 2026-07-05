import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./providers/theme-provider.tsx";
import { PlanAuthProvider } from "./config/auth-context.tsx";
import { Toaster } from "@/components/ui/atoms/sonner";
import {
  BackendFetch,
  DevTools,
  FormatSimple,
  Tolgee,
  TolgeeProvider,
} from "@tolgee/react";
import { LANGUAGE } from "./lib/constant.ts";
import Login from "./components/auth/login/Login";
import ForgotPassword from "./components/auth/forgot-password/ForgotPassword";
import EmailVerification from "./components/auth/email-verification/EmailVerification";
import Signup from "./components/auth/signup/Signup";
import Dashboard from "./components/routes/dashboard/Dashboard";
import Analytics from "./components/routes/analytics/Analytics";
import CreatePlan from "./components/routes/create-plan/CreatePlan";
import PlanNewLegacyRedirect from "./components/routes/create-plan/PlanNewLegacyRedirect";
import CreateSeries from "./components/routes/create-series/CreateSeries";
import SeriesDetailsPage from "./components/routes/series-details/SeriesDetailsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PlanRouteGuard from "./components/auth/PlanRouteGuard";
import ResetPassword from "./components/auth/reset-password/ResetPassword.tsx";
import PlanDetailsPage from "./components/routes/task/PlanDetailsPage.tsx";
import Profile from "./components/routes/profile/Profile.tsx";
import Tags from "./components/routes/tags/Tags.tsx";
import VerseOfDay from "./components/routes/verse-of-day/VerseOfDay.tsx";
import Groups from "./components/routes/groups/Groups.tsx";
import GroupFormPage from "./components/routes/groups/GroupFormPage.tsx";
import GroupDetailsPage from "./components/routes/groups/GroupDetailsPage.tsx";
import AdminAuthorsPage from "./components/routes/admin-authors/AdminAuthorsPage.tsx";
import ChinaRestrictionsPage from "./components/routes/china-restrictions/ChinaRestrictionsPage.tsx";
import { UserbackProvider } from "./config/userback-context.tsx";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./routes/paths.ts";

const queryClient = new QueryClient();
const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE || "en";
const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatSimple())
  .use(
    BackendFetch({
      prefix:
        "https://cdn.tolg.ee/300fa406912d362adee8a983f8f4682d/reactjs_json",
      fallbackOnFail: true,
    }),
  )
  .init({
    language: localStorage.getItem(LANGUAGE) || defaultLanguage,
    fallbackLanguage: "en",
  });

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/verify-email",
        element: <EmailVerification />,
      },
      {
        path: ROUTES.home,
        element: <Navigate to={ROUTES.dashboard} replace />,
      },
      {
        path: ROUTES.dashboard,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/plan",
        element: <Navigate to={ROUTES.dashboard} replace />,
      },
      {
        path: ROUTES.planNew,
        element: (
          <ProtectedRoute>
            <PlanRouteGuard>
              <PlanNewLegacyRedirect />
            </PlanRouteGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "/groups/:groupId/plan/new",
        element: (
          <ProtectedRoute>
            <PlanRouteGuard>
              <CreatePlan />
            </PlanRouteGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "/plan/:planId/edit",
        element: (
          <ProtectedRoute>
            <PlanRouteGuard>
              <CreatePlan />
            </PlanRouteGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "/plan/:planId",
        element: (
          <ProtectedRoute>
            <PlanRouteGuard>
              <PlanDetailsPage />
            </PlanRouteGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.seriesNew,
        element: <Navigate to={ROUTES.groups} replace />,
      },
      {
        path: "/groups/:groupId/series/new",
        element: (
          <ProtectedRoute>
            <CreateSeries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/series/:seriesId/edit",
        element: (
          <ProtectedRoute>
            <CreateSeries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/series/:seriesId",
        element: (
          <ProtectedRoute>
            <SeriesDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/analytics",
        element: (
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.profile,
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.tags,
        element: (
          <ProtectedRoute>
            <Tags />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.verseOfDay,
        element: (
          <ProtectedRoute>
            <VerseOfDay />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.groups,
        element: (
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.groupNew,
        element: (
          <ProtectedRoute>
            <GroupFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/groups/:groupId/edit",
        element: (
          <ProtectedRoute>
            <GroupFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/groups/:groupId",
        element: (
          <ProtectedRoute>
            <GroupDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.adminAuthors,
        element: (
          <ProtectedRoute>
            <AdminAuthorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.adminChinaRestrictions,
        element: (
          <ProtectedRoute>
            <ChinaRestrictionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: (
          <ProtectedRoute>
            <Navigate to={ROUTES.dashboard} replace />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TolgeeProvider tolgee={tolgee}>
        <PlanAuthProvider>
          <UserbackProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <RouterProvider router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
              <Toaster />
            </ThemeProvider>
          </UserbackProvider>
        </PlanAuthProvider>
      </TolgeeProvider>
    </QueryClientProvider>
  </StrictMode>,
);

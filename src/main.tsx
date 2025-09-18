import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PlanDetailsPanel from "./components/routes/create-plan/PlanDetailsPanel";

const queryClient = new QueryClient();
const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE || "bo-IN";
const tolgee = new (Tolgee as any)()
  .use(DevTools)
  .use(FormatSimple)
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
        path: "/verify-email",
        element: <EmailVerification />,
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/create-plan/:plan_id",
        element: (
          <ProtectedRoute>
            <CreatePlan />
          </ProtectedRoute>
        ),
      },
      {
        path: "/plan-details",
        element: (
          <ProtectedRoute>
            <PlanDetailsPanel />
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
        path: "*",
        element: (
          <ProtectedRoute>
            <Dashboard />
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
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
            <Toaster />
          </ThemeProvider>
        </PlanAuthProvider>
      </TolgeeProvider>
    </QueryClientProvider>
  </StrictMode>,
);

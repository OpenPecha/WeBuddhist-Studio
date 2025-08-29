import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/auth/login/Login";
import ForgotPassword from "./components/auth/forgot-password/ForgotPassword";
import EmailVerification from "./components/auth/email-verification/EmailVerification";
import Navbar from "./components/ui/molecules/nav-bar/Navbar";
import Signup from "./components/auth/signup/Signup";
import Dashboard from "./components/routes/dashboard/Dashboard";
import Createplan from "./components/routes/create-plan/Createplan";
import Analytics from "./components/routes/analytics/Analytics";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { setFontVariables } from "./lib/font-config";
import { useEffect } from "react";
import { LANGUAGE } from "./lib/constant";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/verify-email";

  useEffect(() => {
    setFontVariables(localStorage.getItem(LANGUAGE) || "en");
  }, []);

  return (
    <div className="flex flex-col h-screen w-full p-2">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-plan"
          element={
            <ProtectedRoute>
              <Createplan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/ui/molecules/nav-bar/Navbar";
import { setFontVariables } from "./lib/font-config";
import { useEffect, useState } from "react";
import { LANGUAGE } from "./lib/constant";
import { useAuth } from "./config/auth-context";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "./config/axios-config";

function App() {
  const location = useLocation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [intervalId, setIntervalId] = useState(null);

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];
  const hideNavbar = authRoutes.includes(location.pathname);
  const loginMutation = useMutation({
    mutationFn: async (refreshToken: string) => {
      const { data } = await axiosInstance.post(
        "/api/v1/cms/auth/refresh-token",
        {
          token: refreshToken,
        },
      );
      return data;
    },
    onSuccess: (data: any) => {
      sessionStorage.setItem("accessToken", data.access_token);
      login(data.access_token);
      if (!intervalId) {
        startTokenRefreshCounter();
      }
    },
    onError: () => {
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    },
  });

  const startTokenRefreshCounter = () => {
    const interval = setInterval(() => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        loginMutation.mutate(refreshToken);
      }
    }, 60000);
    setIntervalId(interval as any);
  };
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      loginMutation.mutate(refreshToken);
    }
    setFontVariables(localStorage.getItem(LANGUAGE) || "en");
  }, []);

  return (
    <div className="flex flex-col h-screen w-full">
      {!hideNavbar && <Navbar />}
      <Outlet />
    </div>
  );
}

export default App;

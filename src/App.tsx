import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/ui/molecules/nav-bar/Navbar";
import { setFontVariables } from "./lib/font-config";
import { useEffect } from "react";
import { LANGUAGE } from "./lib/constant";

function App() {
  const location = useLocation();
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];
  const hideNavbar = authRoutes.includes(location.pathname);

  useEffect(() => {
    setFontVariables(localStorage.getItem(LANGUAGE) || "en");
  }, []);

  return (
    <div className="flex flex-col h-screen w-full p-2">
      {!hideNavbar && <Navbar />}
      <Outlet />
    </div>
  );
}

export default App;

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constant";
import { ROUTES } from "@/routes/paths";
import { clearPendingAuth0Token } from "@/config/auth0-config";
import { useStudioAuth0Logout } from "@/config/studio-auth0";

type AuthContextValue = {
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  login: (accessToken: string, refreshToken?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const PlanAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth0Logout = useStudioAuth0Logout();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    setIsLoggedIn(Boolean(accessToken && refreshToken));
    setIsAuthLoading(false);
  }, []);

  const login = useCallback(
    (accessToken: string, refreshToken?: string | null) => {
      sessionStorage.setItem(ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN, refreshToken);
      }
      setIsLoggedIn(true);
    },
    [],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    clearPendingAuth0Token();
    setIsLoggedIn(false);
    auth0Logout(`${window.location.origin}${ROUTES.login}`);
  }, [auth0Logout]);

  const contextValue = useMemo(
    () => ({ isLoggedIn, login, logout, isAuthLoading }),
    [isLoggedIn, login, logout, isAuthLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within PlanAuthProvider");
  }
  return context;
};

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ACCESS_TOKEN,REFRESH_TOKEN } from "@/lib/constant";

const AuthContext = createContext<any>(null);

export const PlanAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const accessToken = sessionStorage.getItem(ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (accessToken && (refreshToken)) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
        setIsAuthLoading(false);
    }, []);

    const login = (accessToken:string, refreshToken:string|null) => {
        sessionStorage.setItem(ACCESS_TOKEN, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN, refreshToken);
        }
        setIsLoggedIn(true);
    };

    const logout = () => {
        sessionStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        setIsLoggedIn(false);
    };
    const contextValue = useMemo(() => ({ isLoggedIn, login, logout, isAuthLoading }), [isLoggedIn, isAuthLoading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};


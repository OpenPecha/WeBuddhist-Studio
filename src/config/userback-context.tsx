// UserbackProvider.tsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import Userback from "@userback/widget";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios-config";
import { useAuth } from "./auth-context";
import { USERBACK_ID } from "@/lib/constant";

export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get(`/api/v1/authors/info`);
  return data;
};

const UserbackContext = createContext({ userback: null });
const usebackId = import.meta.env.VITE_USERBACK_ID || USERBACK_ID;
export const UserbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userback, setUserback] = useState(null);
  const { isLoggedIn } = useAuth();
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
    enabled: isLoggedIn,
  });

  const mainUser = userInfo;
  useEffect(() => {
    if (!mainUser) return;
    const init = async (user: any) => {
      const id = user?.id || user?.email || "anonymous";
      const name = user?.name || user?.firstname || "Anonymous User";
      const email = user?.email || "anonymous@pecha.io";
      try {
        const options = {
          user_data: {
            id,
            info: {
              name,
              email,
            },
          },
        };
        const instance = await Userback(usebackId, options);
        console.log("Userback initialized successfully:", instance);
        setUserback(instance as any);
      } catch (error) {
        console.error("Failed to initialize Userback:", error);
      }
    };
    init(mainUser);
  }, [mainUser]);
  const contextValue = useMemo(() => ({ userback }), [userback]);

  return (
    <UserbackContext.Provider value={contextValue}>
      {children}
    </UserbackContext.Provider>
  );
};

export const useUserback = () => useContext(UserbackContext);

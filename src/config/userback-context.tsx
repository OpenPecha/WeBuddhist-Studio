// UserbackProvider.tsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import Userback from "@userback/widget";
import { useAuth } from "./auth-context";
import { USERBACK_ID } from "@/lib/constant";
import { useUserInfo } from "@/hooks/useUserInfo";

const UserbackContext = createContext({ userback: null });
const usebackId = import.meta.env.VITE_USERBACK_ID || USERBACK_ID;

export const UserbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userback, setUserback] = useState(null);
  const { isLoggedIn } = useAuth();
  const { data: userInfo } = useUserInfo({ enabled: isLoggedIn });

  useEffect(() => {
    if (!userInfo) return;
    const init = async (user: typeof userInfo) => {
      const id = user?.id || user?.email || "anonymous";
      const name = user?.firstname || "Anonymous User";
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
    init(userInfo);
  }, [userInfo]);

  const contextValue = useMemo(() => ({ userback }), [userback]);

  return (
    <UserbackContext.Provider value={contextValue}>
      {children}
    </UserbackContext.Provider>
  );
};

export const useUserback = () => useContext(UserbackContext);

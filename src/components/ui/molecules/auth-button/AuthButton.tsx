import { useAuth } from "@/config/auth-context";
import { Button } from "../../atoms/button";
import { Skeleton } from "../../atoms/skeleton";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { LogOut } from "lucide-react";
export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get(
    `${BACKEND_BASE_URL}/api/v1/users/info`,
  );
  return data;
};
const AuthButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { isLoggedIn, logout, isAuthLoading } = useAuth();
  const { data: userInfo, isLoading: isUserInfoLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
  });
  function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    logout();
    navigate("/login");
  }
  const isLoading = isAuthLoading || (isLoggedIn && isUserInfoLoading);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-16" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center font-dynamic gap-2">
        <img
          src={userInfo.avatar_url}
          alt="user"
          className="w-8 h-8 hidden md:block rounded-full"
        />
        <div className="md:flex hidden flex-col">
          <span className="text-sm font-medium">
            {userInfo.firstname} {userInfo.lastname}
          </span>
          <span className="text-xs text-[#8a8a8a]">{userInfo.email}</span>
        </div>
        <Button onClick={handleLogout} variant="outline">
          <span className="text-sm font-medium md:block hidden">
            {t("header.profileMenu.log_out")}
          </span>
          <span className="md:hidden">
            <LogOut className="w-4 h-4" />
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center font-dynamic gap-2">
      <Button onClick={() => navigate("/login")} variant="outline">
        <span className="text-sm font-medium">
          {t("login.form.button.login_in")}
        </span>
      </Button>
      <Button onClick={() => navigate("/signup")} variant="secondary">
        <span className="text-sm font-medium">{t("common.sign_up")}</span>
      </Button>
    </div>
  );
};

export default AuthButton;

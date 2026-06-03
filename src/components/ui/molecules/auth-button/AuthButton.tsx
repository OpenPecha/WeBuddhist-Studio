import { useAuth } from "@/config/auth-context";
import { NO_PROFILE_IMAGE } from "@/lib/constant";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import { useUserInfo } from "@/hooks/useUserInfo";

const AuthButton = () => {
  const { isLoggedIn } = useAuth();
  const { data: userInfo } = useUserInfo();

  if (isLoggedIn) {
    return (
      <Link to={ROUTES.profile}>
        <div className="flex items-center font-dynamic gap-2">
          <img
            src={
              userInfo?.image?.thumbnail ||
              userInfo?.image_url ||
              NO_PROFILE_IMAGE
            }
            alt="user"
            className="hidden w-10 h-10 object-cover md:block rounded-full"
          />
          <div className="md:flex hidden flex-col">
            <span className="text-sm font-medium">
              {userInfo?.firstname} {userInfo?.lastname}
            </span>
            <span className="text-xs text-[#8a8a8a]">{userInfo?.email}</span>
          </div>
        </div>
      </Link>
    );
  }
};

export default AuthButton;

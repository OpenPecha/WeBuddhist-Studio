import { useAuth } from "@/config/auth-context";
import axiosInstance from "@/config/axios-config";
import { NO_PROFILE_IMAGE } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get(`/api/v1/authors/info`);
  return data;
};
const AuthButton = () => {
  const { isLoggedIn } = useAuth();
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
  });

  if (isLoggedIn) {
    return (
      <Link to={`/profile/${userInfo?.id}`}>
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

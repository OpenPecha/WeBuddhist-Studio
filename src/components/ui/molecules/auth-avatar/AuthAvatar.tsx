import { useAuth } from "@/config/auth-context";
import axiosInstance from "@/config/axios-config";
import { NO_PROFILE_IMAGE } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get(`/api/v1/authors/info`);
  return data;
};

const AuthAvatar = () => {
  const { isLoggedIn } = useAuth();
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
  });

  if (isLoggedIn) {
    return (
      <Link to={`/profile/${userInfo?.id}`}>
        <img
          src={
            userInfo?.image?.thumbnail ||
            userInfo?.image_url ||
            NO_PROFILE_IMAGE
          }
          alt="user"
          className="w-9 h-9 object-cover rounded-full"
        />
      </Link>
    );
  }
};

export default AuthAvatar;

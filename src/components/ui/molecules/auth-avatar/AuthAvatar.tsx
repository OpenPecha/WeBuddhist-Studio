import { Pecha } from "@/components/ui/shadimport";
import { useAuth } from "@/config/auth-context";
import { NO_PROFILE_IMAGE } from "@/lib/constant";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import { useUserInfo } from "@/hooks/useUserInfo";

const AuthAvatar = () => {
  const { isLoggedIn } = useAuth();
  const { data: userInfo } = useUserInfo();

  if (isLoggedIn) {
    return (
      <Link to={ROUTES.profile}>
        <Pecha.Avatar className="w-9 h-9 object-cover rounded-full">
          <Pecha.AvatarImage
            src={
              userInfo?.image?.thumbnail ||
              userInfo?.image_url ||
              NO_PROFILE_IMAGE
            }
            className="object-cover"
          />
          <Pecha.AvatarFallback>WB</Pecha.AvatarFallback>
        </Pecha.Avatar>
      </Link>
    );
  }
};

export default AuthAvatar;

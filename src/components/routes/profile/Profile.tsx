import axiosInstance from "@/config/axios-config";
import { NO_PROFILE_IMAGE } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Pecha } from "@/components/ui/shadimport";

export const fetchUserInfo = async (author_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/authors/${author_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};
const Profile = () => {
  const { author_id } = useParams();
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo", author_id],
    queryFn: () => fetchUserInfo(author_id as string),
  });
  return (
    <div>
      <div className="flex items-left flex-col gap-2 border-dashed p-4 border justify-left">
        <div className="flex items-center gap-2">
          <div className="w-[60px] h-[60px] flex items-center justify-center">
            <img src={userInfo?.image_url || NO_PROFILE_IMAGE} alt="profile" />
          </div>
          <div>
            <p>
              {userInfo?.firstname} {userInfo?.lastname}
            </p>
            {userInfo?.email}
          </div>
        </div>
        <div>
          <Pecha.Button variant="outline">Edit</Pecha.Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

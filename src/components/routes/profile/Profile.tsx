import axiosInstance from "@/config/axios-config";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Pecha } from "@/components/ui/shadimport";
import { useState } from "react";
import UserCard from "@/components/ui/molecules/user-card/UserCard";
import ProfileEditForm from "@/components/ui/molecules/profile-edit-form/ProfileEditForm";

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
  const [isEditing, setIsEditing] = useState(false);

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["userInfo", author_id],
    queryFn: () => fetchUserInfo(author_id as string),
    enabled: !!author_id,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Pecha.Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center  mx-auto p-6">
      <div
        className={`border w-full border-dashed rounded-lg space-y-6 ${!isEditing && "max-w-2xl"}`}
      >
        <div className="flex h-full  border-b border-dashed border-gray-300 dark:border-input justify-between items-center p-4">
          <h1 className="text-xl font-semibold font-mono">Profile</h1>
          {!isEditing ? (
            <Pecha.Button variant="outline" onClick={handleEdit}>
              Edit
            </Pecha.Button>
          ) : (
            <Pecha.Button variant="outline" onClick={handleCancel}>
              Cancel
            </Pecha.Button>
          )}
        </div>
        {!isEditing ? (
          <UserCard userInfo={userInfo} />
        ) : (
          <ProfileEditForm
            userInfo={userInfo}
            author_id={author_id as string}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;

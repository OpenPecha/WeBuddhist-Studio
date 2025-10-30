import axiosInstance from "@/config/axios-config";
import { SOCIAL_PLATFORMS } from "@/lib/constant";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Pecha } from "@/components/ui/shadimport";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { profileSchema, type ProfileFormData } from "@/schema/ProfileSchema";
import { Label } from "@/components/ui/atoms/label";
import { toast } from "sonner";
import UserCard from "@/components/ui/molecules/user-card/UserCard";
import { IoMdClose } from "react-icons/io";

interface SocialProfile {
  account: string;
  url: string;
}

export const fetchUserInfo = async (author_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/authors/${author_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};

export const updateUserProfile = async (
  profileData: ProfileFormData & { social_profiles?: SocialProfile[] },
) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(
    `/api/v1/cms/authors/info`,
    profileData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};

const Profile = () => {
  const { author_id } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["userInfo", author_id],
    queryFn: () => fetchUserInfo(author_id as string),
    enabled: !!author_id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (
      profileData: ProfileFormData & { social_profiles?: SocialProfile[] },
    ) => updateUserProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInfo", author_id] });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setSocialProfiles(userInfo?.social_profiles || []);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSocialProfiles([]);
  };

  const handleAddSocialProfile = () => {
    if (socialProfiles.length < 5) {
      setSocialProfiles([...socialProfiles, { account: "", url: "" }]);
    }
  };

  const handleRemoveSocialProfile = (index: number) => {
    setSocialProfiles(socialProfiles.filter((_, i) => i !== index));
  };

  const handleSocialProfileChange = (
    index: number,
    field: "account" | "url",
    value: string,
  ) => {
    const updated = [...socialProfiles];
    updated[index][field] = value;
    setSocialProfiles(updated);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstname = formData.get("firstname") as string;
    const lastname = formData.get("lastname") as string;
    const bio = formData.get("bio") as string;
    const image_url = formData.get("image_url") as string;

    const formDataObj = {
      firstname,
      lastname,
      bio,
      image_url,
    };

    try {
      const validatedData = profileSchema.parse(formDataObj);
      const filteredSocialProfiles = socialProfiles.filter(
        (sp) => sp.account && sp.url,
      );

      updateProfileMutation.mutate({
        ...validatedData,
        ...(filteredSocialProfiles.length > 0 && {
          social_profiles: filteredSocialProfiles,
        }),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    }
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
          <form
            onSubmit={handleSubmit}
            className="flex p-6 flex-col md:flex-row space-x-3 justify-between"
          >
            <div className="gap-4 flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Profile Picture URL</Label>
                <Pecha.Input
                  type="text"
                  name="image_url"
                  id="image_url"
                  defaultValue={userInfo.image_url || ""}
                  placeholder="https://example.com/profile.jpg"
                />
                <p className="text-xs  text-gray-500">
                  Enter a URL to your profile picture
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name *</Label>
                <Pecha.Input
                  type="text"
                  name="firstname"
                  id="firstname"
                  defaultValue={userInfo.firstname}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name *</Label>
                <Pecha.Input
                  type="text"
                  name="lastname"
                  id="lastname"
                  defaultValue={userInfo.lastname}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Pecha.Textarea
                  name="bio"
                  id="bio"
                  defaultValue={userInfo.bio || ""}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-4 border border-dashed rounded-md p-4">
                <div className="flex justify-between items-center">
                  <Label>Social Links (Max 5)</Label>
                  <Pecha.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSocialProfile}
                    disabled={socialProfiles.length >= 5}
                  >
                    Add Social Link
                  </Pecha.Button>
                </div>
                <div className=" h-[300px] overflow-y-auto space-y-4">
                  {socialProfiles.map((social, index) => {
                    const usedPlatforms = socialProfiles
                      .filter((_, i) => i !== index)
                      .map((sp) => sp.account)
                      .filter(Boolean);

                    return (
                      <div
                        key={index}
                        className="flex gap-3 items-start p-4 border rounded-md"
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <Label htmlFor={`social-platform-${index}`}>
                                Platform
                              </Label>
                              <Pecha.Select
                                value={social.account}
                                onValueChange={(value) =>
                                  handleSocialProfileChange(
                                    index,
                                    "account",
                                    value,
                                  )
                                }
                              >
                                <Pecha.SelectTrigger
                                  id={`social-platform-${index}`}
                                >
                                  <Pecha.SelectValue placeholder="Select platform" />
                                </Pecha.SelectTrigger>
                                <Pecha.SelectContent>
                                  <Pecha.SelectGroup>
                                    {SOCIAL_PLATFORMS.map((platform) => {
                                      const isDisabled = usedPlatforms.includes(
                                        platform.value,
                                      );
                                      return (
                                        <Pecha.SelectItem
                                          key={platform.value}
                                          value={platform.value}
                                          disabled={isDisabled}
                                        >
                                          {platform.value}
                                        </Pecha.SelectItem>
                                      );
                                    })}
                                  </Pecha.SelectGroup>
                                </Pecha.SelectContent>
                              </Pecha.Select>
                            </div>
                            <Pecha.Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveSocialProfile(index)}
                            >
                              <IoMdClose className="w-4 h-4" />
                            </Pecha.Button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`social-url-${index}`}>URL</Label>
                            <Pecha.Input
                              type="url"
                              id={`social-url-${index}`}
                              value={social.url}
                              onChange={(e) =>
                                handleSocialProfileChange(
                                  index,
                                  "url",
                                  e.target.value,
                                )
                              }
                              placeholder="https://example.com/yourprofile"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex mt-4 justify-end gap-3">
                <Pecha.Button
                  type="submit"
                  className=" h-12 px-12 font-medium dark:text-white  bg-[#A51C21] hover:bg-[#A51C21]/90"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Pecha.Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;

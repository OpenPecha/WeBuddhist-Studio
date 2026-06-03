import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { useAuth } from "@/config/auth-context";

export const USER_INFO_QUERY_KEY = ["userInfo"] as const;

export type SocialMediaProfile = {
  account: string;
  url: string;
};

export type UserInfo = {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  is_admin?: boolean;
  image_url?: string | null;
  bio?: string | null;
  image?: { thumbnail?: string; medium?: string; original?: string } | null;
  social_profiles?: SocialMediaProfile[];
};

export const fetchUserInfo = async (): Promise<UserInfo> => {
  const { data } = await axiosInstance.get<UserInfo>(`/api/v1/authors/info`);
  return data;
};

/** Shared author profile query — all consumers dedupe to one request via `USER_INFO_QUERY_KEY`. */
export function useUserInfo(options?: { enabled?: boolean }) {
  const { isLoggedIn } = useAuth();

  return useQuery({
    queryKey: USER_INFO_QUERY_KEY,
    queryFn: fetchUserInfo,
    enabled: options?.enabled ?? isLoggedIn,
    refetchOnWindowFocus: true,
    staleTime: 1 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

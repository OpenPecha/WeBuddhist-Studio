import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { useAuth } from "@/config/auth-context";
import { normalizePlatformRole, type PlatformRole } from "@/lib/platformAccess";

export const USER_INFO_QUERY_KEY = ["userInfo"] as const;
export type { PlatformRole };

export type SocialMediaProfile = {
  account: string;
  url: string;
};

export type UserInfo = {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  platform_role?: PlatformRole;
  is_verified?: boolean;
  is_active?: boolean;
  has_group?: boolean;
  can_create_content?: boolean;
  image_url?: string | null;
  bio?: string | null;
  image?: { thumbnail?: string; medium?: string; original?: string } | null;
  social_profiles?: SocialMediaProfile[];
};

export const fetchUserInfo = async (): Promise<UserInfo> => {
  const { data } = await axiosInstance.get<UserInfo>(`/api/v1/authors/info`);
  const platform_role = normalizePlatformRole(data.platform_role);
  const has_group =
    data.has_group ??
    (platform_role === "SUPER_ADMIN" || platform_role === "REVIEWER");

  return {
    ...data,
    platform_role,
    is_verified: data.is_verified ?? true,
    is_active: data.is_active ?? true,
    has_group,
    can_create_content:
      data.can_create_content ??
      (platform_role === "SUPER_ADMIN" || has_group === true),
  };
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

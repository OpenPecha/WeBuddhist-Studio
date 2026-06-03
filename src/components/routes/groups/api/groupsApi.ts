import axiosInstance from "@/config/axios-config";
import type { LanguageCode } from "@/schema/SeriesSchema";

export type AuthorGroupMemberRole = "OWNER" | "ADMIN" | "AUTHOR" | "VIEWER";

export interface GroupMetadataDTO {
  id?: string;
  title: string;
  description?: string | null;
  language: LanguageCode;
}

export interface GroupMetadataInput {
  title: string;
  description?: string | null;
  language: LanguageCode;
}

export interface TagSummaryDTO {
  id: string;
  name: string;
  image?: string | null;
  image_key?: string | null;
  description?: string | null;
  featured?: boolean;
}

export interface GroupSocialLinkDTO {
  platform: string;
  url: string;
}

export interface AuthorGroupMemberDTO {
  author_id: string;
  role: AuthorGroupMemberRole;
  firstname: string;
  lastname: string;
  email: string;
}

export interface GroupLinkedSeriesDTO {
  id: string;
  metadata: GroupMetadataDTO[];
  image?: string | null;
  image_key?: string | null;
  author_id?: string;
  featured: boolean;
  status: string;
  plan_count?: number;
  total_days?: number;
}

export interface GroupLinkedPlanAuthorDTO {
  id: string;
  firstname: string;
  lastname: string;
  image_url?: string | null;
  image_key?: string | null;
}

export interface GroupLinkedPlanDTO {
  id: string;
  title: string;
  description?: string | null;
  language: LanguageCode;
  difficulty_level?: string;
  image_url?: string | null;
  image_key?: string | null;
  total_days?: number;
  tags: TagSummaryDTO[];
  status: string;
  featured?: boolean;
  subscription_count?: number;
  author?: GroupLinkedPlanAuthorDTO;
  start_date?: string | null;
  series_id?: string | null;
  display_order?: number | null;
  group_id?: string | null;
}

export interface AuthorGroupListItem {
  id: string;
  slug: string;
  is_public: boolean;
  metadata: GroupMetadataDTO[];
  tags: TagSummaryDTO[];
  follower_count: number;
  member_count?: number;
  avatar?: string | null;
  avatar_key?: string | null;
  avatar_url?: string | null;
}

export interface AuthorGroupDetailDTO extends AuthorGroupListItem {
  avatar_key?: string | null;
  banner?: string | null;
  banner_key?: string | null;
  banner_url?: string | null;
  members: AuthorGroupMemberDTO[];
  social_links: GroupSocialLinkDTO[];
  series: GroupLinkedSeriesDTO[];
  plans: GroupLinkedPlanDTO[];
}

export interface AuthorGroupListResponse {
  groups: AuthorGroupListItem[];
  skip: number;
  limit: number;
  total: number;
}

export interface CreateAuthorGroupRequest {
  slug: string;
  is_public?: boolean;
  avatar_key?: string | null;
  banner_key?: string | null;
  metadata: GroupMetadataInput[];
}

export interface UpdateAuthorGroupRequest {
  slug?: string;
  is_public?: boolean;
  avatar_key?: string | null;
  banner_key?: string | null;
  metadata?: GroupMetadataInput[];
}

export interface ReplaceGroupTagsRequest {
  tag_ids: string[];
}

export interface ReplaceGroupSocialLinksRequest {
  social_links: GroupSocialLinkDTO[];
}

export interface ReplaceGroupSeriesRequest {
  series_ids: string[];
}

export interface ReplaceGroupPlansRequest {
  plan_ids: string[];
}

export type AuthorGroupInviteStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REVOKED"
  | "EXPIRED";

export interface GroupInviteDTO {
  id: string;
  group_id: string;
  group_name: string;
  target_email: string;
  role: AuthorGroupMemberRole;
  status: AuthorGroupInviteStatus;
  expires_at: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
  created_by: string;
  inviter_name?: string;
  inviter_email?: string;
}

export function formatGroupInviteInviter(invite: GroupInviteDTO): {
  name: string;
  email: string;
} {
  const email = (invite.inviter_email ?? invite.created_by).trim();
  const rawName = (invite.inviter_name ?? "").trim();
  const name =
    rawName && rawName.toLowerCase() !== email.toLowerCase() ? rawName : email;
  return { name, email };
}

export interface GroupInviteListResponse {
  invites: GroupInviteDTO[];
  total: number;
}

export interface CreateGroupInviteRequest {
  target_email: string;
  role: AuthorGroupMemberRole;
}

export interface GroupInviteCreatedResponse {
  invite: GroupInviteDTO;
  notification_id?: string | null;
}

export interface UpdateGroupMemberRoleRequest {
  role: AuthorGroupMemberRole;
}

export interface FetchGroupsParams {
  page: number;
  limit: number;
  search?: string;
  language?: string;
  tag_id?: string;
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export const fetchGroups = async ({
  page,
  limit,
  search,
  language,
  tag_id,
}: FetchGroupsParams): Promise<AuthorGroupListResponse> => {
  const skip = (page - 1) * limit;
  const { data } = await axiosInstance.get<AuthorGroupListResponse>(
    `/api/v1/cms/author/groups`,
    {
      headers: getAuthHeaders(),
      params: {
        skip,
        limit,
        ...(search?.trim() && { search: search.trim() }),
        ...(language && { language }),
        ...(tag_id && { tag_id }),
      },
    },
  );
  return data;
};

export const fetchGroup = async (
  groupId: string,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.get<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}`,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const createGroup = async (
  payload: CreateAuthorGroupRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.post<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const patchGroup = async (
  groupId: string,
  payload: UpdateAuthorGroupRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.patch<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const replaceGroupTags = async (
  groupId: string,
  payload: ReplaceGroupTagsRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.put<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}/tags`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const replaceGroupSocialLinks = async (
  groupId: string,
  payload: ReplaceGroupSocialLinksRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.put<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}/social-links`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const replaceGroupSeries = async (
  groupId: string,
  payload: ReplaceGroupSeriesRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.put<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}/series`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const replaceGroupPlans = async (
  groupId: string,
  payload: ReplaceGroupPlansRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.put<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}/plans`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const createGroupInvite = async (
  groupId: string,
  payload: CreateGroupInviteRequest,
): Promise<GroupInviteCreatedResponse> => {
  const { data } = await axiosInstance.post<GroupInviteCreatedResponse>(
    `/api/v1/cms/author/groups/${groupId}/members/invites`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const fetchGroupInvites = async (
  groupId: string,
  status?: AuthorGroupInviteStatus,
): Promise<GroupInviteListResponse> => {
  const { data } = await axiosInstance.get<GroupInviteListResponse>(
    `/api/v1/cms/author/groups/${groupId}/members/invites`,
    {
      headers: getAuthHeaders(),
      params: status ? { status } : undefined,
    },
  );
  return data;
};

export const fetchMyPendingGroupInvites =
  async (): Promise<GroupInviteListResponse> => {
    const { data } = await axiosInstance.get<GroupInviteListResponse>(
      `/api/v1/cms/author/groups/invites/me`,
    );
    return data;
  };

export const acceptGroupInvite = async (
  inviteId: string,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.post<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/invites/${inviteId}/accept`,
  );
  return data;
};

export const rejectGroupInvite = async (
  inviteId: string,
): Promise<GroupInviteDTO> => {
  const { data } = await axiosInstance.post<GroupInviteDTO>(
    `/api/v1/cms/author/groups/invites/${inviteId}/reject`,
    {},
    { headers: getAuthHeaders() },
  );
  return data;
};

export const revokeGroupInvite = async (
  groupId: string,
  inviteId: string,
): Promise<void> => {
  await axiosInstance.post(
    `/api/v1/cms/author/groups/${groupId}/members/invites/${inviteId}/revoke`,
    {},
    { headers: getAuthHeaders() },
  );
};

export function isGroupInviteExpired(invite: GroupInviteDTO): boolean {
  if (invite.status === "EXPIRED") return true;
  return new Date(invite.expires_at).getTime() <= Date.now();
}

export const updateGroupMemberRole = async (
  groupId: string,
  authorId: string,
  payload: UpdateGroupMemberRoleRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.patch<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}/members/${authorId}/role`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export interface TransferGroupOwnershipRequest {
  new_owner_author_id: string;
}

export const transferGroupOwnership = async (
  groupId: string,
  payload: TransferGroupOwnershipRequest,
): Promise<AuthorGroupDetailDTO> => {
  const { data } = await axiosInstance.post<AuthorGroupDetailDTO>(
    `/api/v1/cms/author/groups/${groupId}/transfer-ownership`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const removeGroupMember = async (
  groupId: string,
  authorId: string,
): Promise<void> => {
  await axiosInstance.delete(
    `/api/v1/cms/author/groups/${groupId}/members/${authorId}`,
    { headers: getAuthHeaders() },
  );
};

export function pickGroupTitle(
  metadata: GroupMetadataDTO[] | undefined,
  fallback = "Untitled group",
): string {
  if (!metadata?.length) return fallback;
  const en = metadata.find((m) => m.language === "EN");
  if (en?.title?.trim()) return en.title.trim();
  const first = metadata.find((m) => m.title?.trim());
  return first?.title?.trim() || fallback;
}

export function resolveGroupBannerUrl(group: {
  banner?: string | null;
  banner_url?: string | null;
  banner_key?: string | null;
}): string | null {
  const url = group.banner_url?.trim() || group.banner?.trim();
  if (url) return url;
  const key = group.banner_key?.trim();
  if (key && /^https?:\/\//i.test(key)) return key;
  return null;
}

export function resolveGroupAvatarUrl(group: {
  avatar?: string | null;
  avatar_url?: string | null;
  avatar_key?: string | null;
}): string | null {
  const url = group.avatar_url?.trim() || group.avatar?.trim();
  if (url) return url;
  const key = group.avatar_key?.trim();
  if (key && /^https?:\/\//i.test(key)) return key;
  return null;
}

export function pickGroupLinkedSeriesTitle(
  series: GroupLinkedSeriesDTO,
  fallback = "Untitled series",
): string {
  return pickGroupTitle(series.metadata, fallback);
}

export function groupLinkedSeriesToFkOptions(
  series: GroupLinkedSeriesDTO[],
): { id: string; title: string; image_url?: string }[] {
  return series.map((item) => ({
    id: item.id,
    title: pickGroupLinkedSeriesTitle(item),
    image_url: item.image?.trim() || undefined,
  }));
}

export function pickGroupLinkedPlanTitle(
  plan: GroupLinkedPlanDTO,
  fallback = "Untitled plan",
): string {
  return plan.title?.trim() || fallback;
}

export function groupLinkedPlansToFkOptions(
  plans: GroupLinkedPlanDTO[],
): { id: string; title: string; image_url?: string }[] {
  return plans.map((item) => ({
    id: item.id,
    title: pickGroupLinkedPlanTitle(item),
    image_url: item.image_url?.trim() || undefined,
  }));
}

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  EN: "English",
  BO: "Tibetan",
  ZH: "Chinese",
};

export function languageLabelForCode(code: LanguageCode): string {
  return LANGUAGE_LABELS[code] ?? code;
}

export function buildGroupMetadata(
  languages: Partial<
    Record<LanguageCode, { title: string; description: string }>
  >,
): GroupMetadataInput[] {
  const order: LanguageCode[] = ["EN", "BO", "ZH"];
  const out: GroupMetadataInput[] = [];
  for (const code of order) {
    const block = languages[code];
    if (!block?.title?.trim()) continue;
    out.push({
      language: code,
      title: block.title.trim(),
      description: block.description?.trim() || null,
    });
  }
  return out;
}

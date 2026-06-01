import type {
  AuthorGroupMemberDTO,
  AuthorGroupMemberRole,
  GroupInviteDTO,
} from "../api/groupsApi";

export const ALL_MEMBER_ROLES: AuthorGroupMemberRole[] = [
  "OWNER",
  "ADMIN",
  "AUTHOR",
  "VIEWER",
];

const MEMBER_MANAGEMENT_ROLES: AuthorGroupMemberRole[] = ["OWNER", "ADMIN"];

export type GroupActor = {
  id?: string;
  email?: string;
  is_admin?: boolean;
};

/** Legacy DB rows may still surface as ADMIN after EDITOR migration. */
export function normalizeMemberRole(role: string): AuthorGroupMemberRole {
  if (role === "EDITOR") return "ADMIN";
  return role as AuthorGroupMemberRole;
}

function findMemberByEmail(
  members: AuthorGroupMemberDTO[],
  userEmail: string | undefined,
): AuthorGroupMemberDTO | undefined {
  if (!userEmail?.trim()) return undefined;
  const normalized = userEmail.trim().toLowerCase();
  return members.find((m) => m.email.trim().toLowerCase() === normalized);
}

export function getCurrentUserGroupRole(
  members: AuthorGroupMemberDTO[],
  userEmail: string | undefined,
): AuthorGroupMemberRole | undefined {
  const member = findMemberByEmail(members, userEmail);
  return member ? normalizeMemberRole(member.role) : undefined;
}

/** Platform admin is treated as OWNER for all group permission checks. */
export function getEffectiveGroupRole(
  members: AuthorGroupMemberDTO[],
  user: GroupActor | undefined,
): AuthorGroupMemberRole | undefined {
  if (user?.is_admin) return "OWNER";
  return getCurrentUserGroupRole(members, user?.email);
}

export function canEditGroupSettings(
  role: AuthorGroupMemberRole | undefined,
): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageGroupInvites(
  role: AuthorGroupMemberRole | undefined,
): boolean {
  return role ? MEMBER_MANAGEMENT_ROLES.includes(role) : false;
}

export function inviteRoleOptions(
  myRole: AuthorGroupMemberRole | undefined,
): AuthorGroupMemberRole[] {
  if (myRole === "OWNER") return [...ALL_MEMBER_ROLES];
  if (myRole === "ADMIN") return ["AUTHOR", "VIEWER"];
  return [];
}

export function roleChangeOptions(
  myRole: AuthorGroupMemberRole | undefined,
  target: AuthorGroupMemberDTO,
  user: GroupActor | undefined,
): AuthorGroupMemberRole[] | null {
  if (!myRole || !MEMBER_MANAGEMENT_ROLES.includes(myRole)) return null;

  const targetRole = normalizeMemberRole(target.role);
  const isSelf = isCurrentGroupMember(target, user);

  if (myRole === "OWNER") return [...ALL_MEMBER_ROLES];

  if (targetRole === "OWNER") return null;
  if (targetRole === "ADMIN" && !isSelf) return null;
  if (isSelf) return ["ADMIN", "AUTHOR", "VIEWER"];
  return ["AUTHOR", "VIEWER"];
}

export function canRevokeInvite(
  myRole: AuthorGroupMemberRole | undefined,
  invite: GroupInviteDTO,
): boolean {
  if (invite.status !== "PENDING") return false;
  if (myRole === "OWNER") return true;
  if (myRole === "ADMIN") {
    return normalizeMemberRole(invite.role) !== "ADMIN";
  }
  return false;
}

export function isCurrentGroupMember(
  member: AuthorGroupMemberDTO,
  user?: GroupActor,
): boolean {
  if (!user) return false;
  if (user.id && member.author_id === user.id) return true;
  if (!user.email?.trim()) return false;
  const normalized = user.email.trim().toLowerCase();
  return member.email.trim().toLowerCase() === normalized;
}

export function isSoleOwner(
  members: AuthorGroupMemberDTO[],
  member: AuthorGroupMemberDTO,
): boolean {
  if (normalizeMemberRole(member.role) !== "OWNER") return false;
  return (
    members.filter((m) => normalizeMemberRole(m.role) === "OWNER").length <= 1
  );
}

export function canRemoveMember(
  myRole: AuthorGroupMemberRole | undefined,
  target: AuthorGroupMemberDTO,
  user: GroupActor | undefined,
): boolean {
  if (isCurrentGroupMember(target, user)) return true;
  if (!myRole) return false;
  const targetRole = normalizeMemberRole(target.role);
  if (myRole === "OWNER") {
    if (targetRole === "OWNER") return false;
    return true;
  }
  if (myRole === "ADMIN") {
    return targetRole === "AUTHOR" || targetRole === "VIEWER";
  }
  return false;
}

/** Show Leave (self) or Remove (other) action button. */
export function canShowMemberRemovalAction(
  members: AuthorGroupMemberDTO[],
  myRole: AuthorGroupMemberRole | undefined,
  target: AuthorGroupMemberDTO,
  user: GroupActor | undefined,
): boolean {
  if (isCurrentGroupMember(target, user)) {
    return !isSoleOwner(members, target);
  }
  return canRemoveMember(myRole, target, user);
}

import { useState } from "react";
import {
  matchPath,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdTrash } from "react-icons/io";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { useUserInfo } from "@/hooks/useUserInfo";
import { ROUTES } from "@/routes/paths";
import { isReviewer } from "@/lib/platformAccess";
import { cn } from "@/lib/utils";
import {
  canDeleteGroup,
  canManageGroupInvites,
  getEffectiveGroupRole,
} from "./lib/groupPermissions";
import {
  deleteGroup,
  fetchGroup,
  pickGroupTitle,
  resolveGroupAvatarUrl,
  type AuthorGroupDetailDTO,
  type AuthorGroupMemberRole,
} from "./api/groupsApi";
import { GroupPageShell } from "./components/GroupPageShell";
import type { UserInfo } from "@/hooks/useUserInfo";

export type GroupOutletContext = {
  group: AuthorGroupDetailDTO;
  groupId: string;
  myRole: AuthorGroupMemberRole | undefined;
  userInfo: UserInfo | null | undefined;
  readOnlyPlatform: boolean;
  canManageTransfers: boolean;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "px-3 py-2 text-sm border-b-2 -mb-px transition-colors",
    isActive
      ? "border-[#A51C21] text-foreground font-medium"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );

const GroupLayout = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: userInfo } = useUserInfo();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const {
    data: group,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["cms-group", groupId],
    queryFn: () => fetchGroup(groupId!),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGroup(groupId!),
    onSuccess: () => {
      toast.success("Group deleted");
      setDeleteOpen(false);
      setConfirmName("");
      queryClient.invalidateQueries({ queryKey: ["cms-groups"] });
      navigate(ROUTES.groups);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (groupId && searchParams.get("tab") === "transfers") {
    return <Navigate to={ROUTES.groupTransfers(groupId)} replace />;
  }

  if (!groupId) return null;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-40px)] items-center justify-center text-muted-foreground">
        Loading group…
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="flex h-[calc(100vh-40px)] flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          {getApiErrorMessage(error, "Could not load this group")}
        </p>
        <Button variant="outline" onClick={() => navigate(ROUTES.groups)}>
          Back to groups
        </Button>
      </div>
    );
  }

  const groupTitle = pickGroupTitle(group.metadata);
  const avatarUrl = resolveGroupAvatarUrl(group);
  const myRole = getEffectiveGroupRole(group.members ?? [], userInfo);
  const canDelete = canDeleteGroup(myRole);
  const canManageTransfers =
    canManageGroupInvites(myRole) || myRole === "OWNER";
  const readOnlyPlatform = isReviewer(userInfo?.platform_role);
  const showTransfersNav = !readOnlyPlatform;
  const showDelete = !readOnlyPlatform && canDelete;
  const nameMatches =
    confirmName.trim().toLowerCase() === groupTitle.trim().toLowerCase();
  const isAboutSection =
    Boolean(
      matchPath({ path: "/groups/:groupId", end: true }, location.pathname),
    ) ||
    Boolean(
      matchPath(
        { path: "/groups/:groupId/edit", end: true },
        location.pathname,
      ),
    );
  const isEditRoute = Boolean(
    matchPath({ path: "/groups/:groupId/edit", end: true }, location.pathname),
  );
  const contentMaxWidth = isEditRoute ? "max-w-6xl" : "max-w-4xl";

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteOpen(open);
    if (!open) setConfirmName("");
  };

  const outletContext: GroupOutletContext = {
    group,
    groupId: group.id,
    myRole,
    userInfo,
    readOnlyPlatform,
    canManageTransfers,
  };

  return (
    <>
      <GroupPageShell
        backLabel="← Groups"
        onBack={() => navigate(ROUTES.groups)}
        title={groupTitle}
        avatarUrl={avatarUrl}
        subtitle={
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            /{group.slug}
          </p>
        }
        headerActions={
          showDelete ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <IoMdTrash className="w-4 h-4" /> Delete
            </Button>
          ) : undefined
        }
        nav={
          <nav className="flex flex-wrap gap-1 px-4 sm:px-8 border-b border-dashed border-gray-300 dark:border-input">
            <NavLink
              to={ROUTES.group(group.id)}
              end
              className={() => navLinkClass({ isActive: isAboutSection })}
            >
              About
            </NavLink>
            <NavLink
              to={ROUTES.groupContent(group.id)}
              className={navLinkClass}
            >
              Content
            </NavLink>
            {showTransfersNav ? (
              <NavLink
                to={ROUTES.groupTransfers(group.id)}
                className={navLinkClass}
              >
                Transfers
              </NavLink>
            ) : null}
            <NavLink
              to={ROUTES.groupMembers(group.id)}
              className={navLinkClass}
            >
              Members
            </NavLink>
          </nav>
        }
      >
        <div className="px-4 sm:px-8 py-6 pb-12">
          <div className={cn("mx-auto w-full", contentMaxWidth)}>
            <Outlet context={outletContext} />
          </div>
        </div>
      </GroupPageShell>

      <Pecha.AlertDialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete group?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              This will permanently remove &ldquo;{groupTitle}&rdquo;. This
              action cannot be undone. Type the group name to confirm.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <div className="space-y-2 py-2">
            <label
              htmlFor="delete-group-confirm-name"
              className="text-sm font-medium"
            >
              Group name
            </label>
            <Pecha.Input
              id="delete-group-confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={groupTitle}
              autoComplete="off"
              disabled={deleteMutation.isPending}
            />
          </div>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending || !nameMatches}
              onClick={(e) => {
                e.preventDefault();
                if (!nameMatches) return;
                deleteMutation.mutate();
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </>
  );
};

export default GroupLayout;

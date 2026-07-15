import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoClose, IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/atoms/tooltip";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { ROUTES } from "@/routes/paths";
import {
  acceptGroupInvite,
  rejectGroupInvite,
} from "@/components/routes/groups/api/groupsApi";
import {
  acceptTransferRequest,
  rejectTransferRequest,
} from "@/components/routes/content-transfer/api/transferApi";
import {
  fetchNotifications,
  getTransferNotificationTargetGroupId,
  isContentTransferNotification,
  isGroupInviteNotification,
  markNotificationRead,
  type NotificationDTO,
} from "@/components/routes/notifications/api/notificationsApi";

const NotificationBell = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-notifications", { unread_only: true }],
    queryFn: () => fetchNotifications({ unread_only: true, limit: 30 }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const unreadCount = data?.total ?? 0;

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["cms-my-group-invites"] });
    queryClient.invalidateQueries({ queryKey: ["cms-groups"] });
  };

  const dismissMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onSuccess: () => invalidateNotifications(),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const inviteActionMutation = useMutation({
    mutationFn: async ({
      inviteId,
      action,
    }: {
      inviteId: string;
      action: "accept" | "reject";
    }) => {
      if (action === "accept") {
        return acceptGroupInvite(inviteId);
      }
      await rejectGroupInvite(inviteId);
      return null;
    },
    onSuccess: (group, { action }) => {
      if (action === "accept") {
        toast.success("Invitation accepted");
        setOpen(false);
        if (group) {
          navigate(ROUTES.group(group.id));
        }
      } else {
        toast.success("Invitation declined");
      }
      invalidateNotifications();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleInviteAction = (
    notification: NotificationDTO,
    action: "accept" | "reject",
  ) => {
    const inviteId = notification.reference_id;
    if (!inviteId) {
      toast.error("Invalid invitation notification");
      return;
    }
    inviteActionMutation.mutate({ inviteId, action });
  };

  const transferActionMutation = useMutation({
    mutationFn: async ({
      requestId,
      action,
    }: {
      requestId: string;
      action: "accept" | "reject";
    }) => {
      if (action === "accept") {
        return acceptTransferRequest(requestId);
      }
      await rejectTransferRequest(requestId);
      return null;
    },
    onSuccess: (_data, { action }) => {
      toast.success(
        action === "accept" ? "Transfer accepted" : "Transfer rejected",
      );
      invalidateNotifications();
      queryClient.invalidateQueries({ queryKey: ["transfer-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleTransferAction = (
    notification: NotificationDTO,
    action: "accept" | "reject",
  ) => {
    const requestId = notification.reference_id;
    if (!requestId) {
      toast.error("Invalid transfer notification");
      return;
    }
    transferActionMutation.mutate({ requestId, action });
  };

  const invitePending =
    inviteActionMutation.isPending || transferActionMutation.isPending;

  const handleMenuOpenChange = (next: boolean) => {
    setOpen(next);
    setTooltipOpen(false);
  };

  return (
    <Pecha.DropdownMenu open={open} onOpenChange={handleMenuOpenChange}>
      <Tooltip open={open ? false : tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <Pecha.DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative border p-2 rounded-md text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <IoNotificationsOutline className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A51C21] px-1 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Pecha.DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Notifications</TooltipContent>
      </Tooltip>

      <Pecha.DropdownMenuContent
        side="right"
        align="start"
        className="w-80 max-h-[min(24rem,70vh)] overflow-auto p-0"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-b px-3 py-2 font-medium text-sm">
          Notifications
        </div>
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">Loading…</p>
        ) : !data?.notifications.length ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No unread notifications
          </p>
        ) : (
          <ul className="divide-y">
            {data.notifications.map((notification) => (
              <li key={notification.id} className="relative px-3 py-3 pr-9">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss notification"
                  disabled={invitePending || dismissMutation.isPending}
                  onClick={() => dismissMutation.mutate(notification.id)}
                >
                  <IoClose className="h-4 w-4" />
                </Button>
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-snug pr-1">
                    {notification.title}
                  </p>
                  {notification.description && (
                    <p className="text-xs text-muted-foreground">
                      {notification.description}
                    </p>
                  )}
                  {isGroupInviteNotification(notification) && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90 h-7 text-xs"
                        disabled={invitePending}
                        onClick={() =>
                          handleInviteAction(notification, "accept")
                        }
                      >
                        {inviteActionMutation.isPending &&
                        inviteActionMutation.variables?.action === "accept"
                          ? "Accepting…"
                          : "Accept"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={invitePending}
                        onClick={() =>
                          handleInviteAction(notification, "reject")
                        }
                      >
                        {inviteActionMutation.isPending &&
                        inviteActionMutation.variables?.action === "reject"
                          ? "Declining…"
                          : "Reject"}
                      </Button>
                    </div>
                  )}
                  {isContentTransferNotification(notification) && (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90 h-7 text-xs"
                          disabled={invitePending}
                          onClick={() =>
                            handleTransferAction(notification, "accept")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={invitePending}
                          onClick={() =>
                            handleTransferAction(notification, "reject")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                      {getTransferNotificationTargetGroupId(notification) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="link"
                          className="h-auto p-0 text-xs text-[#A51C21]"
                          onClick={() => {
                            setOpen(false);
                            navigate(
                              ROUTES.groupTransfers(
                                getTransferNotificationTargetGroupId(
                                  notification,
                                )!,
                              ),
                            );
                          }}
                        >
                          View on group page
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Pecha.DropdownMenuContent>
    </Pecha.DropdownMenu>
  );
};

export default NotificationBell;

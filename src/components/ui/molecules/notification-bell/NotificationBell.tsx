import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoNotificationsOutline } from "react-icons/io5";
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
  executeNotificationAction,
  fetchNotifications,
  markNotificationRead,
  type NotificationDTO,
} from "@/components/routes/notifications/api/notificationsApi";

const NotificationBell = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-notifications", { unread_only: true }],
    queryFn: () => fetchNotifications({ unread_only: true, limit: 30 }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const unreadCount = data?.notifications.length ?? 0;

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

  const handleGroupInviteAction = async (
    notification: NotificationDTO,
    actionLabel: string,
  ) => {
    const inviteId = notification.reference_id;
    if (!inviteId) {
      toast.error("Invalid invitation notification");
      return;
    }
    try {
      if (actionLabel.toLowerCase() === "accept") {
        const group = await acceptGroupInvite(inviteId);
        toast.success("Invitation accepted");
        invalidateNotifications();
        setOpen(false);
        navigate(ROUTES.group(group.id));
        return;
      }
      if (actionLabel.toLowerCase() === "reject") {
        await rejectGroupInvite(inviteId);
        toast.success("Invitation declined");
        invalidateNotifications();
        return;
      }
      const action = notification.actions.find(
        (a) => a.label.toLowerCase() === actionLabel.toLowerCase(),
      );
      if (action) {
        await executeNotificationAction(action);
        toast.success("Done");
        invalidateNotifications();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleGenericAction = async (notification: NotificationDTO) => {
    const action = notification.actions[0];
    if (!action) return;
    try {
      await executeNotificationAction(action);
      toast.success("Done");
      invalidateNotifications();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Pecha.DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
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
              <li key={notification.id} className="px-3 py-3 space-y-2">
                <p className="text-sm font-medium leading-snug">
                  {notification.title}
                </p>
                {notification.description && (
                  <p className="text-xs text-muted-foreground">
                    {notification.description}
                  </p>
                )}
                {notification.category === "group_invite" &&
                notification.reference_id ? (
                  <div className="flex flex-wrap gap-2">
                    {notification.actions.map((action) => (
                      <Button
                        key={action.label}
                        type="button"
                        size="sm"
                        variant={
                          action.label.toLowerCase() === "accept"
                            ? "default"
                            : "outline"
                        }
                        className={
                          action.label.toLowerCase() === "accept"
                            ? "bg-[#A51C21] text-white hover:bg-[#A51C21]/90 h-7 text-xs"
                            : "h-7 text-xs"
                        }
                        onClick={() =>
                          handleGroupInviteAction(notification, action.label)
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => dismissMutation.mutate(notification.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ) : notification.actions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleGenericAction(notification)}
                    >
                      {notification.actions[0].label}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => dismissMutation.mutate(notification.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => dismissMutation.mutate(notification.id)}
                  >
                    Dismiss
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Pecha.DropdownMenuContent>
    </Pecha.DropdownMenu>
  );
};

export default NotificationBell;

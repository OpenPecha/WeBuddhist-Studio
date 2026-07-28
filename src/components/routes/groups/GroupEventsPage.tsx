import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { fromBackendISO } from "@/lib/utils";
import { ROUTES } from "@/routes/paths";
import { FeaturedStar } from "@/components/routes/dashboard/dashboardTableUi";
import type { GroupOutletContext } from "./GroupLayout";
import { canWriteEvents } from "./lib/eventPermissions";
import {
  deleteCmsEvent,
  eventName,
  fetchCmsEvents,
  toggleEventFeatured,
  type EventDTO,
} from "./api/eventsApi";

const PAGE_SIZE = 20;

const formatEventDate = (iso: string): string => {
  if (!iso) return "—";
  try {
    return format(fromBackendISO(iso), "MMM d, yyyy");
  } catch {
    return iso.slice(0, 10);
  }
};

const formatEventRange = (event: EventDTO): string => {
  const start = formatEventDate(event.start_date);
  if (event.is_one_day || event.start_date === event.end_date) return start;
  return `${start} – ${formatEventDate(event.end_date)}`;
};

const eventThumbnail = (event: EventDTO): string | null => {
  if (event.image?.thumbnail) return event.image.thumbnail;
  if (event.image?.medium) return event.image.medium;
  if (event.image_url && /^https?:\/\//i.test(event.image_url)) {
    return event.image_url;
  }
  return null;
};

const GroupEventsPage = () => {
  const { groupId, myRole, userInfo, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<EventDTO | null>(null);

  const canWrite =
    !readOnlyPlatform && canWriteEvents(myRole, userInfo?.platform_role);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cms-events", groupId, page],
    queryFn: () =>
      fetchCmsEvents({
        group_id: groupId,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  const events = useMemo(() => data?.events ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCmsEvent(id),
    onSuccess: () => {
      toast.success("Event deleted");
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["cms-events", groupId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const featuredMutation = useMutation({
    mutationFn: (id: string) => toggleEventFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-events", groupId] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Could not update featured")),
  });

  const columnCount = canWrite ? 3 : 2;

  const body = useMemo(() => {
    if (isLoading) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell colSpan={columnCount}>Loading…</Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    if (isError) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell colSpan={columnCount} className="text-destructive">
            {getApiErrorMessage(error, "Could not load events.")}
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    if (events.length === 0) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={columnCount}
            className="text-muted-foreground"
          >
            No events yet.
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    return events.map((event) => {
      const thumbnail = eventThumbnail(event);
      return (
        <Pecha.TableRow key={event.id}>
          <Pecha.TableCell className="font-medium">
            <Link
              to={ROUTES.groupEvent(groupId, event.id)}
              className="flex items-center gap-3 hover:underline"
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded bg-muted" />
              )}
              <span className="min-w-0 truncate">{eventName(event)}</span>
            </Link>
          </Pecha.TableCell>
          <Pecha.TableCell>{formatEventRange(event)}</Pecha.TableCell>
          {canWrite ? (
            <Pecha.TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Pecha.Button
                  variant="outline"
                  size="sm"
                  disabled={featuredMutation.isPending}
                  aria-label={event.featured ? "Featured" : "Not featured"}
                  onClick={() => featuredMutation.mutate(event.id)}
                >
                  <FeaturedStar featured={event.featured} />
                </Pecha.Button>
                <Pecha.Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(ROUTES.groupEventEdit(groupId, event.id))
                  }
                >
                  Edit
                </Pecha.Button>
                <Pecha.Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(event)}
                  aria-label={`Delete ${eventName(event)}`}
                >
                  <IoMdTrash className="h-4 w-4" />
                </Pecha.Button>
              </div>
            </Pecha.TableCell>
          ) : null}
        </Pecha.TableRow>
      );
    });
  }, [
    isLoading,
    isError,
    error,
    events,
    columnCount,
    canWrite,
    groupId,
    navigate,
    featuredMutation,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Events</h2>
        {canWrite ? (
          <Pecha.Button
            className="gap-1 bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
            onClick={() => navigate(ROUTES.groupEventNew(groupId))}
          >
            <IoMdAdd className="h-4 w-4" /> New event
          </Pecha.Button>
        ) : null}
      </div>

      <div className="rounded-lg border">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Name</Pecha.TableHead>
              <Pecha.TableHead>Dates</Pecha.TableHead>
              {canWrite ? (
                <Pecha.TableHead className="text-right">
                  Actions
                </Pecha.TableHead>
              ) : null}
            </Pecha.TableRow>
          </Pecha.TableHeader>
          <Pecha.TableBody>{body}</Pecha.TableBody>
        </Pecha.Table>

        {totalPages > 1 ? (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <Pecha.AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete event?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              This will permanently remove &ldquo;
              {pendingDelete ? eventName(pendingDelete) : ""}&rdquo;. This
              action cannot be undone.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default GroupEventsPage;

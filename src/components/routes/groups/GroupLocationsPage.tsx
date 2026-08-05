import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import { getApiErrorMessage } from "@/lib/apiErrors";
import type { GroupOutletContext } from "./GroupLayout";
import { canWriteEvents } from "./lib/eventPermissions";
import LocationFormDialog from "./components/locations/LocationFormDialog";
import {
  buildUpdateLocationBody,
  createLocation,
  deleteLocation,
  fetchLocations,
  formatCoordinates,
  getLocationInUseError,
  updateLocation,
  type LocationDetail,
} from "./api/locationsApi";
import {
  parseCoordinates,
  type LocationFormData,
} from "@/schema/LocationSchema";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;

const GroupLocationsPage = () => {
  const { groupId, myRole, userInfo, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<LocationDetail | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<LocationDetail | null>(
    null,
  );
  const [inUseMessage, setInUseMessage] = useState<string | null>(null);

  const canWrite =
    !readOnlyPlatform && canWriteEvents(myRole, userInfo?.platform_role);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cms-locations", groupId, page, search],
    queryFn: () =>
      fetchLocations(groupId, {
        search: search || undefined,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  const locations = useMemo(() => data?.locations ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-locations", groupId] });
    queryClient.invalidateQueries({ queryKey: ["group-locations", groupId] });
  };

  const saveMutation = useMutation({
    mutationFn: (form: LocationFormData) => {
      const coords = parseCoordinates(form);
      if (editing) {
        const body = buildUpdateLocationBody(
          { name: form.name, ...coords },
          editing,
        );
        return updateLocation(groupId, editing.id, body);
      }
      return createLocation(groupId, {
        name: form.name.trim(),
        ...(coords.latitude != null && coords.longitude != null
          ? { latitude: coords.latitude, longitude: coords.longitude }
          : {}),
      });
    },
    onSuccess: () => {
      toast.success(editing ? "Location updated" : "Location created");
      setFormOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLocation(groupId, id),
    onSuccess: () => {
      toast.success("Location deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (err) => {
      const inUse = getLocationInUseError(err);
      if (inUse) {
        setInUseMessage(
          `This location is used by ${inUse.event_count} event${
            inUse.event_count === 1 ? "" : "s"
          }. Remove it from ${
            inUse.event_count === 1 ? "that event" : "those events"
          } before deleting it.`,
        );
        return;
      }
      toast.error(getApiErrorMessage(err));
      setPendingDelete(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (location: LocationDetail) => {
    setEditing(location);
    setFormOpen(true);
  };

  const columnCount = canWrite ? 4 : 3;

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
            {getApiErrorMessage(error, "Could not load locations.")}
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    if (locations.length === 0) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={columnCount}
            className="text-muted-foreground"
          >
            {search ? "No locations match your search." : "No locations yet."}
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    return locations.map((location) => (
      <Pecha.TableRow key={location.id}>
        <Pecha.TableCell className="font-medium">
          {location.name}
        </Pecha.TableCell>
        <Pecha.TableCell className="text-muted-foreground">
          {formatCoordinates(location) ?? "—"}
        </Pecha.TableCell>
        <Pecha.TableCell>
          {location.event_count} event{location.event_count === 1 ? "" : "s"}
        </Pecha.TableCell>
        {canWrite ? (
          <Pecha.TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Pecha.Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(location)}
              >
                Edit
              </Pecha.Button>
              <Pecha.Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setInUseMessage(null);
                  setPendingDelete(location);
                }}
                aria-label={`Delete ${location.name}`}
              >
                <IoMdTrash className="h-4 w-4" />
              </Pecha.Button>
            </div>
          </Pecha.TableCell>
        ) : null}
      </Pecha.TableRow>
    ));
  }, [isLoading, isError, error, locations, columnCount, canWrite, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Locations</h2>
        {canWrite ? (
          <Pecha.Button
            className="gap-1 bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
            onClick={openCreate}
          >
            <IoMdAdd className="h-4 w-4" /> New location
          </Pecha.Button>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        Locations are shared across this group&rsquo;s events. Save a place once
        and reuse it.
      </p>

      <div className="relative max-w-sm">
        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search locations…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-white pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none dark:bg-[#262626] dark:text-white"
        />
      </div>

      <div className="rounded-lg border">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Name</Pecha.TableHead>
              <Pecha.TableHead>Coordinates</Pecha.TableHead>
              <Pecha.TableHead>Used by</Pecha.TableHead>
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

      <LocationFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        location={editing}
        isSubmitting={saveMutation.isPending}
        onSubmit={(form) => saveMutation.mutate(form)}
      />

      <Pecha.AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setInUseMessage(null);
          }
        }}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete location?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              {inUseMessage ??
                `This will permanently remove “${pendingDelete?.name ?? ""}”. This action cannot be undone.`}
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={deleteMutation.isPending}>
              {inUseMessage ? "Close" : "Cancel"}
            </Pecha.AlertDialogCancel>
            {!inUseMessage ? (
              <Pecha.AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                }}
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Pecha.AlertDialogAction>
            ) : null}
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default GroupLocationsPage;

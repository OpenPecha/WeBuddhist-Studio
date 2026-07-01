import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { IoMdAdd } from "react-icons/io";
import { IoCalendarClearOutline } from "react-icons/io5";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";
import { uploadImageToS3 } from "@/components/routes/task/api/taskApi";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { canChangeContentStatus } from "@/lib/contentPermissions";
import { isReviewer } from "@/lib/platformAccess";
import { fromBackendISO, toBackendISO } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import type { AuthorGroupMemberRole } from "../api/groupsApi";
import { searchAccumulatorPresets } from "../api/accumulatorPresetSearchApi";
import {
  createGroupAccumulator,
  deleteGroupAccumulator,
  fetchGroupAccumulators,
  resolveGroupAccumulatorImageUrl,
  updateGroupAccumulator,
  type GroupAccumulatorDTO,
} from "../api/groupAccumulatorsApi";
import GroupImageField from "./GroupImageField";
import { GroupSectionHeader } from "./GroupSection";
import type { FkOption } from "./FkMultiSearchSelector";

type GroupAccumulatorsPanelProps = {
  groupId: string;
  groupRole?: AuthorGroupMemberRole;
};

type AccumulatorFormState = {
  title: string;
  target_count: string;
  start_date: string | null;
  end_date: string | null;
  image_key: string | null;
  image_preview: string | null;
  preset: FkOption | null;
};

const emptyFormState = (): AccumulatorFormState => ({
  title: "",
  target_count: "",
  start_date: null,
  end_date: null,
  image_key: null,
  image_preview: null,
  preset: null,
});

function formStateFromAccumulator(
  accumulator: GroupAccumulatorDTO,
): AccumulatorFormState {
  return {
    title: accumulator.title ?? "",
    target_count:
      accumulator.target_count != null ? String(accumulator.target_count) : "",
    start_date: accumulator.start_date,
    end_date: accumulator.end_date,
    image_key: accumulator.image_key,
    image_preview: resolveGroupAccumulatorImageUrl(accumulator),
    preset: accumulator.preset_accumulator_id
      ? { id: accumulator.preset_accumulator_id, title: "Linked preset" }
      : null,
  };
}

function formatAccumulatorDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(fromBackendISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

const GroupAccumulatorsPanel = ({
  groupId,
  groupRole,
}: GroupAccumulatorsPanelProps) => {
  const queryClient = useQueryClient();
  const { data: userInfo } = useUserInfo();
  const platformReadOnly = isReviewer(userInfo?.platform_role);
  const canCreate =
    !platformReadOnly && groupRole != null && groupRole !== "VIEWER";
  const canManage = !platformReadOnly && canChangeContentStatus(
    groupRole,
    userInfo?.platform_role,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GroupAccumulatorDTO | null>(null);
  const [form, setForm] = useState<AccumulatorFormState>(emptyFormState);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupAccumulatorDTO | null>(
    null,
  );
  const [presetSearchOpen, setPresetSearchOpen] = useState(false);
  const [presetQuery, setPresetQuery] = useState("");
  const [presetResults, setPresetResults] = useState<FkOption[]>([]);
  const [presetLoading, setPresetLoading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cms-group-accumulators", groupId],
    queryFn: () => fetchGroupAccumulators(groupId),
    refetchOnWindowFocus: false,
  });

  const accumulators = data?.accumulators ?? [];

  useEffect(() => {
    if (!dialogOpen || !form.preset || form.preset.title !== "Linked preset") {
      return;
    }
    let cancelled = false;
    searchAccumulatorPresets({ limit: 100 }).then((result) => {
      if (cancelled) return;
      const match = result.items.find((preset) => preset.id === form.preset?.id);
      if (match) {
        setForm((prev) => ({ ...prev, preset: match }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dialogOpen, form.preset]);

  useEffect(() => {
    if (!presetSearchOpen) return;
    const timer = setTimeout(async () => {
      setPresetLoading(true);
      try {
        const result = await searchAccumulatorPresets({
          search: presetQuery,
          limit: 20,
        });
        setPresetResults(result.items);
      } catch {
        setPresetResults([]);
      } finally {
        setPresetLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [presetSearchOpen, presetQuery]);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["cms-group-accumulators", groupId],
    });
  };

  const toastOnError = (err: unknown) => toast.error(getApiErrorMessage(err));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyFormState());
    setDialogOpen(true);
  };

  const openEdit = (accumulator: GroupAccumulatorDTO) => {
    setEditing(accumulator);
    setForm(formStateFromAccumulator(accumulator));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyFormState());
    setPresetQuery("");
    setPresetResults([]);
  };

  const buildPayload = () => {
    const targetRaw = form.target_count.trim();
    const target_count =
      targetRaw === "" ? null : Math.max(1, Number.parseInt(targetRaw, 10));

    return {
      accumulator_id: form.preset?.id ?? null,
      title: form.title.trim() || null,
      image_key: form.image_key,
      target_count: Number.isFinite(target_count) ? target_count : null,
      start_date: form.start_date,
      end_date: form.end_date,
    };
  };

  const createMutation = useMutation({
    mutationFn: () => createGroupAccumulator(groupId, buildPayload()),
    onSuccess: () => {
      toast.success("Accumulator created");
      invalidate();
      closeDialog();
    },
    onError: toastOnError,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateGroupAccumulator(groupId, editing!.id, buildPayload()),
    onSuccess: () => {
      toast.success("Accumulator updated");
      invalidate();
      closeDialog();
    },
    onError: toastOnError,
  });

  const deleteMutation = useMutation({
    mutationFn: (accumulatorId: string) =>
      deleteGroupAccumulator(groupId, accumulatorId),
    onSuccess: () => {
      toast.success("Accumulator deleted");
      setDeleteTarget(null);
      invalidate();
    },
    onError: toastOnError,
  });

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const { image, key } = await uploadImageToS3(file, groupId);
      setForm((prev) => ({
        ...prev,
        image_key: key,
        image_preview: image.original,
      }));
      setImageDialogOpen(false);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editing) {
      updateMutation.mutate();
      return;
    }
    createMutation.mutate();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const dialogTitle = editing ? "Edit accumulator" : "Create accumulator";

  const presetTriggerLabel = useMemo(() => {
    if (form.preset) return form.preset.title;
    return "None (optional)";
  }, [form.preset]);

  return (
    <div className="space-y-4">
      <GroupSectionHeader
        title="Accumulators"
        action={
          canCreate ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCreate}
            >
              <IoMdAdd className="h-4 w-4" /> Add accumulator
            </Button>
          ) : undefined
        }
      />

      {isError ? (
        <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading accumulators…</p>
      ) : accumulators.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No group accumulators yet.
          {canCreate ? " Use the button above to create one." : null}
        </p>
      ) : (
        <div className="space-y-3">
          {accumulators.map((accumulator) => {
            const imageUrl = resolveGroupAccumulatorImageUrl(accumulator);
            return (
              <div
                key={accumulator.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border bg-white dark:bg-[#1e1e1e] p-4"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-16 h-16 rounded object-cover border shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded border bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium truncate">
                    {accumulator.title?.trim() || "Untitled accumulator"}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      Target:{" "}
                      {accumulator.target_count != null
                        ? accumulator.target_count.toLocaleString()
                        : "—"}
                    </span>
                    <span>Start: {formatAccumulatorDate(accumulator.start_date)}</span>
                    <span>End: {formatAccumulatorDate(accumulator.end_date)}</span>
                    <span>
                      Joined:{" "}
                      {accumulator.member_count != null
                        ? accumulator.member_count.toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
                {canManage ? (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(accumulator)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(accumulator)}
                    >
                      Delete
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Pecha.Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <Pecha.DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>{dialogTitle}</Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold" htmlFor="accumulator-title">
                Title
              </label>
              <Pecha.Input
                id="accumulator-title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. 100 Million Mani Retreat"
                className="h-12 bg-white dark:bg-[#262626]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold" htmlFor="accumulator-target">
                Target count
              </label>
              <Pecha.Input
                id="accumulator-target"
                type="number"
                min={1}
                value={form.target_count}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, target_count: e.target.value }))
                }
                placeholder="e.g. 100000000"
                className="h-12 bg-white dark:bg-[#262626]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-bold">Start date</p>
                <Pecha.Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <Pecha.PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full justify-start gap-2 px-3 font-normal"
                    >
                      <IoCalendarClearOutline className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          form.start_date
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {form.start_date
                          ? formatAccumulatorDate(form.start_date)
                          : "Choose date"}
                      </span>
                    </Button>
                  </Pecha.PopoverTrigger>
                  <Pecha.PopoverContent className="w-auto p-0" align="start">
                    <Pecha.Calendar
                      mode="single"
                      selected={
                        form.start_date
                          ? fromBackendISO(form.start_date)
                          : undefined
                      }
                      onSelect={(d) => {
                        setStartDateOpen(false);
                        setForm((prev) => ({
                          ...prev,
                          start_date: d ? toBackendISO(d) : null,
                        }));
                      }}
                    />
                  </Pecha.PopoverContent>
                </Pecha.Popover>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">End date</p>
                <Pecha.Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <Pecha.PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full justify-start gap-2 px-3 font-normal"
                    >
                      <IoCalendarClearOutline className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          form.end_date
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {form.end_date
                          ? formatAccumulatorDate(form.end_date)
                          : "Choose date"}
                      </span>
                    </Button>
                  </Pecha.PopoverTrigger>
                  <Pecha.PopoverContent className="w-auto p-0" align="start">
                    <Pecha.Calendar
                      mode="single"
                      selected={
                        form.end_date ? fromBackendISO(form.end_date) : undefined
                      }
                      onSelect={(d) => {
                        setEndDateOpen(false);
                        setForm((prev) => ({
                          ...prev,
                          end_date: d ? toBackendISO(d) : null,
                        }));
                      }}
                    />
                  </Pecha.PopoverContent>
                </Pecha.Popover>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold">Linked preset</p>
              <Pecha.Popover
                open={presetSearchOpen}
                onOpenChange={(open) => {
                  setPresetSearchOpen(open);
                  if (!open) setPresetQuery("");
                }}
              >
                <Pecha.PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full justify-between font-normal"
                  >
                    <span
                      className={
                        form.preset ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {presetTriggerLabel}
                    </span>
                  </Button>
                </Pecha.PopoverTrigger>
                <Pecha.PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Pecha.Command shouldFilter={false}>
                    <Pecha.CommandInput
                      placeholder="Search presets…"
                      value={presetQuery}
                      onValueChange={setPresetQuery}
                    />
                    <Pecha.CommandList>
                      <Pecha.CommandGroup>
                        <Pecha.CommandItem
                          value="__none__"
                          onSelect={() => {
                            setForm((prev) => ({ ...prev, preset: null }));
                            setPresetSearchOpen(false);
                          }}
                        >
                          None
                        </Pecha.CommandItem>
                        {presetLoading ? (
                          <Pecha.CommandItem disabled value="__loading__">
                            Searching…
                          </Pecha.CommandItem>
                        ) : (
                          presetResults.map((preset) => (
                            <Pecha.CommandItem
                              key={preset.id}
                              value={preset.id}
                              onSelect={() => {
                                setForm((prev) => ({ ...prev, preset }));
                                setPresetSearchOpen(false);
                              }}
                            >
                              {preset.title}
                            </Pecha.CommandItem>
                          ))
                        )}
                      </Pecha.CommandGroup>
                    </Pecha.CommandList>
                  </Pecha.Command>
                </Pecha.PopoverContent>
              </Pecha.Popover>
              <p className="text-xs text-muted-foreground">
                Optional link to a public mantra preset users count with.
              </p>
            </div>

            <GroupImageField
              label="Cover image"
              displayUrl={form.image_preview}
              hasStoredImage={Boolean(form.image_key)}
              onUploadClick={() => setImageDialogOpen(true)}
              imageClassName="w-full max-w-xs h-32 rounded object-cover border"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </Pecha.DialogContent>
      </Pecha.Dialog>

      <Pecha.Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <Pecha.DialogContent>
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>Upload cover image</Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <ImageContentData
            onUpload={handleImageUpload}
            isLoading={imageUploading}
          />
        </Pecha.DialogContent>
      </Pecha.Dialog>

      <Pecha.AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete accumulator?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              This will remove &ldquo;
              {deleteTarget?.title?.trim() || "Untitled accumulator"}&rdquo; from
              the group. This action cannot be undone.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel>Cancel</Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
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

export default GroupAccumulatorsPanel;

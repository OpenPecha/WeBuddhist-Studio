import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { ROUTES } from "@/routes/paths";
import type { GroupOutletContext } from "./GroupLayout";
import { canWriteEvents } from "./lib/eventPermissions";
import {
  createChantCollection,
  fetchChantCollection,
  updateChantCollection,
} from "./api/chantsApi";
import { useChantImage } from "./hooks/useChantImage";
import ChantImageField from "./components/chants/ChantImageField";

const chantCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  img_url: z.string().trim().optional(),
});

type ChantCollectionFormData = z.infer<typeof chantCollectionSchema>;

const GroupChantFormPage = () => {
  const { groupId, collectionId } = useParams<{
    groupId: string;
    collectionId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { myRole, userInfo, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();

  const isNew = !collectionId;
  const canWrite =
    !readOnlyPlatform && canWriteEvents(myRole, userInfo?.platform_role);
  const readOnly = !canWrite;

  const form = useForm<ChantCollectionFormData>({
    resolver: zodResolver(chantCollectionSchema),
    defaultValues: { name: "", img_url: "" },
    mode: "onChange",
  });

  const setImageUrl = useCallback(
    (url: string) => {
      form.setValue("img_url", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const image = useChantImage({ setImageUrl });
  const { setImagePreview, setSelectedImage } = image;

  const collectionQuery = useQuery({
    queryKey: ["cms-chant-collection", groupId, collectionId],
    queryFn: () => fetchChantCollection(groupId!, collectionId!),
    enabled: Boolean(groupId) && Boolean(collectionId) && !isNew,
    refetchOnWindowFocus: false,
  });
  const collectionData = collectionQuery.data;

  const originalRef = useRef<ChantCollectionFormData | null>(null);
  const hydratedIdRef = useRef<string | null>(null);

  useEffect(() => {
    hydratedIdRef.current = null;
  }, [collectionId]);

  useEffect(() => {
    if (isNew || !collectionData) return;
    if (hydratedIdRef.current === collectionData.id) return;
    hydratedIdRef.current = collectionData.id;
    const formData: ChantCollectionFormData = {
      name: collectionData.name ?? "",
      img_url: collectionData.img_url ?? "",
    };
    originalRef.current = formData;
    form.reset(formData);
    setImagePreview(collectionData.img_url ?? null);
    setSelectedImage(null);
  }, [isNew, collectionData, form, setImagePreview, setSelectedImage]);

  const chantsListPath = groupId ? ROUTES.groupChants(groupId) : ROUTES.groups;

  const mutation = useMutation({
    mutationFn: async (data: ChantCollectionFormData) => {
      if (isNew) {
        return createChantCollection(groupId!, {
          name: data.name,
          img_url: data.img_url || undefined,
        });
      }
      const updates: { name?: string; img_url?: string } = {};
      const original = originalRef.current;
      if (data.name !== original?.name) updates.name = data.name;
      if (data.img_url !== original?.img_url) updates.img_url = data.img_url;
      return updateChantCollection(groupId!, collectionId!, updates);
    },
    onSuccess: () => {
      toast.success(isNew ? "Collection created" : "Collection updated");
      queryClient.invalidateQueries({
        queryKey: ["cms-chant-collections", groupId],
      });
      if (collectionId) {
        queryClient.invalidateQueries({
          queryKey: ["cms-chant-collection", groupId, collectionId],
        });
      }
      navigate(chantsListPath);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const onSubmit = form.handleSubmit((data) => {
    if (readOnly) return;
    mutation.mutate(data);
  });

  if (!isNew && collectionQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading collection…
      </div>
    );
  }

  if (!isNew && collectionQuery.isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-center text-destructive">
          {getApiErrorMessage(
            collectionQuery.error,
            "Could not load this collection.",
          )}
        </p>
        <Pecha.Button
          variant="outline"
          onClick={() => navigate(chantsListPath)}
        >
          Back to chants
        </Pecha.Button>
      </div>
    );
  }

  const getSaveLabel = () => {
    if (mutation.isPending) return isNew ? "Creating…" : "Saving…";
    return isNew ? "Create collection" : "Save changes";
  };

  const saveDisabled =
    readOnly || mutation.isPending || (!isNew && !form.formState.isDirty);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {isNew ? "New collection" : "Edit collection"}
        </h1>
      </div>

      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          You do not have permission to {isNew ? "create" : "edit"} collections
          in this group.
        </p>
      ) : null}

      <Pecha.Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <Pecha.FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <Pecha.FormItem>
                <Pecha.FormLabel>Name</Pecha.FormLabel>
                <Pecha.FormControl>
                  <Pecha.Input
                    {...field}
                    placeholder="Collection name"
                    disabled={readOnly}
                  />
                </Pecha.FormControl>
                <Pecha.FormMessage />
              </Pecha.FormItem>
            )}
          />

          <ChantImageField
            imagePreview={image.imagePreview}
            selectedImage={image.selectedImage}
            isDialogOpen={image.isImageDialogOpen}
            isUploading={image.isImageUploading}
            readOnly={readOnly}
            onOpenDialog={image.openImageDialog}
            onDialogOpenChange={image.setImageDialogOpen}
            onUpload={image.uploadImage}
            onRemove={image.removeImage}
          />

          <div className="flex justify-end gap-3 border-t border-dashed border-border pt-6">
            <Pecha.Button
              type="button"
              variant="outline"
              onClick={() => navigate(chantsListPath)}
            >
              Cancel
            </Pecha.Button>
            {!readOnly ? (
              <Pecha.Button
                type="submit"
                disabled={saveDisabled}
                className="bg-[#A51C21] font-medium text-white hover:bg-[#A51C21]/90 disabled:opacity-50"
              >
                {getSaveLabel()}
              </Pecha.Button>
            ) : null}
          </div>
        </form>
      </Pecha.Form>
    </div>
  );
};

export default GroupChantFormPage;

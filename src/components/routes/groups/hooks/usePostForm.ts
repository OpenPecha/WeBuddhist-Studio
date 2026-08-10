import { useCallback } from "react";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  postSchema,
  defaultPostFormValues,
  emptyPostLinkRow,
  type PostFormData,
  type PostMediaRow,
} from "@/schema/PostSchema";

export type UsePostFormReturn = {
  form: UseFormReturn<PostFormData>;
  linkRows: ReturnType<typeof useFieldArray<PostFormData, "links">>;
  mediaRows: ReturnType<typeof useFieldArray<PostFormData, "media">>;
  addLinkRow: () => void;
  removeLinkRow: (index: number) => void;
  moveLinkRow: (from: number, to: number) => void;
  addMediaRow: (row: PostMediaRow) => void;
  removeMediaRow: (index: number) => void;
  moveMediaRow: (from: number, to: number) => void;
  startMediaReplace: () => void;
  clearMedia: () => void;
};

export const usePostForm = (): UsePostFormReturn => {
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: defaultPostFormValues(),
    mode: "onChange",
  });

  const linkRows = useFieldArray({
    control: form.control,
    name: "links",
  });

  const mediaRows = useFieldArray({
    control: form.control,
    name: "media",
  });

  const markMediaDirty = useCallback(() => {
    form.setValue("media_dirty", true, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form]);

  const addLinkRow = useCallback(() => {
    linkRows.append(emptyPostLinkRow());
  }, [linkRows]);

  const removeLinkRow = useCallback(
    (index: number) => {
      linkRows.remove(index);
    },
    [linkRows],
  );

  const moveLinkRow = useCallback(
    (from: number, to: number) => {
      const count = form.getValues("links")?.length ?? 0;
      if (to < 0 || to >= count || from === to) return;
      linkRows.move(from, to);
      form.setValue(`links.${to}.type`, form.getValues(`links.${to}.type`), {
        shouldDirty: true,
      });
    },
    [form, linkRows],
  );

  const addMediaRow = useCallback(
    (row: PostMediaRow) => {
      mediaRows.append(row);
      markMediaDirty();
    },
    [mediaRows, markMediaDirty],
  );

  const removeMediaRow = useCallback(
    (index: number) => {
      mediaRows.remove(index);
      markMediaDirty();
    },
    [mediaRows, markMediaDirty],
  );

  const moveMediaRow = useCallback(
    (from: number, to: number) => {
      const count = form.getValues("media")?.length ?? 0;
      if (to < 0 || to >= count || from === to) return;
      mediaRows.move(from, to);
      markMediaDirty();
    },
    [form, mediaRows, markMediaDirty],
  );

  const startMediaReplace = useCallback(() => {
    mediaRows.replace([]);
    markMediaDirty();
  }, [mediaRows, markMediaDirty]);

  const clearMedia = useCallback(() => {
    mediaRows.replace([]);
    markMediaDirty();
  }, [mediaRows, markMediaDirty]);

  return {
    form,
    linkRows,
    mediaRows,
    addLinkRow,
    removeLinkRow,
    moveLinkRow,
    addMediaRow,
    removeMediaRow,
    moveMediaRow,
    startMediaReplace,
    clearMedia,
  };
};

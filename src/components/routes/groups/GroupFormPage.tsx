import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Button } from "@/components/ui/atoms/button";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";
import { uploadImageToS3 } from "@/components/routes/task/api/taskApi";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { PLAN_LANGUAGE } from "@/lib/constant";
import { ROUTES } from "@/routes/paths";
import type { LanguageCode } from "@/schema/SeriesSchema";
import { groupCoreSchema, type GroupCoreFormData } from "@/schema/GroupSchema";
import { mapIdsToFkOptions } from "./api/groupPickerApi";
import {
  buildGroupMetadata,
  createGroup,
  fetchGroup,
  languageLabelForCode,
  patchGroup,
  pickGroupTitle,
  replaceGroupPlans,
  replaceGroupSeries,
  replaceGroupSocialLinks,
  replaceGroupTags,
  resolveGroupBannerUrl,
  type GroupSocialLinkDTO,
  type TagSummaryDTO,
} from "./api/groupsApi";
import { searchSeries } from "./api/seriesSearchApi";
import GroupFormAssociationsPanel from "./components/GroupFormAssociationsPanel";
import GroupImageField from "./components/GroupImageField";
import { GroupPageShell } from "./components/GroupPageShell";
import GroupMembersPanel from "./components/GroupMembersPanel";
import type { FkOption } from "./components/FkMultiSearchSelector";
import { useGroupLinkedTitles } from "./hooks/useGroupLinkedTitles";

const GroupFormPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !groupId;
  const hydratedRef = useRef<string | null>(null);

  const [addedLanguages, setAddedLanguages] = useState<LanguageCode[]>(["EN"]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [bannerKey, setBannerKey] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [initialTags, setInitialTags] = useState<TagSummaryDTO[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<FkOption[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<FkOption[]>([]);
  const [socialLinks, setSocialLinks] = useState<GroupSocialLinkDTO[]>([]);

  const form = useForm<GroupCoreFormData>({
    resolver: zodResolver(groupCoreSchema),
    defaultValues: {
      slug: "",
      is_public: true,
      languages: { EN: { title: "", description: "" } },
      avatar_key: "",
      banner_key: "",
    },
  });

  const {
    data: groupData,
    isLoading: isGroupLoading,
    error: groupError,
  } = useQuery({
    queryKey: ["cms-group", groupId],
    queryFn: () => fetchGroup(groupId!),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  const { planOptions } = useGroupLinkedTitles(
    groupData?.plan_ids,
    groupData?.series_ids,
  );

  useEffect(() => {
    if (isNew || !groupData) return;
    if (hydratedRef.current === groupData.id) return;
    hydratedRef.current = groupData.id;

    const languages: GroupCoreFormData["languages"] = {};
    const langs: LanguageCode[] = [];
    for (const meta of groupData.metadata) {
      const code = meta.language as LanguageCode;
      langs.push(code);
      languages[code] = {
        title: meta.title ?? "",
        description: meta.description ?? "",
      };
    }
    setAddedLanguages(langs.length ? langs : ["EN"]);
    form.reset({
      slug: groupData.slug,
      is_public: groupData.is_public,
      languages:
        langs.length > 0 ? languages : { EN: { title: "", description: "" } },
      avatar_key: groupData.avatar_key ?? "",
      banner_key: groupData.banner_key ?? "",
    });

    setAvatarKey(groupData.avatar_key ?? null);
    setBannerKey(groupData.banner_key ?? null);
    setBannerPreview(resolveGroupBannerUrl(groupData));
    setTagIds(groupData.tags.map((t) => t.id));
    setInitialTags(groupData.tags);
    setSocialLinks(groupData.social_links ?? []);

    const planTitleMap = new Map(planOptions.map((p) => [p.id, p.title]));
    setSelectedPlans(mapIdsToFkOptions(groupData.plan_ids ?? [], planTitleMap));
    setSelectedSeries(
      (groupData.series_ids ?? []).map((id) => ({ id, title: id })),
    );
  }, [isNew, groupData, form, planOptions]);

  useEffect(() => {
    if (isNew || !groupData?.series_ids?.length) return;
    let cancelled = false;
    (async () => {
      const result = await searchSeries({ limit: 500 });
      if (cancelled) return;
      const titleMap = new Map(result.series.map((s) => [s.id, s.title]));
      setSelectedSeries(mapIdsToFkOptions(groupData.series_ids, titleMap));
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, groupData?.id, groupData?.series_ids]);

  const availableLanguages = PLAN_LANGUAGE.filter(
    (l) => !addedLanguages.includes(l.value as LanguageCode),
  );

  const addLanguage = (code: LanguageCode) => {
    if (addedLanguages.includes(code)) return;
    setAddedLanguages((prev) => [...prev, code]);
    form.setValue(
      `languages.${code}`,
      { title: "", description: "" },
      {
        shouldDirty: true,
      },
    );
  };

  const removeLanguage = (code: LanguageCode) => {
    if (addedLanguages.length <= 1) {
      toast.error("At least one language is required");
      return;
    }
    setAddedLanguages((prev) => prev.filter((c) => c !== code));
    form.unregister(`languages.${code}`);
  };

  const invalidateGroup = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-groups"] });
    if (groupId) {
      queryClient.invalidateQueries({ queryKey: ["cms-group", groupId] });
    }
  };

  const toastOnError = (err: unknown) => toast.error(getApiErrorMessage(err));

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      toast.success("Group created");
      invalidateGroup();
      navigate(ROUTES.groupEdit(data.id));
    },
    onError: toastOnError,
  });

  const patchMutation = useMutation({
    mutationFn: (payload: Parameters<typeof patchGroup>[1]) =>
      patchGroup(groupId!, payload),
    onSuccess: () => {
      toast.success("Group updated");
      invalidateGroup();
    },
    onError: toastOnError,
  });

  const tagsMutation = useMutation({
    mutationFn: () => replaceGroupTags(groupId!, { tag_ids: tagIds }),
    onSuccess: () => {
      toast.success("Tags saved");
      invalidateGroup();
    },
    onError: toastOnError,
  });

  const plansMutation = useMutation({
    mutationFn: () =>
      replaceGroupPlans(groupId!, {
        plan_ids: selectedPlans.map((p) => p.id),
      }),
    onSuccess: () => {
      toast.success("Plans saved");
      invalidateGroup();
    },
    onError: toastOnError,
  });

  const seriesMutation = useMutation({
    mutationFn: () =>
      replaceGroupSeries(groupId!, {
        series_ids: selectedSeries.map((s) => s.id),
      }),
    onSuccess: () => {
      toast.success("Series saved");
      invalidateGroup();
    },
    onError: toastOnError,
  });

  const socialMutation = useMutation({
    mutationFn: () =>
      replaceGroupSocialLinks(groupId!, { social_links: socialLinks }),
    onSuccess: () => {
      toast.success("Social links saved");
      invalidateGroup();
    },
    onError: toastOnError,
  });

  const handleImageUpload = async (file: File, kind: "avatar" | "banner") => {
    const setUploading =
      kind === "avatar" ? setAvatarUploading : setBannerUploading;
    const setPreview = kind === "avatar" ? setAvatarPreview : setBannerPreview;
    const setKey = kind === "avatar" ? setAvatarKey : setBannerKey;
    const setDialog =
      kind === "avatar" ? setAvatarDialogOpen : setBannerDialogOpen;
    const field = kind === "avatar" ? "avatar_key" : "banner_key";

    setUploading(true);
    try {
      const { image, key } = await uploadImageToS3(file, groupId ?? "");
      setPreview(image.original);
      setKey(key);
      form.setValue(field, key, { shouldDirty: true });
      setDialog(false);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onSaveCore = form.handleSubmit((data) => {
    const metadata = buildGroupMetadata(data.languages);
    const payload = {
      slug: data.slug.trim(),
      is_public: data.is_public,
      metadata,
      avatar_key: avatarKey,
      banner_key: bannerKey,
    };
    if (isNew) {
      createMutation.mutate(payload);
      return;
    }
    patchMutation.mutate(payload);
  });

  const corePending = createMutation.isPending || patchMutation.isPending;
  const pageTitle = useMemo(
    () =>
      isNew
        ? "Create group"
        : pickGroupTitle(groupData?.metadata, "Edit group"),
    [isNew, groupData?.metadata],
  );

  if (!isNew && isGroupLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
        Loading group…
      </div>
    );
  }

  if (!isNew && groupError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-destructive">{getApiErrorMessage(groupError)}</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.groups)}>
          Back to groups
        </Button>
      </div>
    );
  }

  return (
    <GroupPageShell
      backLabel="← Groups"
      onBack={() => navigate(ROUTES.groups)}
      title={pageTitle}
    >
      <div
        className={
          isNew
            ? "max-w-2xl mx-auto w-full p-4 sm:p-8 pb-12"
            : "flex flex-col xl:flex-row xl:items-start min-h-full"
        }
      >
        <div
          className={
            isNew
              ? "space-y-6"
              : "w-full xl:w-1/2 xl:min-w-0 p-4 sm:p-8 pb-8 xl:border-r border-border"
          }
        >
          <section className="space-y-6">
            <h2 className="text-base font-bold">General</h2>
            <Pecha.Form {...form}>
              <form onSubmit={onSaveCore} className="space-y-6">
                <Pecha.FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <Pecha.FormItem>
                      <Pecha.FormLabel className="text-sm font-bold">
                        Slug
                      </Pecha.FormLabel>
                      <Pecha.FormControl>
                        <Pecha.Input
                          placeholder="bodhichitta-authors"
                          className="font-mono h-12 bg-white dark:bg-[#262626]"
                          {...field}
                        />
                      </Pecha.FormControl>
                      <Pecha.FormMessage />
                    </Pecha.FormItem>
                  )}
                />
                <Pecha.FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <Pecha.FormItem className="flex items-center gap-3">
                      <Pecha.FormControl>
                        <Pecha.Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </Pecha.FormControl>
                      <Pecha.FormLabel className="text-sm font-bold !mt-0">
                        Public group
                      </Pecha.FormLabel>
                    </Pecha.FormItem>
                  )}
                />
                <div className="space-y-4">
                  {addedLanguages.map((code) => (
                    <div
                      key={code}
                      className="relative rounded-lg border border-input bg-[#FAFAFA] dark:bg-[#262626] p-4 space-y-3"
                    >
                      <button
                        type="button"
                        onClick={() => removeLanguage(code)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
                        aria-label={`Remove ${languageLabelForCode(code)}`}
                      >
                        <IoMdClose className="h-4 w-4" />
                      </button>
                      <Pecha.FormField
                        control={form.control}
                        name={`languages.${code}.title`}
                        render={({ field }) => (
                          <Pecha.FormItem>
                            <Pecha.FormLabel className="text-sm font-bold">
                              {languageLabelForCode(code)} title
                            </Pecha.FormLabel>
                            <Pecha.FormControl>
                              <Pecha.Input
                                className="h-12 bg-white dark:bg-[#181818]"
                                {...field}
                              />
                            </Pecha.FormControl>
                            <Pecha.FormMessage />
                          </Pecha.FormItem>
                        )}
                      />
                      <Pecha.FormField
                        control={form.control}
                        name={`languages.${code}.description`}
                        render={({ field }) => (
                          <Pecha.FormItem>
                            <Pecha.FormLabel className="text-sm font-bold">
                              {languageLabelForCode(code)} description
                            </Pecha.FormLabel>
                            <Pecha.FormControl>
                              <Textarea
                                className="min-h-[100px] resize-none bg-white dark:bg-[#181818]"
                                {...field}
                              />
                            </Pecha.FormControl>
                          </Pecha.FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                {availableLanguages.length > 0 && (
                  <Pecha.Select
                    onValueChange={(v) => addLanguage(v as LanguageCode)}
                  >
                    <Pecha.SelectTrigger className="w-fit border-dashed bg-white dark:bg-[#262626]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IoMdAdd className="h-4 w-4" />
                        <Pecha.SelectValue placeholder="Add language" />
                      </div>
                    </Pecha.SelectTrigger>
                    <Pecha.SelectContent>
                      {availableLanguages.map((lang) => (
                        <Pecha.SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </Pecha.SelectItem>
                      ))}
                    </Pecha.SelectContent>
                  </Pecha.Select>
                )}
                <div className="grid sm:grid-cols-2 gap-6">
                  <GroupImageField
                    label="Avatar"
                    displayUrl={avatarPreview}
                    hasStoredImage={Boolean(avatarKey)}
                    onUploadClick={() => setAvatarDialogOpen(true)}
                    imageClassName="w-20 h-20 rounded-full object-cover border"
                  />
                  <GroupImageField
                    label="Banner"
                    displayUrl={bannerPreview}
                    hasStoredImage={Boolean(bannerKey)}
                    onUploadClick={() => setBannerDialogOpen(true)}
                    imageClassName="w-full max-w-xs h-24 rounded object-cover border"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
                    disabled={corePending}
                  >
                    {corePending
                      ? isNew
                        ? "Creating…"
                        : "Saving…"
                      : isNew
                        ? "Create group"
                        : "Save general"}
                  </Button>
                </div>
              </form>
            </Pecha.Form>
          </section>
        </div>

        {!isNew && groupData && (
          <GroupFormAssociationsPanel
            tagIds={tagIds}
            onTagIdsChange={setTagIds}
            initialTags={initialTags}
            selectedPlans={selectedPlans}
            onPlansChange={setSelectedPlans}
            selectedSeries={selectedSeries}
            onSeriesChange={setSelectedSeries}
            socialLinks={socialLinks}
            onSocialLinksChange={setSocialLinks}
            onSaveTags={() => tagsMutation.mutate()}
            onSavePlans={() => plansMutation.mutate()}
            onSaveSeries={() => seriesMutation.mutate()}
            onSaveSocial={() => socialMutation.mutate()}
            tagsSaving={tagsMutation.isPending}
            plansSaving={plansMutation.isPending}
            seriesSaving={seriesMutation.isPending}
            socialSaving={socialMutation.isPending}
          />
        )}
      </div>

      {!isNew && groupData && (
        <div className="border-t border-dashed border-gray-300 dark:border-input p-4 sm:p-8 pb-12">
          <GroupMembersPanel
            groupId={groupData.id}
            members={groupData.members ?? []}
          />
        </div>
      )}

      <Pecha.Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <Pecha.DialogContent>
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>Upload avatar</Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <ImageContentData
            onUpload={(file) => handleImageUpload(file, "avatar")}
            isLoading={avatarUploading}
          />
        </Pecha.DialogContent>
      </Pecha.Dialog>

      <Pecha.Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <Pecha.DialogContent>
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>Upload banner</Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <ImageContentData
            onUpload={(file) => handleImageUpload(file, "banner")}
            isLoading={bannerUploading}
          />
        </Pecha.DialogContent>
      </Pecha.Dialog>
    </GroupPageShell>
  );
};

export default GroupFormPage;

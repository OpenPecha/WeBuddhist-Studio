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
import {
  buildGroupMetadata,
  createGroup,
  fetchGroup,
  languageLabelForCode,
  patchGroup,
  pickGroupTitle,
  replaceGroupSocialLinks,
  replaceGroupTags,
  resolveGroupAvatarUrl,
  resolveGroupBannerUrl,
  type GroupSocialLinkDTO,
  type TagSummaryDTO,
} from "./api/groupsApi";
import GroupFormAssociationsPanel from "./components/GroupFormAssociationsPanel";
import GroupImageField from "./components/GroupImageField";
import { GroupPageShell } from "./components/GroupPageShell";
import GroupMembersPanel from "./components/GroupMembersPanel";
import { useUserInfo } from "@/hooks/useUserInfo";
import {
  canEditGroupSettings,
  getEffectiveGroupRole,
} from "./lib/groupPermissions";
import { sameSocialLinks, sameSortedIds } from "./lib/groupFormSectionDirty";

type AssociationBaselines = {
  tagIds: string[];
  socialLinks: GroupSocialLinkDTO[];
  avatarKey: string | null;
  bannerKey: string | null;
};

const emptyAssociationBaselines = (): AssociationBaselines => ({
  tagIds: [],
  socialLinks: [],
  avatarKey: null,
  bannerKey: null,
});

const GroupFormPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userInfo } = useUserInfo();
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
  const [socialLinks, setSocialLinks] = useState<GroupSocialLinkDTO[]>([]);
  const [savedBaselines, setSavedBaselines] = useState<AssociationBaselines>(
    emptyAssociationBaselines,
  );

  const form = useForm<GroupCoreFormData>({
    resolver: zodResolver(groupCoreSchema),
    defaultValues: {
      slug: "",
      is_public: true,
      languages: {
        EN: { title: "", sub_title: "", description: "", description_long: "" },
      },
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
        sub_title: meta.sub_title ?? "",
        description: meta.description ?? "",
        description_long: meta.description_long ?? "",
      };
    }
    setAddedLanguages(langs.length ? langs : ["EN"]);
    form.reset({
      slug: groupData.slug,
      is_public: groupData.is_public,
      languages:
        langs.length > 0
          ? languages
          : {
              EN: {
                title: "",
                sub_title: "",
                description: "",
                description_long: "",
              },
            },
      avatar_key: groupData.avatar_key ?? "",
      banner_key: groupData.banner_key ?? "",
    });

    setAvatarKey(groupData.avatar_key ?? null);
    setBannerKey(groupData.banner_key ?? null);
    setAvatarPreview(resolveGroupAvatarUrl(groupData));
    setBannerPreview(resolveGroupBannerUrl(groupData));
    setTagIds(groupData.tags.map((t) => t.id));
    setInitialTags(groupData.tags);
    setSocialLinks(groupData.social_links ?? []);

    setSavedBaselines({
      tagIds: groupData.tags.map((t) => t.id),
      socialLinks: groupData.social_links ?? [],
      avatarKey: groupData.avatar_key ?? null,
      bannerKey: groupData.banner_key ?? null,
    });
  }, [isNew, groupData, form]);

  const availableLanguages = PLAN_LANGUAGE.filter(
    (l) => !addedLanguages.includes(l.value as LanguageCode),
  );

  const addLanguage = (code: LanguageCode) => {
    if (addedLanguages.includes(code)) return;
    setAddedLanguages((prev) => [...prev, code]);
    form.setValue(
      `languages.${code}`,
      { title: "", sub_title: "", description: "", description_long: "" },
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
      form.reset(form.getValues());
      setSavedBaselines((prev) => ({
        ...prev,
        avatarKey,
        bannerKey,
      }));
    },
    onError: toastOnError,
  });

  const tagsMutation = useMutation({
    mutationFn: () => replaceGroupTags(groupId!, { tag_ids: tagIds }),
    onSuccess: () => {
      toast.success("Tags saved");
      invalidateGroup();
      setSavedBaselines((prev) => ({ ...prev, tagIds: [...tagIds] }));
    },
    onError: toastOnError,
  });

  const socialMutation = useMutation({
    mutationFn: () =>
      replaceGroupSocialLinks(groupId!, { social_links: socialLinks }),
    onSuccess: () => {
      toast.success("Social links saved");
      invalidateGroup();
      setSavedBaselines((prev) => ({
        ...prev,
        socialLinks: [...socialLinks],
      }));
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
    if (!isNew && !canEditGroupSettings(myRole)) return;
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
  const { isDirty: isFormDirty } = form.formState;
  const imagesDirty =
    avatarKey !== savedBaselines.avatarKey ||
    bannerKey !== savedBaselines.bannerKey;
  const isCoreDirty = isFormDirty || imagesDirty;
  const tagsDirty = !sameSortedIds(tagIds, savedBaselines.tagIds);
  const socialDirty = !sameSocialLinks(socialLinks, savedBaselines.socialLinks);
  const myRole = useMemo(
    () =>
      isNew || !groupData
        ? undefined
        : getEffectiveGroupRole(groupData.members ?? [], userInfo),
    [isNew, groupData, userInfo],
  );
  const canEditSettings = isNew || canEditGroupSettings(myRole);

  const pageTitle = useMemo(
    () =>
      isNew
        ? "Create group"
        : canEditSettings
          ? pickGroupTitle(groupData?.metadata, "Edit group")
          : pickGroupTitle(groupData?.metadata, "View group"),
    [isNew, canEditSettings, groupData?.metadata],
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
      {!isNew && !canEditSettings && (
        <div className="mx-4 sm:mx-8 mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          You have view-only access to this group. Settings cannot be changed;
          you can still leave the group from the Members section below.
        </div>
      )}
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
                <fieldset
                  disabled={!canEditSettings}
                  className="space-y-6 min-w-0 border-0 p-0 m-0"
                >
                  <Pecha.FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <Pecha.FormItem>
                        <Pecha.FormLabel className="text-sm font-bold">
                          Slug
                          <span className="text-destructive"> *</span>
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
                                <span className="text-destructive"> *</span>
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
                          name={`languages.${code}.sub_title`}
                          render={({ field }) => (
                            <Pecha.FormItem>
                              <Pecha.FormLabel className="text-sm font-bold">
                                {languageLabelForCode(code)} sub-title
                                <span className="text-destructive"> *</span>
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
                                <span className="text-destructive"> *</span>
                              </Pecha.FormLabel>
                              <Pecha.FormControl>
                                <Textarea
                                  className="min-h-[100px] resize-none bg-white dark:bg-[#181818]"
                                  maxLength={200}
                                  {...field}
                                />
                              </Pecha.FormControl>
                              <Pecha.FormMessage />
                            </Pecha.FormItem>
                          )}
                        />
                        <Pecha.FormField
                          control={form.control}
                          name={`languages.${code}.description_long`}
                          render={({ field }) => (
                            <Pecha.FormItem>
                              <Pecha.FormLabel className="text-sm font-bold">
                                {languageLabelForCode(code)} long description
                              </Pecha.FormLabel>
                              <Pecha.FormControl>
                                <Textarea
                                  className="min-h-[160px] resize-y bg-white dark:bg-[#181818]"
                                  placeholder="A longer description with more detail…"
                                  {...field}
                                />
                              </Pecha.FormControl>
                              <Pecha.FormMessage />
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
                      readOnly={!canEditSettings}
                    />
                    <GroupImageField
                      label="Banner"
                      displayUrl={bannerPreview}
                      hasStoredImage={Boolean(bannerKey)}
                      onUploadClick={() => setBannerDialogOpen(true)}
                      imageClassName="w-full max-w-xs h-24 rounded object-cover border"
                      readOnly={!canEditSettings}
                    />
                  </div>
                  {canEditSettings && (
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
                        disabled={corePending || !isCoreDirty}
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
                  )}
                </fieldset>
              </form>
            </Pecha.Form>
          </section>
        </div>

        {!isNew && groupData && (
          <GroupFormAssociationsPanel
            tagIds={tagIds}
            onTagIdsChange={setTagIds}
            initialTags={initialTags}
            socialLinks={socialLinks}
            onSocialLinksChange={setSocialLinks}
            onSaveTags={() => tagsMutation.mutate()}
            onSaveSocial={() => socialMutation.mutate()}
            tagsSaving={tagsMutation.isPending}
            socialSaving={socialMutation.isPending}
            tagsSaveDisabled={!tagsDirty}
            socialSaveDisabled={!socialDirty}
            readOnly={!canEditSettings}
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

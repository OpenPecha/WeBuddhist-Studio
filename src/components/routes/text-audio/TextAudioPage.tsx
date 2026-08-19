import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Dropzone from "react-dropzone";
import { useDebounce } from "use-debounce";
import {
  FiCheck,
  FiEdit2,
  FiFileText,
  FiLoader,
  FiSearch,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Pecha } from "@/components/ui/shadimport";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { formatMs, getAudioDurationMs } from "@/lib/utils";

import {
  deleteAudioOtr,
  deleteTextAudio,
  fetchAudioOtrs,
  fetchOtrContent,
  fetchTextAudios,
  fetchTextSegments,
  INVALID_OTR_MESSAGE,
  otrNameFromFile,
  parseOtrFile,
  searchTexts,
  type OtrContent,
  type TextAudio,
  type TextAudioOtr,
  type TextSearchResult,
  updateTextAudioName,
  uploadAudioOtr,
  uploadTextAudio,
} from "./api/textAudioApi";
import { OtrSyncPlayer } from "./OtrSyncPlayer";

interface PendingOtr {
  name: string;
  content: OtrContent;
}

const TextAudioPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search.trim(), 400);
  const [selectedText, setSelectedText] = useState<TextSearchResult | null>(
    null,
  );
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [selectedOtrId, setSelectedOtrId] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingOtr, setPendingOtr] = useState<PendingOtr | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioToDelete, setAudioToDelete] = useState<{
    textId: string;
    audio: TextAudio;
  } | null>(null);
  const [otrToDelete, setOtrToDelete] = useState<{
    textId: string;
    audioId: string;
    otr: TextAudioOtr;
  } | null>(null);
  const [editingAudioId, setEditingAudioId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const searchQuery = useQuery({
    queryKey: ["text-audio-search", debouncedSearch],
    queryFn: () => searchTexts(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    retry: false,
  });

  const audiosQuery = useQuery({
    queryKey: ["text-audios", selectedText?.id],
    queryFn: () => fetchTextAudios(selectedText!.id),
    enabled: Boolean(selectedText),
    retry: false,
  });

  const audios = audiosQuery.data ?? [];
  const selectedAudio = audios.find((a) => a.id === selectedAudioId) ?? null;

  const otrsQuery = useQuery({
    queryKey: ["text-audio-otrs", selectedText?.id, selectedAudioId],
    queryFn: () => fetchAudioOtrs(selectedText!.id, selectedAudioId!),
    enabled: Boolean(selectedText && selectedAudioId),
    retry: false,
  });

  const otrs = otrsQuery.data ?? [];
  const selectedOtr = otrs.find((o) => o.id === selectedOtrId) ?? null;

  const otrContentQuery = useQuery({
    queryKey: [
      "text-audio-otr-content",
      selectedText?.id,
      selectedAudioId,
      selectedOtrId,
    ],
    queryFn: () =>
      fetchOtrContent(selectedText!.id, selectedAudioId!, selectedOtrId!),
    enabled: Boolean(selectedText && selectedAudioId && selectedOtrId),
    retry: false,
  });

  const segmentsQuery = useQuery({
    queryKey: ["text-segments", selectedText?.id],
    queryFn: () => fetchTextSegments(selectedText!.id),
    enabled: Boolean(selectedText && selectedOtrId),
    retry: false,
  });

  // Every mutation below can still be in flight when the user selects a
  // different text/audio/OTR, and TanStack Query re-binds onSuccess/onError
  // to the component's latest render before invoking them - so reading
  // selectedText/selectedAudioId/selectedOtrId there would see whatever the
  // user has navigated to *since*, not the parent the request was actually
  // made for. Each mutation instead takes its parent ids as variables,
  // captured synchronously at the moment it's fired, and completions use
  // those captured ids both for cache invalidation and to decide whether
  // it's still safe to touch selection state.
  const uploadMutation = useMutation({
    mutationFn: async ({
      text,
      file,
    }: {
      text: TextSearchResult;
      file: File;
    }) => {
      // The browser can't decode every valid audio codec (e.g. ALAC m4a
      // from iOS/Mac Voice Memos), and the server re-probes the converted
      // MP3 anyway - so never let a failed probe block the upload.
      const durationMs = await getAudioDurationMs(file).catch(() => undefined);
      return uploadTextAudio({
        text,
        file,
        durationMs,
        onProgress: setUploadProgress,
      });
    },
    onSuccess: (audio, { text }) => {
      queryClient.invalidateQueries({
        queryKey: ["text-audios", text.id],
      });
      if (selectedText?.id === text.id) {
        setPendingFile(null);
        setUploadProgress(0);
        selectAudio(audio.id);
      }
      toast.success("Audio uploaded");
    },
    onError: (error) => {
      setUploadProgress(0);
      toast.error("Failed to upload audio", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const deleteAudioMutation = useMutation({
    mutationFn: ({ textId, audio }: { textId: string; audio: TextAudio }) =>
      deleteTextAudio(textId, audio.id),
    onSuccess: (_, { textId, audio }) => {
      queryClient.invalidateQueries({
        queryKey: ["text-audios", textId],
      });
      if (selectedText?.id === textId && selectedAudioId === audio.id) {
        selectAudio(null);
      }
      setAudioToDelete(null);
      toast.success("Audio deleted");
    },
    onError: (error) =>
      toast.error("Failed to delete audio", {
        description: getApiErrorMessage(error),
      }),
  });

  const renameAudioMutation = useMutation({
    mutationFn: ({
      textId,
      audio,
      name,
    }: {
      textId: string;
      audio: TextAudio;
      name: string;
    }) => updateTextAudioName(textId, audio.id, name),
    onSuccess: (_, { textId }) => {
      queryClient.invalidateQueries({
        queryKey: ["text-audios", textId],
      });
      setEditingAudioId(null);
      toast.success("Audio renamed");
    },
    onError: (error) =>
      toast.error("Failed to rename audio", {
        description: getApiErrorMessage(error),
      }),
  });

  const uploadOtrMutation = useMutation({
    mutationFn: ({
      textId,
      audioId,
      otr,
    }: {
      textId: string;
      audioId: string;
      otr: PendingOtr;
    }) =>
      uploadAudioOtr({
        textId,
        audioId,
        name: otr.name,
        content: otr.content,
      }),
    onSuccess: (otr, { textId, audioId }) => {
      queryClient.invalidateQueries({
        queryKey: ["text-audio-otrs", textId, audioId],
      });
      if (selectedText?.id === textId && selectedAudioId === audioId) {
        setPendingOtr(null);
        setSelectedOtrId(otr.id);
      }
      toast.success("OTR saved");
    },
    onError: (error) =>
      toast.error("Failed to upload OTR", {
        description: getApiErrorMessage(error),
      }),
  });

  const deleteOtrMutation = useMutation({
    mutationFn: ({
      textId,
      audioId,
      otr,
    }: {
      textId: string;
      audioId: string;
      otr: TextAudioOtr;
    }) => deleteAudioOtr(textId, audioId, otr.id),
    onSuccess: (_, { textId, audioId, otr }) => {
      queryClient.invalidateQueries({
        queryKey: ["text-audio-otrs", textId, audioId],
      });
      if (
        selectedText?.id === textId &&
        selectedAudioId === audioId &&
        selectedOtrId === otr.id
      ) {
        setSelectedOtrId(null);
      }
      setOtrToDelete(null);
      toast.success("OTR deleted");
    },
    onError: (error) =>
      toast.error("Failed to delete OTR", {
        description: getApiErrorMessage(error),
      }),
  });

  const selectText = (text: TextSearchResult) => {
    setSelectedText(text);
    setPendingFile(null);
    setUploadProgress(0);
    selectAudio(null);
  };

  const selectAudio = (audioId: string | null) => {
    setSelectedAudioId(audioId);
    setSelectedOtrId(null);
    setPendingOtr(null);
  };

  const startRenameAudio = (audio: TextAudio) => {
    setEditingAudioId(audio.id);
    setEditingName(audio.name);
  };

  const cancelRenameAudio = () => {
    setEditingAudioId(null);
    setEditingName("");
  };

  const saveRenameAudio = (audio: TextAudio) => {
    const name = editingName.trim();
    if (!name || name === audio.name) {
      cancelRenameAudio();
      return;
    }
    renameAudioMutation.mutate({ textId: selectedText!.id, audio, name });
  };

  const handleOtrDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    try {
      const content = await parseOtrFile(file);
      setPendingOtr({ name: otrNameFromFile(file), content });
    } catch {
      toast.error(INVALID_OTR_MESSAGE);
    }
  };

  const isUploading = uploadMutation.isPending;

  return (
    <div className="flex flex-col border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="px-4 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Text audio</h1>
          <p className="text-sm text-muted-foreground">
            Find a text, upload its audios, and attach OTR transcripts to each
            audio.
          </p>
        </div>
        <AuthButton />
      </div>
      <div className="border-b border-dashed border-gray-300 dark:border-input" />

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(280px,2fr)_3fr]">
        <section className="rounded-lg border bg-white dark:bg-[#161616] p-4">
          <label className="text-sm font-medium" htmlFor="text-audio-search">
            Search texts
          </label>
          <div className="mt-2 flex items-center rounded-md border px-3">
            <FiSearch className="shrink-0 text-muted-foreground" />
            <Pecha.Input
              id="text-audio-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Enter a text title..."
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="mt-3 max-h-[calc(100vh-230px)] space-y-1 overflow-auto">
            {searchQuery.isFetching ? (
              <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <FiLoader className="animate-spin" /> Searching…
              </p>
            ) : debouncedSearch.length < 2 ? (
              <p className="p-3 text-sm text-muted-foreground">
                Type at least two characters.
              </p>
            ) : searchQuery.isError ? (
              <p className="p-3 text-sm text-red-500">
                {getApiErrorMessage(searchQuery.error)}
              </p>
            ) : searchQuery.data?.length ? (
              searchQuery.data.map((text) => (
                <button
                  key={text.id}
                  type="button"
                  onClick={() => selectText(text)}
                  className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                    selectedText?.id === text.id
                      ? "border-[#A51C21] bg-[#A51C21]/5"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{text.title}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {text.id}
                  </span>
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-muted-foreground">
                No texts found.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border bg-white dark:bg-[#161616] p-5">
          {!selectedText ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
              Select a text to manage its audios.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{selectedText.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedText.id}
                </p>
              </div>

              {audiosQuery.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FiLoader className="animate-spin" /> Loading audios…
                </p>
              ) : audiosQuery.isError ? (
                <p className="text-sm text-red-500">
                  {getApiErrorMessage(audiosQuery.error)}
                </p>
              ) : audios.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Audios ({audios.length}) — select one to manage its OTR
                    files
                  </p>
                  {audios.map((audio) => (
                    <div
                      key={audio.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectAudio(audio.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") selectAudio(audio.id);
                      }}
                      className={`cursor-pointer space-y-2 rounded-lg border p-3 transition-colors ${
                        selectedAudioId === audio.id
                          ? "border-[#A51C21] bg-[#A51C21]/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {editingAudioId === audio.id ? (
                        <div
                          className="flex items-center gap-1"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Pecha.Input
                            autoFocus
                            value={editingName}
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") saveRenameAudio(audio);
                              if (event.key === "Escape") cancelRenameAudio();
                            }}
                            className="h-8"
                          />
                          <Pecha.Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={renameAudioMutation.isPending}
                            onClick={() => saveRenameAudio(audio)}
                          >
                            <FiCheck />
                          </Pecha.Button>
                          <Pecha.Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={renameAudioMutation.isPending}
                            onClick={cancelRenameAudio}
                          >
                            <FiX />
                          </Pecha.Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">
                            {audio.name}
                          </span>
                          <button
                            type="button"
                            aria-label="Rename audio"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={(event) => {
                              event.stopPropagation();
                              startRenameAudio(audio);
                            }}
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      <audio
                        key={audio.audio_url}
                        controls
                        preload="metadata"
                        src={audio.audio_url}
                        className="w-full"
                        onClick={(event) => event.stopPropagation()}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{audio.file_name}</span>
                        <div className="flex items-center gap-3">
                          <span>
                            {audio.duration_ms != null
                              ? formatMs(audio.duration_ms)
                              : "Duration unavailable"}
                          </span>
                          <Pecha.Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={deleteAudioMutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation();
                              setAudioToDelete({
                                textId: selectedText.id,
                                audio,
                              });
                            }}
                          >
                            <FaTrash />
                          </Pecha.Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  This text has no audio yet.
                </p>
              )}

              <div className="space-y-3">
                <Dropzone
                  accept={{
                    "audio/*": [".mp3", ".m4a", ".wav", ".aac", ".ogg"],
                  }}
                  multiple={false}
                  disabled={isUploading}
                  onDrop={(files) => setPendingFile(files[0] ?? null)}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="cursor-pointer rounded-lg border border-dashed p-8 text-center hover:bg-muted/50"
                    >
                      <input {...getInputProps()} />
                      <FiUpload className="mx-auto mb-2 h-6 w-6" />
                      <p className="text-sm font-medium">
                        {pendingFile ? pendingFile.name : "Add an audio file"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        MP3, M4A, WAV, AAC, or OGG; maximum 50 MB. Files are
                        converted to MP3 so they play in every browser.
                      </p>
                    </div>
                  )}
                </Dropzone>

                {isUploading ? (
                  <div aria-label={`Upload progress ${uploadProgress}%`}>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-[#A51C21] transition-[width]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      Uploading {uploadProgress}%
                    </p>
                  </div>
                ) : null}

                {pendingFile ? (
                  <div className="flex gap-2">
                    <Pecha.Button
                      type="button"
                      className="bg-[#A51C21] hover:bg-[#A51C21]/90"
                      disabled={isUploading}
                      onClick={() =>
                        uploadMutation.mutate({
                          text: selectedText,
                          file: pendingFile,
                        })
                      }
                    >
                      {isUploading ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiUpload />
                      )}
                      Upload audio
                    </Pecha.Button>
                    <Pecha.Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                      onClick={() => setPendingFile(null)}
                    >
                      Cancel
                    </Pecha.Button>
                  </div>
                ) : null}
              </div>

              {selectedAudio ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      OTR files — {selectedAudio.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Upload OTR/JSON transcripts for this audio and select one
                      by name.
                    </p>
                  </div>

                  {otrsQuery.isLoading ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FiLoader className="animate-spin" /> Loading OTR files…
                    </p>
                  ) : otrsQuery.isError ? (
                    <p className="text-sm text-red-500">
                      {getApiErrorMessage(otrsQuery.error)}
                    </p>
                  ) : otrs.length ? (
                    <div className="flex flex-wrap gap-2">
                      {otrs.map((otr) => (
                        <div
                          key={otr.id}
                          className={`flex items-center gap-1 rounded-md border pl-3 pr-1 py-1 text-sm ${
                            selectedOtrId === otr.id
                              ? "border-[#A51C21] bg-[#A51C21]/5"
                              : "hover:bg-muted"
                          }`}
                        >
                          <button
                            type="button"
                            className="flex items-center gap-1"
                            onClick={() => setSelectedOtrId(otr.id)}
                          >
                            <FiFileText className="shrink-0" />
                            {otr.name}
                          </button>
                          <Pecha.Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={deleteOtrMutation.isPending}
                            onClick={() =>
                              setOtrToDelete({
                                textId: selectedText.id,
                                audioId: selectedAudioId!,
                                otr,
                              })
                            }
                          >
                            <FaTrash className="h-3 w-3" />
                          </Pecha.Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      This audio has no OTR file yet.
                    </p>
                  )}

                  <Dropzone
                    accept={{
                      "application/json": [".json"],
                      "text/plain": [".otr"],
                    }}
                    multiple={false}
                    disabled={uploadOtrMutation.isPending}
                    onDrop={handleOtrDrop}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div
                        {...getRootProps()}
                        className="cursor-pointer rounded-lg border border-dashed p-5 text-center hover:bg-muted/50"
                      >
                        <input {...getInputProps()} />
                        <FiUpload className="mx-auto mb-1 h-5 w-5" />
                        <p className="text-sm font-medium">
                          {pendingOtr
                            ? `${pendingOtr.name}.json`
                            : "Add an OTR or JSON file"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Must contain valid JSON; stored as JSON.
                        </p>
                      </div>
                    )}
                  </Dropzone>

                  {pendingOtr ? (
                    <div className="space-y-2">
                      <label
                        className="text-xs font-medium"
                        htmlFor="otr-name-input"
                      >
                        OTR name
                      </label>
                      <Pecha.Input
                        id="otr-name-input"
                        value={pendingOtr.name}
                        onChange={(event) =>
                          setPendingOtr({
                            ...pendingOtr,
                            name: event.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <Pecha.Button
                          type="button"
                          className="bg-[#A51C21] hover:bg-[#A51C21]/90"
                          disabled={
                            uploadOtrMutation.isPending ||
                            !pendingOtr.name.trim()
                          }
                          onClick={() =>
                            uploadOtrMutation.mutate({
                              textId: selectedText.id,
                              audioId: selectedAudioId!,
                              otr: {
                                ...pendingOtr,
                                name: pendingOtr.name.trim(),
                              },
                            })
                          }
                        >
                          {uploadOtrMutation.isPending ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiUpload />
                          )}
                          Upload OTR
                        </Pecha.Button>
                        <Pecha.Button
                          type="button"
                          variant="outline"
                          disabled={uploadOtrMutation.isPending}
                          onClick={() => setPendingOtr(null)}
                        >
                          Cancel
                        </Pecha.Button>
                      </div>
                    </div>
                  ) : null}

                  {selectedOtr ? (
                    <div className="space-y-2 rounded-lg border p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {selectedOtr.name}
                        </span>
                        <span>
                          Updated{" "}
                          {new Date(selectedOtr.updated_at).toLocaleString()}
                        </span>
                      </div>
                      {otrContentQuery.isLoading || segmentsQuery.isLoading ? (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FiLoader className="animate-spin" /> Loading sync
                          preview…
                        </p>
                      ) : otrContentQuery.isError ? (
                        <p className="text-sm text-red-500">
                          {getApiErrorMessage(otrContentQuery.error)}
                        </p>
                      ) : segmentsQuery.isError ? (
                        <p className="text-sm text-red-500">
                          {getApiErrorMessage(segmentsQuery.error)}
                        </p>
                      ) : otrContentQuery.data &&
                        segmentsQuery.data &&
                        selectedAudio ? (
                        <OtrSyncPlayer
                          audioUrl={selectedAudio.audio_url}
                          spans={otrContentQuery.data.spans}
                          segments={segmentsQuery.data.segments}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      <Pecha.AlertDialog
        open={Boolean(audioToDelete)}
        onOpenChange={(open) => {
          if (!open) setAudioToDelete(null);
        }}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete this audio?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              “{audioToDelete?.audio.name}” and all of its OTR files will be
              permanently deleted.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel>Cancel</Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteAudioMutation.isPending}
              onClick={() =>
                audioToDelete && deleteAudioMutation.mutate(audioToDelete)
              }
            >
              {deleteAudioMutation.isPending ? "Deleting…" : "Delete"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>

      <Pecha.AlertDialog
        open={Boolean(otrToDelete)}
        onOpenChange={(open) => {
          if (!open) setOtrToDelete(null);
        }}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete this OTR?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              “{otrToDelete?.otr.name}” will be permanently deleted.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel>Cancel</Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteOtrMutation.isPending}
              onClick={() =>
                otrToDelete && deleteOtrMutation.mutate(otrToDelete)
              }
            >
              {deleteOtrMutation.isPending ? "Deleting…" : "Delete"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default TextAudioPage;

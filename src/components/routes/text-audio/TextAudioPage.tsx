import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Dropzone from "react-dropzone";
import { useDebounce } from "use-debounce";
import { FiLoader, FiSearch, FiUpload } from "react-icons/fi";
import { FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Pecha } from "@/components/ui/shadimport";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { formatMs, getAudioDurationMs } from "@/lib/utils";

import {
  deleteTextAudio,
  fetchTextAudio,
  searchTexts,
  type TextSearchResult,
  uploadTextAudio,
} from "./api/textAudioApi";

const TextAudioPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search.trim(), 400);
  const [selectedText, setSelectedText] = useState<TextSearchResult | null>(
    null,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const searchQuery = useQuery({
    queryKey: ["text-audio-search", debouncedSearch],
    queryFn: () => searchTexts(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    retry: false,
  });

  const audioQuery = useQuery({
    queryKey: ["text-audio", selectedText?.id],
    queryFn: () => fetchTextAudio(selectedText!.id),
    enabled: Boolean(selectedText),
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const durationMs = await getAudioDurationMs(file);
      return uploadTextAudio({
        text: selectedText!,
        file,
        durationMs,
        onProgress: setUploadProgress,
      });
    },
    onSuccess: (audio) => {
      queryClient.setQueryData(["text-audio", selectedText?.id], audio);
      setPendingFile(null);
      setUploadProgress(0);
      toast.success("Text audio saved");
    },
    onError: (error) => {
      setUploadProgress(0);
      toast.error("Failed to upload audio", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTextAudio(selectedText!.id),
    onSuccess: () => {
      queryClient.setQueryData(["text-audio", selectedText?.id], null);
      setIsDeleteOpen(false);
      toast.success("Text audio deleted");
    },
    onError: (error) =>
      toast.error("Failed to delete audio", {
        description: getApiErrorMessage(error),
      }),
  });

  const selectText = (text: TextSearchResult) => {
    setSelectedText(text);
    setPendingFile(null);
    setUploadProgress(0);
  };

  const isUploading = uploadMutation.isPending;
  const audio = audioQuery.data;

  return (
    <div className="flex flex-col border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="px-4 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Text audio</h1>
          <p className="text-sm text-muted-foreground">
            Find a text, then upload or replace its audio.
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
              Select a text to manage its audio.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{selectedText.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedText.id}
                </p>
              </div>

              {audioQuery.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FiLoader className="animate-spin" /> Loading audio…
                </p>
              ) : audio ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <audio
                    key={audio.audio_url}
                    controls
                    preload="metadata"
                    src={audio.audio_url}
                    className="w-full"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{audio.file_name}</span>
                    <span>
                      {audio.duration_ms != null
                        ? formatMs(audio.duration_ms)
                        : "Duration unavailable"}
                    </span>
                  </div>
                  <Pecha.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading || deleteMutation.isPending}
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <FaTrash /> Delete audio
                  </Pecha.Button>
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
                        {pendingFile
                          ? pendingFile.name
                          : audio
                            ? "Choose replacement audio"
                            : "Choose an audio file"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        MP3, M4A, WAV, AAC, or OGG; maximum 50 MB
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
                      onClick={() => uploadMutation.mutate(pendingFile)}
                    >
                      {isUploading ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiUpload />
                      )}
                      {audio ? "Replace audio" : "Upload audio"}
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
            </div>
          )}
        </section>
      </div>

      <Pecha.AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete text audio?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              The audio file linked to “{selectedText?.title}” will be
              permanently deleted.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel>Cancel</Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default TextAudioPage;

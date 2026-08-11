import axiosInstance from "@/config/axios-config";

export interface TextSearchResult {
  id: string;
  title: string;
}

export interface TextAudio {
  text_id: string;
  text_title: string;
  audio_key: string;
  audio_url: string;
  file_name: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  duration_ms: number | null;
  updated_at: string;
}

export const searchTexts = async (title: string) => {
  const { data } = await axiosInstance.get<TextSearchResult[]>(
    "/api/v1/texts/title-search",
    { params: { title, limit: 20, offset: 0 } },
  );
  return data;
};

export const fetchTextAudio = async (textId: string) => {
  const { data } = await axiosInstance.get<TextAudio | null>(
    `/api/v1/cms/texts/${encodeURIComponent(textId)}/audio`,
  );
  return data;
};

export const uploadTextAudio = async ({
  text,
  file,
  durationMs,
  onProgress,
}: {
  text: TextSearchResult;
  file: File;
  durationMs?: number;
  onProgress: (progress: number) => void;
}) => {
  const body = new FormData();
  body.append("file", file);
  if (durationMs != null) body.append("duration_ms", String(durationMs));

  const { data } = await axiosInstance.post<TextAudio>(
    `/api/v1/cms/texts/${encodeURIComponent(text.id)}/audio`,
    body,
    {
      onUploadProgress: ({ loaded, total }) => {
        if (total) onProgress(Math.round((loaded * 100) / total));
      },
    },
  );
  return data;
};

export const deleteTextAudio = async (textId: string) => {
  await axiosInstance.delete(
    `/api/v1/cms/texts/${encodeURIComponent(textId)}/audio`,
  );
};

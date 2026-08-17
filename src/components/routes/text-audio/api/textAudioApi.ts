import axiosInstance from "@/config/axios-config";

export interface TextSearchResult {
  id: string;
  title: string;
}

export interface TextAudio {
  id: string;
  text_id: string;
  text_title: string;
  audio_key: string;
  audio_url: string;
  name: string;
  file_name: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  duration_ms: number | null;
  updated_at: string;
}

export interface TextAudioOtr {
  id: string;
  audio_id: string;
  name: string;
  file_name: string;
  updated_at: string;
}

export type OtrContent = Record<string, unknown>;

export const INVALID_OTR_MESSAGE = "Please upload a valid OTR/JSON file.";

export class InvalidOtrFileError extends Error {
  constructor() {
    super(INVALID_OTR_MESSAGE);
    this.name = "InvalidOtrFileError";
  }
}

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

/**
 * OTR files are JSON documents; reject anything that does not parse
 * to a JSON object so only valid JSON is ever stored.
 */
export const parseOtrFile = async (file: File): Promise<OtrContent> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFileAsText(file));
  } catch {
    throw new InvalidOtrFileError();
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new InvalidOtrFileError();
  }
  return parsed as OtrContent;
};

export const otrNameFromFile = (file: File) =>
  file.name.replace(/\.[^.]+$/, "").trim() || file.name;

const audioPath = (textId: string, audioId?: string) => {
  const base = `/api/v1/cms/texts/${encodeURIComponent(textId)}/audios`;
  return audioId ? `${base}/${encodeURIComponent(audioId)}` : base;
};

export const searchTexts = async (title: string) => {
  const { data } = await axiosInstance.get<TextSearchResult[]>(
    "/api/v1/texts/title-search",
    { params: { title, limit: 20, offset: 0 } },
  );
  return data;
};

export const fetchTextAudios = async (textId: string) => {
  const { data } = await axiosInstance.get<TextAudio[]>(audioPath(textId));
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
    audioPath(text.id),
    body,
    {
      onUploadProgress: ({ loaded, total }) => {
        if (total) onProgress(Math.round((loaded * 100) / total));
      },
    },
  );
  return data;
};

export const deleteTextAudio = async (textId: string, audioId: string) => {
  await axiosInstance.delete(audioPath(textId, audioId));
};

export const updateTextAudioName = async (
  textId: string,
  audioId: string,
  name: string,
) => {
  const { data } = await axiosInstance.patch<TextAudio>(
    audioPath(textId, audioId),
    { name },
  );
  return data;
};

export const fetchAudioOtrs = async (textId: string, audioId: string) => {
  const { data } = await axiosInstance.get<TextAudioOtr[]>(
    `${audioPath(textId, audioId)}/otr`,
  );
  return data;
};

export const uploadAudioOtr = async ({
  textId,
  audioId,
  name,
  content,
}: {
  textId: string;
  audioId: string;
  name: string;
  content: OtrContent;
}) => {
  const body = new FormData();
  body.append(
    "file",
    new File([JSON.stringify(content)], `${name}.json`, {
      type: "application/json",
    }),
  );
  body.append("name", name);

  const { data } = await axiosInstance.post<TextAudioOtr>(
    `${audioPath(textId, audioId)}/otr`,
    body,
  );
  return data;
};

export const fetchOtrContent = async (
  textId: string,
  audioId: string,
  otrId: string,
) => {
  const { data } = await axiosInstance.get<OtrContent>(
    `${audioPath(textId, audioId)}/otr/${encodeURIComponent(otrId)}`,
  );
  return data;
};

export const deleteAudioOtr = async (
  textId: string,
  audioId: string,
  otrId: string,
) => {
  await axiosInstance.delete(
    `${audioPath(textId, audioId)}/otr/${encodeURIComponent(otrId)}`,
  );
};

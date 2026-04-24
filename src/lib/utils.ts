import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import sha256 from "crypto-js/sha256";
import { IoMdMail } from "react-icons/io";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { RANGE_REGEX, SINGLE_REGEX } from "./constant";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createPasswordHash(email: string, password: string): string {
  const envSalt = import.meta.env.VITE_ENV_SALT || "";
  const combinedString = email + envSalt + password;
  return sha256(combinedString).toString();
}

export const getYouTubeVideoId = (url: string) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] || "";
};

export const convertDuration = (duration: string) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (match?.[1] || "0H").slice(0, -1);
  const minutes = (match?.[2] || "0M").slice(0, -1);
  const seconds = (match?.[3] || "0S").slice(0, -1);

  return `${hours}:${minutes}:${seconds}`;
};

export const getYouTubeDuration = async (url: string): Promise<string> => {
  try {
    // Try to get video ID from both regular YouTube and Shorts URLs
    const videoId = getYouTubeShortsId(url) || getYouTubeVideoId(url);

    if (!videoId) {
      throw new Error("Invalid YouTube URL - could not extract video ID");
    }

    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || "";
    if (!apiKey) {
      throw new Error("YouTube API key is not configured");
    }
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

    const response = await fetch(youtubeUrl);

    if (!response.ok) {
      throw new Error(
        `YouTube API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`YouTube API error: ${data.error.message}`);
    }

    const duration = data.items?.[0]?.contentDetails?.duration;

    if (!duration) {
      throw new Error("Duration not found in YouTube API response");
    }

    return convertDuration(duration);
  } catch (error) {
    console.error("Error fetching YouTube duration:", error);
    throw error; // Re-throw to let caller handle it
  }
};

export const getYouTubeShortsId = (url: string) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  );
  return match?.[1] || "";
};

export const extractSpotifyId = (url: string) => {
  const match = url.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
  return match ? { type: match[1], id: match[2] } : null;
};

export const getIcon = (platform: string) => {
  const iconMap: Record<string, React.ComponentType> = {
    facebook: FaFacebook,
    "x.com": FaTwitter,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    email: IoMdMail,
    instagram: FaInstagram,
    tiktok: FaTiktok,
  };
  const IconComponent = iconMap[platform];
  return IconComponent;
};

export const reorderArray = <T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string,
): T[] | null => {
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const overIndex = items.findIndex((item) => item.id === overId);

  if (activeIndex === -1 || overIndex === -1) return null;

  const newItems = [...items];
  const [movedItem] = newItems.splice(activeIndex, 1);
  newItems.splice(overIndex, 0, movedItem);

  return newItems;
};

const escapeRegex = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

export const highlightSearchMatch = (
  text: string,
  searchTerm: string,
  highlightClass = "highlighted-text",
) => {
  if (!text || !searchTerm || searchTerm.trim() === "") {
    return text;
  }

  const escaped = escapeRegex(searchTerm);
  const isLatinQuery = /^[\p{Script=Latin}\d\s'''.:-]+$/u.test(searchTerm);

  if (isLatinQuery) {
    const wordRegex = new RegExp(
      String.raw`(^|\P{L})(${escaped})(?=\P{L}|$)`,
      "giu",
    );
    return text.replace(wordRegex, (_, separator, match) => {
      return `${separator}<span class="${highlightClass}">${match}</span>`;
    });
  }

  const subRegex = new RegExp(escaped, "giu");
  return text.replace(
    subRegex,
    (match) => `<span class="${highlightClass}">${match}</span>`,
  );
};

export const getLastSegmentId = (sections: any[]): string | null => {
  if (!sections?.length) {
    return null;
  }
  const lastSection = sections.at(-1);
  return (
    getLastSegmentId(lastSection.sections) ??
    lastSection.segments?.at(-1)?.segment_id ??
    null
  );
};

export const flattenSegments = (sections: any[]): any[] => {
  if (!sections?.length) return [];
  const result: any[] = [];
  for (const section of sections) {
    if (section.segments?.length) {
      result.push(...section.segments);
    }
    if (section.sections?.length) {
      result.push(...flattenSegments(section.sections));
    }
  }
  return result;
};

export const parseSelection = (
  input: string,
  max: number,
): Set<number> | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const rangeMatch = RANGE_REGEX.exec(trimmed);
  if (rangeMatch) {
    const start = Number.parseInt(rangeMatch[1], 10);
    const end = Number.parseInt(rangeMatch[2], 10);
    if (start < 1 || end < start || start > max) return null;
    const selected = new Set<number>();
    for (let i = start; i <= Math.min(end, max); i++) selected.add(i);
    return selected;
  }

  const singleMatch = SINGLE_REGEX.exec(trimmed);
  if (singleMatch) {
    const num = Number.parseInt(singleMatch[1], 10);
    if (num < 1 || num > max) return null;
    return new Set([num]);
  }

  return null;
};

export const toBackendISO = (d: Date): string =>
  format(d, "yyyy-MM-dd") + "T00:00:00Z";

export const fromBackendISO = (iso: string): Date => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const isPastDate = (d: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

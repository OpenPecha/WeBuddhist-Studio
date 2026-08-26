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

export const getFirstSegmentId = (sections: any[]): string | null => {
  if (!sections?.length) {
    return null;
  }
  const firstSection = sections[0];
  return (
    firstSection.segments?.[0]?.segment_id ??
    getFirstSegmentId(firstSection.sections) ??
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

export const parseRangeBounds = (
  input: string,
): { start: number; end: number } | null => {
  const trimmed = input.trim();
  if (!trimmed || trimmed.endsWith("-")) return null;

  const rangeMatch = RANGE_REGEX.exec(trimmed);
  if (rangeMatch) {
    const start = Number.parseInt(rangeMatch[1], 10);
    const end = Number.parseInt(rangeMatch[2], 10);
    if (start < 1 || end < start) return null;
    return { start, end };
  }

  const singleMatch = SINGLE_REGEX.exec(trimmed);
  if (singleMatch) {
    const num = Number.parseInt(singleMatch[1], 10);
    if (num < 1) return null;
    return { start: num, end: num };
  }

  return null;
};

export const parseSelection = (
  input: string,
  max: number,
): Set<number> | null => {
  const bounds = parseRangeBounds(input);
  if (!bounds) return null;
  if (bounds.start > max) return null;

  const selected = new Set<number>();
  for (let i = bounds.start; i <= Math.min(bounds.end, max); i++) {
    selected.add(i);
  }
  return selected;
};

/** Parse a plain "yyyy-MM-dd" calendar-date string into a local Date (midnight, local time). */
export const dateOnlyToDate = (dateOnly: string): Date => {
  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Format a Date's calendar components (ignoring time) as "yyyy-MM-dd". */
export const dateToDateOnly = (d: Date): string => format(d, "yyyy-MM-dd");

/**
 * Legacy UTC-midnight encoding used by features (plans, accumulators) that
 * only ever needed a calendar date with no time-of-day or timezone concept.
 * Kept separate from the timezone-aware `toBackendISO`/`fromBackendISO`
 * below, which events now use for real UTC instants.
 */
export const toBackendMidnightISO = (d: Date): string =>
  format(d, "yyyy-MM-dd") + "T00:00:00Z";

export const fromBackendMidnightISO = (iso: string): Date => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Read the wall-clock date/time that a UTC instant corresponds to in `timeZone`. */
const getZonedParts = (date: Date, timeZone: string): ZonedParts => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
};

/**
 * Offset (in ms) of `timeZone` from UTC at the instant `date`, i.e. the value
 * to ADD to a UTC timestamp to get that zone's wall-clock time as a UTC-labelled
 * timestamp. Positive for zones ahead of UTC (e.g. Asia/Kolkata => +5.5h).
 * Resolved via Intl rather than a fixed table so it's correct across DST.
 */
export const getTimeZoneOffsetMs = (date: Date, timeZone: string): number => {
  const p = getZonedParts(date, timeZone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - date.getTime();
};

/**
 * Combine a calendar date + "HH:mm" wall-clock time + IANA timezone into the
 * UTC instant that wall-clock time represents, returned as an ISO string.
 * Uses a two-pass offset resolution (guess, then re-check at the resolved
 * instant) so DST transitions resolve correctly.
 */
export const toBackendISO = (
  date: Date,
  hhmm: string,
  timeZone: string,
): string => {
  const [hour, minute] = hhmm.split(":").map(Number);
  const y = date.getFullYear();
  const mo = date.getMonth();
  const d = date.getDate();

  const guess = Date.UTC(y, mo, d, hour, minute, 0);
  const offset1 = getTimeZoneOffsetMs(new Date(guess), timeZone);
  let utc = guess - offset1;
  const offset2 = getTimeZoneOffsetMs(new Date(utc), timeZone);
  if (offset2 !== offset1) {
    utc = guess - offset2;
  }
  return new Date(utc).toISOString();
};

/**
 * Split a UTC ISO instant into the local calendar date and "HH:mm" wall-clock
 * time it corresponds to in `timeZone`.
 */
export const fromBackendISO = (
  iso: string,
  timeZone: string,
): { date: Date; hhmm: string } => {
  const instant = new Date(iso);
  const p = getZonedParts(instant, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: new Date(p.year, p.month - 1, p.day),
    hhmm: `${pad(p.hour)}:${pad(p.minute)}`,
  };
};

export const isPastDate = (d: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

/** Format milliseconds as m:ss for audio timestamps */
export const formatMs = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

/** Read duration from a local audio file before upload */
export const getAudioDurationMs = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const url = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration * 1000));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read audio duration"));
    };
    audio.src = url;
  });

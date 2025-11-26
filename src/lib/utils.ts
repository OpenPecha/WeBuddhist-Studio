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

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import sha256 from "crypto-js/sha256";
import { IoMdMail } from "react-icons/io";
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";

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
  const iconMap: any = {
    facebook: FaFacebook,
    "x.com": FaTwitter,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    email: IoMdMail,
  };
  const IconComponent = iconMap[platform];
  return IconComponent;
};

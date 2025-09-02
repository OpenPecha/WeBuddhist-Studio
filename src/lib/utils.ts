import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import sha256 from "crypto-js/sha256";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createPasswordHash(email: string, password: string): string {
  const envSalt = import.meta.env.VITE_ENV_SALT || "";
  const combinedString = email + envSalt + password;
  return sha256(combinedString).toString();
}

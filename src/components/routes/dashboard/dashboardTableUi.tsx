import { FaStar } from "react-icons/fa";
import type { DashboardLanguageCode } from "./dashboardTable";

export function FeaturedStar({
  featured,
  disabled,
}: {
  featured: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <FaStar
        className="h-3.5 w-3.5 fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
        aria-hidden
      />
    );
  }
  if (featured) {
    return (
      <FaStar
        className="h-3.5 w-3.5 fill-black text-black dark:fill-white dark:text-white"
        aria-hidden
      />
    );
  }
  return (
    <FaStar
      className="h-3.5 w-3.5 fill-gray-400 text-gray-400 dark:fill-gray-500 dark:text-gray-500"
      aria-hidden
    />
  );
}

export function statusChip(status: string) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-[#4BBE51] dark:bg-green-900/40 dark:text-green-200">
          Published
        </span>
      );
    case "UNPUBLISHED":
      return (
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200">
          Unpublished
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:border-gray-600 dark:bg-transparent dark:text-gray-100">
          Archived
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-[#E0EDFE] px-2.5 py-0.5 text-xs font-medium text-[#020C1D] dark:bg-blue-950/50 dark:text-white">
          Draft
        </span>
      );
  }
}

export function languageChip(code: DashboardLanguageCode) {
  switch (code) {
    case "BO":
      return (
        <span className="rounded-full bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-medium text-gray-900 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700">
          བོད་སྐད།
        </span>
      );
    case "ZH":
      return (
        <span className="rounded-full bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-medium text-gray-900 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700">
          中国人
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-medium text-gray-900 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700">
          English
        </span>
      );
  }
}

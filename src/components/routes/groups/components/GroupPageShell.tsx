import type { ReactNode } from "react";
import { Button } from "@/components/ui/atoms/button";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import GroupTitleWithAvatar from "./GroupTitleWithAvatar";

const shellClassName =
  "flex flex-col border h-[calc(100vh-40px)] overflow-hidden bg-[#F3F3F3] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic";

type GroupPageShellProps = {
  backLabel: string;
  onBack: () => void;
  title: string;
  avatarUrl?: string | null;
  subtitle?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
};

export const GroupPageShell = ({
  backLabel,
  onBack,
  title,
  avatarUrl,
  subtitle,
  headerActions,
  children,
}: GroupPageShellProps) => (
  <div className={shellClassName}>
    <div className="shrink-0 mb-4 px-4 sm:px-8 pt-10 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          onClick={onBack}
        >
          {backLabel}
        </Button>
        <GroupTitleWithAvatar
          title={title}
          avatarUrl={avatarUrl}
          size="md"
          className="border-b border-dashed border-black dark:border-white pb-2"
          titleClassName="text-xl font-bold"
        />
        {subtitle}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {headerActions}
        <AuthButton />
      </div>
    </div>
    <div className="border-b w-full border-dashed border-gray-300 dark:border-input shrink-0" />
    <div className="flex-1 min-h-0 overflow-auto">{children}</div>
  </div>
);

export const GroupListShell = ({
  toolbar,
  children,
  footer,
}: {
  toolbar: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) => (
  <div className={`${shellClassName} overflow-auto`}>
    {toolbar}
    <div className="border-b w-full border-dashed border-gray-300 dark:border-input" />
    {children}
    {footer}
  </div>
);

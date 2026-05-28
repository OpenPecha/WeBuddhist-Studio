import type { ReactNode } from "react";
import { Button } from "@/components/ui/atoms/button";

type GroupSectionHeaderProps = {
  title: string;
  action?: ReactNode;
};

export const GroupSectionHeader = ({ title, action }: GroupSectionHeaderProps) => (
  <div className="flex items-center justify-between gap-3 border-b border-dashed pb-2">
    <h2 className="text-base font-bold">{title}</h2>
    {action}
  </div>
);

type GroupEditableSectionProps = {
  title: string;
  onSave: () => void;
  isSaving: boolean;
  saveLabel: string;
  savingLabel: string;
  children: ReactNode;
};

export const GroupEditableSection = ({
  title,
  onSave,
  isSaving,
  saveLabel,
  savingLabel,
  children,
}: GroupEditableSectionProps) => (
  <section className="space-y-4">
    <GroupSectionHeader
      title={title}
      action={
        <Button type="button" size="sm" disabled={isSaving} onClick={onSave}>
          {isSaving ? savingLabel : saveLabel}
        </Button>
      }
    />
    {children}
  </section>
);

export const GroupDetailCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-lg border bg-white dark:bg-[#1e1e1e] p-5 space-y-3">
    <h2 className="text-sm font-bold border-b border-dashed pb-2">{title}</h2>
    {children}
  </section>
);

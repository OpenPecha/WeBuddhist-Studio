import { Button } from "@/components/ui/atoms/button";
import { cn } from "@/lib/utils";
import {
  LuBold,
  LuHeading2,
  LuItalic,
  LuLink,
  LuList,
  LuListOrdered,
} from "react-icons/lu";

type MarkdownToolbarProps = {
  disabled?: boolean;
  onBold: () => void;
  onItalic: () => void;
  onHeading: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onLink: () => void;
  className?: string;
};

const MarkdownToolbar = ({
  disabled,
  onBold,
  onItalic,
  onHeading,
  onBulletList,
  onNumberedList,
  onLink,
  className,
}: MarkdownToolbarProps) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-1 border-b border-input px-2 py-1.5",
      className,
    )}
  >
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      disabled={disabled}
      onClick={onBold}
      aria-label="Bold"
    >
      <LuBold />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      disabled={disabled}
      onClick={onItalic}
      aria-label="Italic"
    >
      <LuItalic />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      disabled={disabled}
      onClick={onHeading}
      aria-label="Heading"
    >
      <LuHeading2 />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      disabled={disabled}
      onClick={onBulletList}
      aria-label="Bullet list"
    >
      <LuList />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      disabled={disabled}
      onClick={onNumberedList}
      aria-label="Numbered list"
    >
      <LuListOrdered />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      disabled={disabled}
      onClick={onLink}
      aria-label="Insert link"
    >
      <LuLink />
    </Button>
  </div>
);

export { MarkdownToolbar };

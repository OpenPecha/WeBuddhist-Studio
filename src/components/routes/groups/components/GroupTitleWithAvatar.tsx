import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/atoms/avatar";
import { cn } from "@/lib/utils";

type GroupTitleWithAvatarProps = {
  title: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
  titleClassName?: string;
};

const sizeClasses = {
  sm: "size-9",
  md: "size-11",
};

const GroupTitleWithAvatar = ({
  title,
  avatarUrl,
  size = "md",
  className,
  titleClassName,
}: GroupTitleWithAvatarProps) => {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <Avatar className={cn(sizeClasses[size], "shrink-0")}>
        <AvatarImage src={avatarUrl ?? undefined} />
        <AvatarFallback>{title.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className={cn("truncate", titleClassName)}>{title}</span>
    </div>
  );
};

export default GroupTitleWithAvatar;

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
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className={cn(
            sizeClasses[size],
            "rounded-full object-cover border shrink-0",
          )}
        />
      ) : null}
      <span className={cn("truncate", titleClassName)}>{title}</span>
    </div>
  );
};

export default GroupTitleWithAvatar;

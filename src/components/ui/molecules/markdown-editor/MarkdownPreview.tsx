import ReactMarkdown from "react-markdown";
import { isDrawerLink, parseDrawerLink } from "@/lib/markdownLinks";
import { cn } from "@/lib/utils";

type MarkdownPreviewProps = {
  value: string;
  className?: string;
  emptyMessage?: string;
};

const MarkdownPreview = ({
  value,
  className,
  emptyMessage = "Nothing to preview",
}: MarkdownPreviewProps) => (
  <div
    className={cn(
      "min-h-[100px] w-full px-3 py-2 text-base",
      "prose prose-sm dark:prose-invert max-w-none",
      className,
    )}
  >
    {value ? (
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href && isDrawerLink(href)) {
              const target = parseDrawerLink(href);
              const badge =
                target?.type === "group"
                  ? "Group"
                  : target?.type === "segment"
                    ? "Text"
                    : "Link";
              return (
                <span className="inline-flex items-center gap-1 not-prose">
                  <a
                    href={href}
                    className="text-[#801A1E] underline underline-offset-2"
                  >
                    {children}
                  </a>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {badge}
                  </span>
                </span>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#801A1E] underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {value}
      </ReactMarkdown>
    ) : (
      <p className="text-muted-foreground italic">{emptyMessage}</p>
    )}
  </div>
);

export { MarkdownPreview };

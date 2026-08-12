import pechaIcon from "../../../assets/icon/pecha_icon.png";
import { cn } from "@/lib/utils";

interface ContainerLayoutProps {
  children: React.ReactNode;
  title?: string;
  /** "staff" tints the backdrop and adds a small badge for the admin login. */
  accent?: "default" | "staff";
}

const ContainerLayout = ({
  children,
  title,
  accent = "default",
}: ContainerLayoutProps) => {
  const isStaff = accent === "staff";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F5F5F5] px-4 py-10 dark:bg-[#0f0f10] sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-dots animate-drift absolute inset-0 opacity-60" />
        <div
          className={cn(
            "animate-blob absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-40 blur-3xl dark:opacity-25",
            isStaff ? "bg-indigo-400" : "bg-amber-300",
          )}
        />
        <div
          className={cn(
            "animate-blob animation-delay-2000 absolute top-1/3 -right-20 h-96 w-96 rounded-full opacity-30 blur-3xl dark:opacity-20",
            isStaff ? "bg-violet-500" : "bg-rose-300",
          )}
        />
        <div
          className={cn(
            "animate-blob animation-delay-4000 absolute -bottom-24 left-1/4 h-72 w-72 rounded-full opacity-30 blur-3xl dark:opacity-20",
            isStaff ? "bg-sky-400" : "bg-orange-300",
          )}
        />
      </div>

      <div
        className={cn(
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 relative z-10 w-full max-w-[440px] rounded-2xl border p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl duration-700 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]",
          "border-black/5 bg-white/75 dark:border-white/10 dark:bg-[#1b1b1b]/70",
        )}
      >
        <div className="mb-2 flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-inner transition-transform duration-500 hover:rotate-[8deg]",
              isStaff
                ? "from-indigo-200 to-violet-300 dark:from-indigo-500/30 dark:to-violet-500/20"
                : "from-amber-200 to-orange-300 dark:from-amber-500/30 dark:to-orange-500/20",
            )}
          >
            <img
              src={pechaIcon}
              alt="Pecha Studio Logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold font-inter text-sm">
              Webuddhist Studio
            </h1>
            <p className="text-left font-inter text-xs text-muted-foreground">
              Learn, live and share Buddhist wisdom daily
            </p>
          </div>
          {isStaff && (
            <span className="ml-auto shrink-0 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-300">
              Staff
            </span>
          )}
        </div>
        <p className="text-lg font-bold">Welcome to Webuddhist Studio</p>
        {title && (
          <div className="relative z-10 mb-6 w-full text-left text-sm text-[#919191]">
            {title}
          </div>
        )}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </div>
  );
};

export default ContainerLayout;

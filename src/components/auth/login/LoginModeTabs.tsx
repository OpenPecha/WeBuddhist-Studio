import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/paths";
import type { LoginVariant } from "@/lib/platformAccess";

interface LoginModeTabsProps {
  variant: LoginVariant;
}

const TABS: { variant: LoginVariant; label: string; to: string }[] = [
  { variant: "user", label: "Sign in", to: ROUTES.login },
  { variant: "admin", label: "Staff sign in", to: ROUTES.adminLogin },
];

/** Segmented switcher between the regular and staff/reviewer login pages. */
const LoginModeTabs = ({ variant }: LoginModeTabsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Sign-in type"
      className="mb-6 flex w-full gap-1 rounded-full bg-black/5 p-1 dark:bg-white/5"
    >
      {TABS.map((tab) => {
        const isActive = tab.variant === variant;
        return (
          <Link
            key={tab.variant}
            to={tab.to}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex-1 rounded-full py-2 text-center text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-white text-foreground shadow-sm dark:bg-[#2a2a2c]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default LoginModeTabs;

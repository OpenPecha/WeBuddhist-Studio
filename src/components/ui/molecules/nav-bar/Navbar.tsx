import pechaIcon from "../../../../assets/icon/pecha_icon.png";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "../mode-toggle/modetoggle";
// import { IoAnalytics } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { IoPricetags, IoPeople } from "react-icons/io5";
import { ROUTES } from "@/routes/paths";
import { LanguageToggle } from "../language-toggle/languageToggle";
import AuthLogout from "../auth-logout/AuthLogout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../atoms/tooltip";
import AuthAvatar from "@/components/ui/molecules/auth-avatar/AuthAvatar";
import NotificationBell from "@/components/ui/molecules/notification-bell/NotificationBell";
import VerseOfDayButton from "@/components/routes/verse-of-day/VerseOfDayButton";
import { useUserInfo } from "@/hooks/useUserInfo";
import { canAccessAdminAuthors } from "@/lib/platformAccess";
import { MdAdminPanelSettings } from "react-icons/md";
import { MdPublicOff } from "react-icons/md";

const navItems = [
  {
    icon: <MdDashboard className="w-4 h-4" />,
    label: "studio.nav.dashboard",
    path: ROUTES.dashboard,
    tooltip: "Go to dashboard",
  },
  {
    icon: <IoPricetags className="w-4 h-4" />,
    label: "Tags",
    path: ROUTES.tags,
    tooltip: "Manage tags",
  },
  {
    icon: <IoPeople className="w-4 h-4" />,
    label: "Groups",
    path: ROUTES.groups,
    tooltip: "Manage author groups",
  },
  // {
  //   icon: <IoAnalytics className="w-4 h-4" />,
  //   label: "studio.nav.analytics",
  //   path: "/analytics",
  // },
];
const tooltipItems = [
  {
    id: "avatar",
    component: (
      <div className="block md:hidden">
        <AuthAvatar />
      </div>
    ),
    label: "View Profile",
  },
  {
    id: "theme",
    component: <ModeToggle />,
    label: "Change theme",
  },
  {
    id: "language",
    component: <LanguageToggle />,
    label: "Change language",
  },
  {
    id: "logout",
    component: <AuthLogout />,
    label: "Logout",
  },
];

const Navbar = () => {
  const location = useLocation();
  const { data: userInfo } = useUserInfo();
  const showAdminAuthors = canAccessAdminAuthors(userInfo?.platform_role);

  const allNavItems = [
    ...navItems,
    ...(showAdminAuthors
      ? [
          {
            icon: <MdAdminPanelSettings className="w-4 h-4" />,
            label: "Authors",
            path: ROUTES.adminAuthors,
            tooltip: "Author administration",
          },
          {
            icon: <MdPublicOff className="w-4 h-4" />,
            label: "China",
            path: ROUTES.adminChinaRestrictions,
            tooltip: "China content restrictions",
          },
        ]
      : []),
  ];

  return (
    <TooltipProvider>
      <div className="font-dynamic p-2 flex flex-col justify-between items-center">
        <div className="flex flex-col space-y-10 items-center">
          <Link
            to="/dashboard"
            className="flex mt-6  flex-col w-full items-center gap-2 group cursor-pointer"
          >
            <img
              src={pechaIcon}
              alt="Pecha Studio Logo"
              className="w-10 group-hover:rotate-[180deg] transition-all duration-800 h-10"
            />
          </Link>
          <div className="flex flex-col space-y-4 items-center w-full">
            {allNavItems.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={` border p-2 rounded-md dark:hover:text-white hover:text-black transition-all duration-300 hover:cursor-pointer ${
                      location.pathname === item.path ||
                      (item.path === ROUTES.dashboard &&
                        location.pathname === "/") ||
                      (item.path === ROUTES.groups &&
                        location.pathname.startsWith("/groups")) ||
                      (item.path === ROUTES.adminAuthors &&
                        location.pathname.startsWith(ROUTES.adminAuthors)) ||
                      (item.path === ROUTES.adminChinaRestrictions &&
                        location.pathname.startsWith(
                          ROUTES.adminChinaRestrictions,
                        ))
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {item.icon}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            <NotificationBell />
            <VerseOfDayButton />
          </div>
        </div>
        <div className="flex flex-col items-center h-44 space-y-2 pb-2">
          {tooltipItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div>{item.component}</div>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Navbar;

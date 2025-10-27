import pechaIcon from "../../../../assets/icon/pecha_icon.png";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "../mode-toggle/modetoggle";
import { IoAnalytics } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { LanguageToggle } from "../language-toggle/languageToggle";
import { useTranslate } from "@tolgee/react";
import { Pecha } from "@/components/ui/shadimport";

import { IoMdMenu } from "react-icons/io";
const navItems = [
  {
    icon: <MdDashboard className="w-4 h-4" />,
    label: "studio.nav.dashboard",
    path: "/dashboard",
  },
  {
    icon: <IoAnalytics className="w-4 h-4" />,
    label: "studio.nav.analytics",
    path: "/analytics",
  },
];
const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslate();
  return (
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
        <div className="hidden md:flex flex-col space-y-4 items-center w-full">
          {navItems.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={` border p-2 rounded-md dark:hover:text-white hover:text-black transition-all duration-300 hover:cursor-pointer ${location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/") ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex  flex-col items-center space-y-2">
        <ModeToggle />
        <LanguageToggle />
        <Pecha.Sheet>
          <Pecha.SheetTrigger className="md:hidden p-2">
            <IoMdMenu className="h-5 w-5" />
          </Pecha.SheetTrigger>
          <Pecha.SheetContent side="top" className="h-full">
            <div className="space-y-4 pt-8 border h-screen flex items-center justify-center flex-col">
              {navItems.map((item, index) => (
                <Pecha.SheetClose asChild key={index}>
                  <Link
                    to={item.path}
                    className={`block py-3 text-2xl hover:text-zinc-500 dark:hover:text-zinc-400 font-instrument text-center`}
                  >
                    {t(item.label)}
                  </Link>
                </Pecha.SheetClose>
              ))}
            </div>
          </Pecha.SheetContent>
        </Pecha.Sheet>
      </div>
    </div>
  );
};

export default Navbar;

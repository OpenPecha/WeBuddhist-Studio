import pechaIcon from "../../../../assets/icon/pecha_icon.png";
import { Link, useLocation } from "react-router-dom";
import AuthButton from "../auth-button/AuthButton";
import { ModeToggle } from "../mode-toggle/modetoggle";
import { SITE_NAME } from "@/lib/constant";
import { LanguageToggle } from "../language-toggle/languageToggle";
import { useTranslate } from "@tolgee/react";
import { Pecha } from "@/components/ui/shadimport";

import { IoMdMenu } from "react-icons/io";
const navItems = [
  {
    label: "studio.nav.dashboard",
    path: "/dashboard",
  },
  {
    label: "studio.nav.analytics",
    path: "/analytics",
  },
];
const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslate();
  return (
    <div className="font-dynamic p-2 flex justify-between items-center">
      <div className="flex items-center space-x-10">
        <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer">
          <img
            src={pechaIcon}
            alt="Pecha Studio Logo"
            className="w-10 group-hover:rotate-[360deg] transition-all duration-800 h-10"
          />
          <h1 className="font-semibold text-sm font-inter">{SITE_NAME}</h1>
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`text-sm hover:cursor-pointer ${location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/") ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              {t(item.label)}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <AuthButton />
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

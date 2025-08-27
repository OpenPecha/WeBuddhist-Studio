import pechaIcon from "../../../../assets/icon/pecha_icon.png";
import { Link, useLocation } from "react-router-dom";
import AuthButton from "../auth-button/AuthButton";
import { ModeToggle } from "../mode-toggle/modetoggle";
import { SITE_NAME } from "@/lib/constant";
import { LanguageToggle } from "../language-toggle/languageToggle";
import { useTranslate } from "@tolgee/react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "../../atoms/sheet";
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
        <div className="flex items-center gap-2">
          <img src={pechaIcon} alt="Pecha Studio Logo" className="w-10 h-10" />
          <h1 className="font-semibold text-sm font-inter">{SITE_NAME}</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`text-sm hover:cursor-pointer ${location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/") ? "text-zinc-900 font-bold dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              {t(item.label)}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Sheet>
          <SheetTrigger className="md:hidden p-2">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="top" className="h-full">
            <div className="space-y-4 pt-8">
              {navItems.map((item, index) => (
                <SheetClose asChild key={index}>
                  <Link
                    to={item.path}
                    className={`block py-3 text-lg text-center ${location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/") ? "font-bold" : ""}`}
                  >
                    {t(item.label)}
                  </Link>
                </SheetClose>
              ))}
              <div className="pt-4 border-t">
                <AuthButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:block">
          <AuthButton />
        </div>
        <ModeToggle />
        <LanguageToggle />
      </div>
    </div>
  );
};

export default Navbar;

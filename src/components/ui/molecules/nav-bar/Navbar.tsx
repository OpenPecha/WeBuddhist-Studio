import pechaIcon from "../../../../assets/icon/pecha_icon.png";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "../mode-toggle/modetoggle";
// import { IoAnalytics } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { LanguageToggle } from "../language-toggle/languageToggle";
import AuthLogout from "../auth-logout/AuthLogout";
const navItems = [
  {
    icon: <MdDashboard className="w-4 h-4" />,
    label: "studio.nav.dashboard",
    path: "/dashboard",
  },
  // {
  //   icon: <IoAnalytics className="w-4 h-4" />,
  //   label: "studio.nav.analytics",
  //   path: "/analytics",
  // },
];
const Navbar = () => {
  const location = useLocation();
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
        <div className="flex flex-col space-y-4 items-center w-full">
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
      <div className="flex flex-col items-center space-y-2">
        <ModeToggle />
        <LanguageToggle />
        <AuthLogout />
      </div>
    </div>
  );
};

export default Navbar;

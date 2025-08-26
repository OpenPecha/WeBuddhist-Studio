import pechaIcon from '../../../../assets/icon/pecha_icon.png';
import { Link, useLocation } from 'react-router-dom';
import AuthButton from '../auth-button/AuthButton';
import { ModeToggle } from '../mode-toggle/modetoggle';
import { SITE_NAME } from '@/lib/constant';
import { LanguageToggle } from '../language-toggle/languageToggle';
const navItems=[
  {
    label:'Dashboard',
    path:'/dashboard'
  },
  {
    label:"Analytics",
    path:"/analytics"
  }
]
const Navbar = () => {
  const location = useLocation()
  return (
    <div className="font-dynamic p-2 flex justify-between items-center">
      <div className="flex items-center space-x-10">
        <div className="flex items-center gap-2">
        <img src={pechaIcon} alt="Pecha Studio Logo" className="w-10 h-10" />
        <h1 className="font-semibold text-sm">{SITE_NAME}</h1>
        </div>
      <div className="flex items-center space-x-6">
        {
          navItems.map((item,index)=>(  
            <Link to={item.path} key={index} className={`text-sm hover:cursor-pointer ${(location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/')) ? "text-zinc-900 font-bold dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}`}>
              {item.label}
            </Link>
          ))
        }
      </div>
      </div>
      <div className="flex items-center space-x-2">
      <AuthButton/>
      <ModeToggle/>
      <LanguageToggle/>
      </div>
  
    </div>
  )
}

export default Navbar
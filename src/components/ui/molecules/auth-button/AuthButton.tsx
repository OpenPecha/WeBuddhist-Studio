import { Button } from "../../atoms/button"
import { useNavigate } from 'react-router-dom'
const AuthButton = () => {
    const navigate = useNavigate()
  return (
    <div className="flex items-center font-inter gap-2">
        <Button onClick={()=>{
            navigate('/login')
        }} variant="outline">
            <span className="text-sm font-medium">Login</span>
        </Button>
        <Button onClick={()=>{
            navigate('/signup')
        }} variant="secondary">
            <span className="text-sm font-medium">Signup</span>
        </Button>
    </div>
  )
}

export default AuthButton
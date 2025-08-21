
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import pechaIcon from '../../../assets/icon/pecha_icon.png';
import { Link } from 'react-router-dom';

const Login = () => {

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dots">
      <div className=" rounded-3xl bg-white dark:bg-[#1C1C1C] w-full max-w-[460px] border border-gray-200 dark:border-[#3D3D3D]  flex flex-col items-center justify-center p-8">
        
        <div className="flex items-center mb-4">
          <div className=" w-[60px] h-[60px] rounded-full flex items-center justify-center">
            <img 
              src={pechaIcon} 
              alt="Pecha Studio Logo" 
              className=" object-contain"
            />
          </div>
          
          <div>
          <h1 className="font-semibold font-inter text-xl">
            Webuddhist Studio
          </h1>
          <p className="text-sm text-center">
            Learn, live and share Buddhist wisdom daily
          </p>
          </div>
        </div>         
        <div className="text-sm text-gray-400 mb-2.5 text-center w-full">
        Enter your email address and password to login in </div>
        <form className="w-full font-inter max-w-[425px] space-y-4">
          
          <div className="text-sm space-y-2">
            <Label 
              htmlFor="email"
              className="font-medium"
            >
              Email
            </Label>
            <Input
              type="email"
              placeholder="Enter your Email"
              className="  placeholder:text-[#b1b1b1]"
              required
            />
          </div>

          <div className="text-sm space-y-2">
            <Label 
              htmlFor="password"
              className="font-medium"
            >
              Password
            </Label>
            <Input
              type="password"
              placeholder="Enter your Password"
              className=" placeholder:text-[#b1b1b1]"
              required
            />
          </div>

          <div className="flex mt-4 justify-center ">
            <Button
              type="submit"
              variant="outline"
              className="w-full text-sm "
            >
              Submit
            </Button>
          </div>

          <div className="flex justify-center">
            <Link
              to="/signup"
              className="text-sm"
            >
              Don't have an account? Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
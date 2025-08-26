
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import pechaIcon from '../../../assets/icon/pecha_icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useState } from "react";
import { useAuth } from "@/config/auth-context";
import { useTranslate } from "@tolgee/react";
interface LoginData {
  email: string;
  password: string;
}
const Login = () => {
  const {t}=useTranslate()
  const navigate=useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{error?: string}>({});
  const { login } = useAuth();

  const loginMutation = useMutation<any, Error, LoginData>({
    mutationFn: async (loginData: LoginData) => {
        const response = await axiosInstance.post(
            `${BACKEND_BASE_URL}/api/v1/auth/login`,
            loginData
        );
        return response.data;
    },
    onSuccess: (data: any) => {
        const accessToken = data.auth.access_token;
        const refreshToken = data.auth.refresh_token;
        login(accessToken, refreshToken);
        navigate("/dashboard");
    },
    onError: (error: any) => {
        console.error("Login failed", error);
        const errorMsg = error?.response?.data?.message || error?.response?.data?.detail || "Login failed";
        setErrors({ error: errorMsg });
    },
  });
  const handleLogin=(e: React.FormEvent)=>{
    e.preventDefault();
    loginMutation.mutate({email,password})
  }
  return (
    <div className="min-h-screen font-dynamic flex items-center justify-center p-4 bg-dots">
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
          <h1 className="font-semibold text-xl">
            Webuddhist Studio
          </h1>
          <p className="text-sm text-center">
            Learn, live and share Buddhist wisdom daily
          </p>
          </div>
        </div>         
        <div className="text-sm text-gray-400 mb-2.5 text-center w-full">
        Enter your email address and password to login in </div>
        <form className="w-full  max-w-[425px] space-y-4" onSubmit={handleLogin}>
          
          <div className="text-sm space-y-2">
            <Label 
              htmlFor="email"
              className="font-medium"
            >
              {t("common.email")}
            </Label>
            <Input
              type="email"
              placeholder="Enter your Email"
              className="  placeholder:text-[#b1b1b1]"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
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
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>
       {errors.error && <div className="text-red-800 dark:text-red-400 flex items-center justify-center text-sm"> {errors.error} </div>}
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
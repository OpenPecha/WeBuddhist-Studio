import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import StudioCard from "@/components/ui/atoms/studio-card";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useState } from "react";
import { useAuth } from "@/config/auth-context";
import { useTranslate } from "@tolgee/react";
import { createPasswordHash } from "@/lib/utils";
interface LoginData {
  email: string;
  password: string;
}
const Login = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ error?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showEmailReverify, setShowEmailReverify] = useState<boolean>(false);
  const { login } = useAuth();

  const loginMutation = useMutation<any, Error, LoginData>({
    mutationFn: async (loginData: LoginData) => {
      const response = await axiosInstance.post(
        `${BACKEND_BASE_URL}/api/v1/cms/auth/login`,
        loginData,
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
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Login failed";

      const emailVerificationErrorMessage =
        errorMsg.toLowerCase().includes("author not verified");

      setShowEmailReverify(emailVerificationErrorMessage);
      setErrors({ error: errorMsg });
    },
  });

  const emailReverifyMutation = useMutation<any, Error, { email: string }>({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post(
        `${BACKEND_BASE_URL}/api/v1/cms/auth/email-re-verification?email=${encodeURIComponent(data.email)}`,
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      const message = data?.message;
      setSuccessMessage(message);
      setErrors({});
    },
    onError: (error: any) => {
      console.error("Email re-verification failed", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Email re-verification failed";
      setErrors({ error: errorMsg });
      setSuccessMessage("");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEmailReverify(false);
    setSuccessMessage("");
    const clientPassword = createPasswordHash(email, password);
    loginMutation.mutate({
      email,
      password: clientPassword,
    });
  };

  const handleEmailReverify = () => {
    if (!email) {
      setErrors({ error: "Please enter your email address first" });
      setSuccessMessage("");
      return;
    }
    setErrors({});
    setSuccessMessage("");
    emailReverifyMutation.mutate({ email });
  };

  const resetFormState = () => {
    setShowEmailReverify(false);
    setSuccessMessage("");
    setErrors({});
  };

  return (
    <StudioCard title={t("studio.login.title")}>
      <form className="w-full max-w-[425px] space-y-4" onSubmit={handleLogin}>
        <div className="text-sm space-y-2">
          <Label htmlFor="email" className="font-medium">
            {t("common.email")}
          </Label>
          <Input
            type="email"
            placeholder={t("studio.login.placeholder.email")}
            className="  placeholder:text-[#b1b1b1]"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              resetFormState();
            }}
          />
        </div>

        <div className="text-sm space-y-2">
          <Label htmlFor="password" className="font-medium">
            {t("common.password")}
          </Label>
          <Input
            type="password"
            placeholder={t("studio.login.placeholder.password")}
            className=" placeholder:text-[#b1b1b1]"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              resetFormState();
            }}
          />
        </div>
        {errors.error && (
          <div className="text-red-800 dark:text-red-400 flex items-center justify-center text-sm">
            {" "}
            {errors.error}{" "}
          </div>
        )}
        {successMessage && (
          <div className="text-green-800 dark:text-green-400 flex items-center justify-center text-sm">
            {successMessage}
          </div>
        )}
        <div className="flex mt-4 justify-center ">
          <Button type="submit" variant="outline" className="w-full text-sm ">
            {t("common.button.submit")}
          </Button>
        </div>
        {showEmailReverify && (
          <div>
            <Button type="button" variant="outline" className="w-full text-sm" onClick={handleEmailReverify} disabled={emailReverifyMutation.isPending}>
              {emailReverifyMutation.isPending ? "Sending..." : "Reverify your Email"}
            </Button>
          </div>
        )}

        <div className="flex justify-center">
          <Link to="/forgot-password" className="text-sm">
            Forgot password?
          </Link>
        </div>

        <div className="flex justify-center">
          <Link to="/signup" className="text-sm">
            {t("studio.login.no_account")}
          </Link>
        </div>
      </form>
    </StudioCard>
  );
};

export default Login;

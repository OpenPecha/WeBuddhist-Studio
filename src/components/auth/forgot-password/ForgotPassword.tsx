import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import pechaIcon from "../../../assets/icon/pecha_icon.png";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useState } from "react";
import { useTranslate } from "@tolgee/react";

const ForgotPassword = () => {
  const { t } = useTranslate();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: async (emailData: { email: string }) => {
      const response = await axiosInstance.post(
        `${BACKEND_BASE_URL}/api/v1/auth/request-reset-password`,
        emailData,
      );
      return response.data;
    },
    onSuccess: () => {
      alert("Email with reset password link is sent to your email address");
      navigate("/");
    },
    onError: (error: any) => {
      setError(error.response.data.message);
    },
  });
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
    } else if (!validateEmail(email)) {
      setError("Please enter a valid email address");
    } else {
      forgotPasswordMutation.mutate({ email });
    }
  };

  return (
    <div className="min-h-screen font-dynamic flex items-center justify-center p-4 bg-dots">
      <div className="rounded-3xl bg-white dark:bg-[#1C1C1C] w-full max-w-[460px] border border-gray-200 dark:border-[#3D3D3D] flex flex-col items-center justify-center p-8">
        <div className="flex items-center mb-4">
          <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center">
            <img
              src={pechaIcon}
              alt="Pecha Studio Logo"
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-semibold font-inter text-xl">
              Webuddhist Studio
            </h1>
            <p className="text-sm font-inter text-center">
              Learn, live and share Buddhist wisdom daily
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400 mb-2.5 text-center w-full">
          {t("studio.reset_password.description")}
        </div>
        <form
          className="w-full max-w-[425px] space-y-4"
          onSubmit={handleForgotPassword}
        >
          <div className="text-sm space-y-2">
            <Label htmlFor="email" className="font-medium">
              {t("common.email")}
            </Label>
            <Input
              type="email"
              placeholder={t("studio.login.placeholder.email")}
              className="placeholder:text-[#b1b1b1]"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-red-800 dark:text-red-400 flex items-center justify-center text-sm">
              {" "}
              {error}{" "}
            </div>
          )}
          <div className="flex mt-4 justify-center">
            <Button type="submit" variant="outline" className="w-full text-sm">
              {t("common.button.submit")}
            </Button>
          </div>
          <div className="flex justify-center">
            <Link to="/login" className="text-sm">
              {t("studio.reset_password.back_to_login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

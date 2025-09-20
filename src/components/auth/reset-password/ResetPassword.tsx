import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import pechaIcon from "../../../assets/icon/pecha_icon.png";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useState } from "react";
import { useTranslate } from "@tolgee/react";
import { z } from "zod";
import { resetPasswordSchema } from "@/schema/ResetPasswordSchema";

const ResetPassword = () => {
  const { t } = useTranslate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const forgotPasswordMutation = useMutation({
    mutationFn: async (password: { password: string }) => {
      const response = await axiosInstance.post(
        `${BACKEND_BASE_URL}/api/v1/cms/auth/reset-password`,
        password,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      setSuccess(
        "Password reset successfully, you can now login with your new password",
      );
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    const formDataObj = {
      password,
      confirmPassword,
    };

    try {
      const validatedData = resetPasswordSchema.parse(formDataObj);
      forgotPasswordMutation.mutate({ password: validatedData.password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.issues[0].message);
      }
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
          {t("studio.reset_password.new_password")}
        </div>
        <form
          className="w-full max-w-[425px] space-y-4"
          onSubmit={handleResetPassword}
        >
          <div className="text-sm space-y-2">
            <Label htmlFor="password" className="font-medium">
              {t("common.password")}
            </Label>
            <Input
              type="password"
              placeholder={t("studio.login.placeholder.password")}
              className="placeholder:text-[#b1b1b1]"
              name="password"
              required
            />
          </div>
          <div className="text-sm space-y-2">
            <Label htmlFor="confirmPassword" className="font-medium">
              Confirm Password
            </Label>
            <Input
              type="password"
              placeholder="Confirm your new password"
              className="placeholder:text-[#b1b1b1]"
              name="confirmPassword"
              required
            />
          </div>
          {error && (
            <div className="text-red-800 dark:text-red-400 flex items-center justify-center text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-800 dark:text-green-400 flex items-center justify-center text-sm">
              {success}
            </div>
          )}
          <div className="flex mt-4 justify-center ">
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

export default ResetPassword;

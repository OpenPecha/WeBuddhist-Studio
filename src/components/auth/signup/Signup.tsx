import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import pechaIcon from "../../../assets/icon/pecha_icon.png";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { type FormEvent } from "react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { signupSchema } from "@/schema/SignupSchema";

interface SignupData {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

const Signup = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useMutation<any, Error, SignupData>({
    mutationFn: async (signupData: SignupData) => {
      const response = await axiosInstance.post(
        `${BACKEND_BASE_URL}/api/v1/users/signup`,
        signupData,
      );
      return response.data;
    },
    onSuccess: () => {
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message || "Signup failed. Please try again.";
      setError(errorMsg);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const formDataObj = {
      email: formData.get("email") as string,
      firstname: formData.get("firstname") as string,
      lastname: formData.get("lastname") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirm-password") as string,
    };

    try {
      const validatedData = signupSchema.parse(formDataObj);
      signupMutation.mutate({
        email: validatedData.email,
        firstname: validatedData.firstname,
        lastname: validatedData.lastname,
        password: validatedData.password,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.issues[0].message);
      }
    }
  };
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
            <h1 className="font-semibold font-inter text-xl">
              Webuddhist Studio
            </h1>
            <p className="text-sm text-center font-inter">
              Learn, live and share Buddhist wisdom daily
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400 mb-2.5 text-center w-full">
          {t("studio.signup.title")}
        </div>
        <form
          className="w-full max-w-[425px] space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="text-sm space-y-2">
            <Label htmlFor="email" className="font-medium">
              {t("common.email")}
            </Label>
            <Input
              type="email"
              name="email"
              placeholder={t("studio.login.placeholder.email")}
              className="  placeholder:text-[#b1b1b1]"
              required
            />
          </div>
          <div className="text-sm space-y-2">
            <Label htmlFor="firstname" className="font-medium">
              {t("sign_up.form.first_name")}
            </Label>
            <Input
              type="text"
              name="firstname"
              placeholder={t("studio.signup.placeholder.first_name")}
              className="  placeholder:text-[#b1b1b1]"
              required
            />
          </div>
          <div className="text-sm space-y-2">
            <Label htmlFor="lastname" className="font-medium">
              {t("sign_up.form.last_name")}
            </Label>
            <Input
              type="text"
              name="lastname"
              placeholder={t("studio.signup.placeholder.last_name")}
              className="  placeholder:text-[#b1b1b1]"
              required
            />
          </div>
          <div className="text-sm space-y-2">
            <Label htmlFor="password" className="font-medium">
              {t("common.password")}
            </Label>
            <Input
              type="password"
              name="password"
              placeholder={t("studio.signup.placeholder.password")}
              className=" placeholder:text-[#b1b1b1]"
              required
            />
          </div>
          <div className="text-sm space-y-2">
            <Label htmlFor="confirm-password" className="font-medium">
              {t("common.confirm_password")}
            </Label>
            <Input
              type="password"
              name="confirm-password"
              placeholder={t("studio.signup.placeholder.password")}
              className=" placeholder:text-[#b1b1b1]"
              required
            />
          </div>

          <div className="flex mt-4 justify-center ">
            <Button
              type="submit"
              variant="outline"
              className=" w-full text-sm "
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending
                ? "Signing up..."
                : t("common.button.submit")}
            </Button>
          </div>

          {error && (
            <div className="text-red-800 dark:text-red-400 flex items-center justify-center text-sm">
              {error}
            </div>
          )}
          {signupMutation.isSuccess && (
            <div className="text-green-600 dark:text-green-400 flex items-center justify-center text-sm mb-2">
              Signup successful! Check your email to verify your account.
              Redirecting to login...
            </div>
          )}
          <div className="flex justify-center">
            <Link to="/login" className="text-sm">
              {t("sign_up.already_have_account")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

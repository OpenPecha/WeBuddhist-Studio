import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import ContainerLayout from "@/components/ui/atoms/studio-card";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { useEffect, useState } from "react";
import { useAuth } from "@/config/auth-context";
import { useTranslate } from "@tolgee/react";
import { createPasswordHash } from "@/lib/utils";
import {
  AUTHOR_NOT_ACTIVE_DETAIL,
  isAuthorNotActiveDetail,
} from "@/lib/platformAccess";
import { getApiErrorDetail } from "@/lib/apiErrors";
import { ROUTES } from "@/routes/paths";

interface LoginData {
  email: string;
  password: string;
}

const Login = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showEmailReverify, setShowEmailReverify] = useState<boolean>(false);
  const [inactiveOnly, setInactiveOnly] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const state = location.state as {
      inactive?: boolean;
      message?: string;
    } | null;
    if (state?.inactive) {
      setInactiveOnly(true);
      setErrors(state.message ?? AUTHOR_NOT_ACTIVE_DETAIL);
    }
  }, [location.state]);

  const loginMutation = useMutation<any, Error, LoginData>({
    mutationFn: async (loginData: LoginData) => {
      const response = await axiosInstance.post(
        `/api/v1/cms/auth/login`,
        loginData,
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      const accessToken = data.auth.access_token;
      const refreshToken = data.auth.refresh_token;
      login(accessToken, refreshToken);
      navigate(ROUTES.dashboard);
    },
    onError: (error: any) => {
      const detail = getApiErrorDetail(error) ?? "Login failed";
      const emailVerificationErrorMessage = detail
        .toLowerCase()
        .includes("author not verified");

      if (isAuthorNotActiveDetail(detail)) {
        setInactiveOnly(true);
        setShowEmailReverify(false);
        setErrors(AUTHOR_NOT_ACTIVE_DETAIL);
        return;
      }

      setInactiveOnly(false);
      setShowEmailReverify(emailVerificationErrorMessage);
      setErrors(detail);
    },
  });

  const emailReverifyMutation = useMutation<any, Error, { email: string }>({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post(
        `/api/v1/cms/auth/email-re-verification?email=${encodeURIComponent(data.email)}`,
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      const message = data?.message;
      setSuccessMessage(message);
      setErrors("");
    },
    onError: (error: any) => {
      const errorMsg =
        getApiErrorDetail(error) || "Email re-verification failed";
      setErrors(errorMsg);
      setSuccessMessage("");
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowEmailReverify(false);
    setSuccessMessage("");
    setInactiveOnly(false);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const clientPassword = createPasswordHash(email, password);
    loginMutation.mutate({
      email,
      password: clientPassword,
    });
  };

  const handleEmailReverify = () => {
    setErrors("");
    setSuccessMessage("");
    emailReverifyMutation.mutate({ email });
  };

  if (inactiveOnly) {
    return (
      <ContainerLayout title={t("studio.login.title")}>
        <div className="w-full max-w-[425px] space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {errors || AUTHOR_NOT_ACTIVE_DETAIL}
          </p>
          <p className="text-xs text-muted-foreground">
            Your account must be activated by a platform administrator before
            you can sign in.
          </p>
        </div>
      </ContainerLayout>
    );
  }

  return (
    <ContainerLayout title={t("studio.login.title")}>
      <form className="w-full max-w-[425px] space-y-4" onSubmit={handleLogin}>
        <div className="text-sm space-y-2">
          <Label htmlFor="email" className="font-medium">
            {t("common.email")}
          </Label>
          <Input
            type="email"
            placeholder={t("studio.login.placeholder.email")}
            className=" placeholder:text-[#b1b1b1]"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>

        <div className="text-sm space-y-2">
          <Label htmlFor="password" className="font-medium">
            {t("common.password")}
          </Label>
          <Input
            type="password"
            name="password"
            placeholder={t("studio.login.placeholder.password")}
            className=" placeholder:text-[#b1b1b1]"
            required
          />
        </div>
        <div className="flex mt-4 justify-center ">
          <Button type="submit" variant="outline" className="w-full text-sm ">
            {t("common.button.submit")}
          </Button>
        </div>
        {showEmailReverify && (
          <div>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={handleEmailReverify}
              disabled={emailReverifyMutation.isPending}
            >
              {emailReverifyMutation.isPending
                ? t("studio.login.sending")
                : t("studio.login.reverify_your_email")}
            </Button>
          </div>
        )}
        {errors && (
          <div className="text-red-800 text-center dark:text-red-400 text-sm">
            {errors}
          </div>
        )}
        {successMessage && (
          <div className="text-green-800 text-center dark:text-green-400 text-sm">
            {successMessage}
          </div>
        )}
        <div className="flex justify-center">
          <Link to="/forgot-password" className="text-sm">
            {t("studio.login.forgot_password")}
          </Link>
        </div>

        <div className="flex justify-center">
          <Link to="/signup" className="text-sm">
            {t("studio.login.no_account")}
          </Link>
        </div>
      </form>
    </ContainerLayout>
  );
};

export default Login;

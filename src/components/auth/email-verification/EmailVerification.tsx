import { Button } from "@/components/ui/atoms/button";
import StudioCard from "@/components/ui/atoms/studio-card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import axiosInstance from "@/config/axios-config";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";

const verifyEmail = async (token: string) => {
  const response = await axiosInstance.get(`/api/v1/cms/auth/verify-email`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

interface VerifyEmailResponse {
  email: string;
  status: string;
  message: string;
}

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
 const {t}=useTranslate();
  const {
    data: verifyEmailData,
    isLoading,
    isError,
    error,
  } = useQuery<VerifyEmailResponse>({
    queryKey: ["verifyEmail", token],
    queryFn: () => verifyEmail(token as string),
    enabled: !!token,
    retry: false,
  });

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const getErrorMessage = () => {
    if (error) {
      const axiosError = error as any;
      if (axiosError.response?.data?.detail) {
        return axiosError.response.data.detail;
      }
    }

    return t("studio.auth.email.there_was_an_error");
  };

  const getStatusIcon = () => {
    if (isLoading) return null;

    if (isError) {
      return (
        <IoMdCloseCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
      );
    }

    if (verifyEmailData) {
      return (
        <IoMdCheckmarkCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
      );
    }

    return null;
  };

  const getStatusColor = () => {
    if (isError) {
      return "text-red-600 dark:text-red-400";
    }

    if (verifyEmailData) {
      return "text-green-600 dark:text-green-400";
    }

    return "text-gray-600 dark:text-gray-400";
  };

  if (!token) {
    return (
      <StudioCard>
        <div className="mb-6 flex justify-center">
          <IoMdCloseCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-center">{t("studio.auth.email.invalid_token")}</h2>
        <p className="text-center mb-8 text-sm text-red-600 dark:text-red-400">
          {t("studio.auth.email.no_verification_token")}
        </p>
      </StudioCard>
    );
  }

  return (
    <StudioCard>
      <div className="mb-6 flex justify-center">{getStatusIcon()}</div>

      <h2 className="text-xl font-semibold text-center">
        {isLoading && t("studio.auth.email.verifying_email")}
        {isError && t("studio.auth.email.verification_failed")}
        {verifyEmailData && t("studio.auth.email.email_verified")}
      </h2>

      <p className={`text-center mb-8 text-sm ${getStatusColor()}`}>
        {isLoading && t("studio.auth.email.please_wait_while_we_verify_your_email_address")}
        {isError && getErrorMessage()}
        {verifyEmailData?.message}
      </p>

      <div className="w-full space-y-4">
        {verifyEmailData && (
          <Button
            onClick={handleLoginRedirect}
            className="w-full"
            variant="outline"
          >
            {t("studio.auth.email.continue_to_login")}
          </Button>
        )}
      </div>
    </StudioCard>
  );
};

export default EmailVerification;

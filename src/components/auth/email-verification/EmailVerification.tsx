import { Button } from "@/components/ui/atoms/button";
import StudioCard from "@/components/ui/atoms/studio-card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import axiosInstance from "@/config/axios-config";
import { useQuery } from "@tanstack/react-query";

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

    return "There was an error verifying your email. Please try again or contact support.";
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
        <h2 className="text-xl font-semibold text-center">Invalid Token</h2>
        <p className="text-center mb-8 text-sm text-red-600 dark:text-red-400">
          No verification token provided.
        </p>
      </StudioCard>
    );
  }

  return (
    <StudioCard>
      <div className="mb-6 flex justify-center">{getStatusIcon()}</div>

      <h2 className="text-xl font-semibold text-center">
        {isLoading && "Verifying Email..."}
        {isError && "Verification Failed"}
        {verifyEmailData && "Email Verified!"}
      </h2>

      <p className={`text-center mb-8 text-sm ${getStatusColor()}`}>
        {isLoading && "Please wait while we verify your email address."}
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
            Continue to Login
          </Button>
        )}
      </div>
    </StudioCard>
  );
};

export default EmailVerification;

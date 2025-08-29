import { Button } from "@/components/ui/atoms/button";
import StudioCard from "@/components/ui/atoms/studio-card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserRoundCheck, UserRoundX } from "lucide-react";

interface VerificationState {
  status: "loading" | "success" | "error" | "invalid";
  message: string;
}

const EmailVerification = () => {
  const navigate = useNavigate();
  const [verificationState] = useState<VerificationState>({
    status: "success",
    message: "Your email has been successfully verified!",
  });

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const getStatusIcon = () => {
    switch (verificationState.status) {
      case "success":
        return (
          <UserRoundCheck className="w-16 h-16 text-green-600 dark:text-green-400" />
        );
      case "error":
      case "invalid":
        return (
          <UserRoundX className="w-16 h-16 text-red-600 dark:text-red-400" />
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (verificationState.status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
      case "invalid":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <StudioCard>
      <div className="mb-6 flex justify-center">{getStatusIcon()}</div>

      <h2 className="text-xl font-semibold text-center">
        {verificationState.status === "success" && "Email Verified!"}
        {(verificationState.status === "error" ||
          verificationState.status === "invalid") &&
          "Verification Failed"}
      </h2>

      <p className={`text-center mb-8 text-sm  ${getStatusColor()}`}>
        {verificationState.message}
      </p>

      <div className="w-full space-y-4">
        {verificationState.status === "success" && (
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

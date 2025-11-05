import { useAuth } from "@/config/auth-context";
import { Navigate } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const { t } = useTranslate();
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">{t("common.loading")}</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

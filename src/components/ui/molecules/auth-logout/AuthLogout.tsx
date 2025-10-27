import React from "react";
import { Button } from "../../atoms/button";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/config/auth-context";

const AuthLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    logout();
    navigate("/login");
  }
  return (
    <Button size="icon" onClick={handleLogout} variant="outline">
      <IoIosLogOut className="w-4 h-4" />
    </Button>
  );
};

export default AuthLogout;

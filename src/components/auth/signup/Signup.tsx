import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import pechaIcon from "../../../assets/icon/pecha_icon.png";
import { Link } from "react-router-dom";
import { useTranslate } from "@tolgee/react";

const Signup = () => {
  const { t } = useTranslate();
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
        <form className="w-full max-w-[425px] space-y-4">
          <div className="text-sm space-y-2">
            <Label htmlFor="email" className="font-medium">
              {t("common.email")}
            </Label>
            <Input
              type="email"
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
            >
              {t("common.button.submit")}
            </Button>
          </div>

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

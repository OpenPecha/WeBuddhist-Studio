import { IoLanguage } from "react-icons/io5";
import { useTolgee } from "@tolgee/react";
import { Pecha } from "@/components/ui/shadimport";
import { LANGUAGE } from "../../../../lib/constant";
import { setFontVariables } from "../../../../config/font-config";

export function LanguageToggle() {
  const tolgee = useTolgee(["language"]);

  const changeLanguage = (language: string) => {
    tolgee.changeLanguage(language);
    localStorage.setItem(LANGUAGE, language);
    setFontVariables(language);
  };

  return (
    <Pecha.DropdownMenu>
      <Pecha.DropdownMenuTrigger asChild>
        <Pecha.Button variant="outline" size="icon">
          <IoLanguage className="h-[1.2rem] w-[1.2rem]" />
        </Pecha.Button>
      </Pecha.DropdownMenuTrigger>
      <Pecha.DropdownMenuContent align="end">
        <Pecha.DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className=" font-inter"
        >
          English
        </Pecha.DropdownMenuItem>
        <Pecha.DropdownMenuItem
          onClick={() => changeLanguage("bo-IN")}
          className=" font-monlam"
        >
          བོད་ཡིག
        </Pecha.DropdownMenuItem>
      </Pecha.DropdownMenuContent>
    </Pecha.DropdownMenu>
  );
}

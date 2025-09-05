import { IoLanguage } from "react-icons/io5";
import { useTolgee } from "@tolgee/react";

import { Button } from "../../atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../atoms/dropdown-menu";
import { LANGUAGE } from "../../../../lib/constant";
import { setFontVariables } from "../../../../lib/font-config";

export function LanguageToggle() {
  const tolgee = useTolgee(["language"]);

  const changeLanguage = (language: string) => {
    tolgee.changeLanguage(language);
    localStorage.setItem(LANGUAGE, language);
    setFontVariables(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <IoLanguage className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className=" font-inter"
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("bo-IN")}
          className=" font-monlam"
        >
          བོད་ཡིག
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

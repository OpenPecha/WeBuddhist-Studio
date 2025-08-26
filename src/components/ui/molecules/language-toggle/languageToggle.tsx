import { Languages } from "lucide-react"
import { useTolgee } from "@tolgee/react"

import { Button } from "../../atoms/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../atoms/dropdown-menu"
import { LANGUAGE } from "../../../../lib/constant"

export function LanguageToggle() {
  const tolgee = useTolgee(['language'])

  const setLanguage = (language: string) => {
    tolgee.changeLanguage(language)
    localStorage.setItem(LANGUAGE, language)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("bo-IN")}>
          བོད་ཡིག
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
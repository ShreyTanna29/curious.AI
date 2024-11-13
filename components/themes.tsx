"use client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

enum ThemeEnum {
  Dark = "Dark Theme",
  Light = "Light Theme",
  System = "System Theme",
}

export default function Themes() {
  const [theme, setTheme] = useState<ThemeEnum>(
    localStorage.theme || ThemeEnum.System
  );

  const handleThemeChange = (selectedTheme: ThemeEnum) => {
    setTheme(selectedTheme);
    if (selectedTheme === ThemeEnum.Dark) {
      localStorage.theme = "Dark Theme";
      return;
    }
    if (selectedTheme === ThemeEnum.Light) {
      localStorage.theme = "Light Theme";
      return;
    }

    // if user has choosed system theme.
    localStorage.removeItem("theme");
  };

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, [handleThemeChange]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-lg dark:border-white">
            {theme}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-20 text-center">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleThemeChange(ThemeEnum.Light)}>
            Light
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleThemeChange(ThemeEnum.Dark)}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => handleThemeChange(ThemeEnum.System)}
          >
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

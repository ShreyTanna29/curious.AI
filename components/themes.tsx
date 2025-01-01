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
  Dark = "Dark",
  Light = "Light",
  System = "System",
}


// mapping the icons with the theme style
const themeIcons: Record<ThemeEnum, string> = {
  [ThemeEnum.Dark]: "🌙",
  [ThemeEnum.Light]: "☀️",
  [ThemeEnum.System]: "💻",
};

const getDefaultTheme = (): ThemeEnum => {
  const savedTheme = localStorage.getItem("theme") as ThemeEnum;
  return (
    savedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? ThemeEnum.Dark
      : ThemeEnum.Light)
  );
};

export default function Themes({
  borders = true,
  dropdownOn = true,
}: {
  borders?: boolean;
  dropdownOn?: boolean;
}) {
  const [theme, setTheme] = useState<ThemeEnum>(getDefaultTheme);

  const handleThemeChange = (selectedTheme: ThemeEnum) => {
    setTheme(selectedTheme);
    if (selectedTheme === ThemeEnum.System) {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", selectedTheme);
      document.documentElement.classList.toggle(
        "dark",
        selectedTheme === ThemeEnum.Dark
      );
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === ThemeEnum.Dark ||
          (theme === ThemeEnum.System && mediaQuery.matches)
      );

    mediaQuery.addEventListener("change", updateTheme);
    updateTheme();

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [theme]);

  return dropdownOn ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`rounded-lg ${borders ? " dark:border-white" : "border-none"}`}
        >
          {themeIcons[theme]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-20 text-center">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(ThemeEnum).map((themeOption) => (
          <DropdownMenuItem
            key={themeOption}
            onSelect={() => handleThemeChange(themeOption)}
          >
            {themeIcons[themeOption]} {themeOption}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button
      onClick={() =>
        handleThemeChange(
          theme === ThemeEnum.Light ? ThemeEnum.Dark : ThemeEnum.Light
        )
      }
      variant="outline"
      className={`rounded-lg ${borders ? " dark:border-white" : "border-none"}`}
    >
      {themeIcons[theme]}
    </Button>
  );
}

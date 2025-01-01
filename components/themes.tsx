"use client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

enum ThemeEnum {
  Dark = "Dark Theme",
  Light = "Light Theme",
}

export default function Themes({ borders = true }: { borders?: boolean }) {
  const [theme, setTheme] = useState<ThemeEnum>(ThemeEnum.Light);

  const handleThemeChange = () => {
    const newTheme = theme === ThemeEnum.Light ? ThemeEnum.Dark : ThemeEnum.Light;
    setTheme(newTheme);
    localStorage.theme = newTheme;
  };

  useEffect(() => {
    const savedTheme = localStorage.theme as ThemeEnum;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDarkMode ? ThemeEnum.Dark : ThemeEnum.Light);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === ThemeEnum.Dark);
  }, [theme]);

  return (
    <Button
      onClick={handleThemeChange}
      variant="outline"
      className={`rounded-full w-12 h-12 flex items-center justify-center ${borders ? "dark:border-white" : "border-none"}`}
    >
      {theme === ThemeEnum.Light ? "🌙" : "☀️"}
    </Button>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export default function LandingNavbar() {
  useEffect(() => {
    gsap.to(".slideAnimation", {
      opacity: 1,
      duration: 1,
      translateX: 0,
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);
  return (
    <nav className="px-3 py-2 w-full absolute z-50 bg-transparent flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative h-5 w-5 md:h-6 md:w-6 slideAnimation opacity-0 -translate-x-6">
          <Image fill alt="Logo" src="/logo.png" />
        </div>
        <h1
          className={cn(
            "text-lg md:text-xl font-bold text-black/70 dark:text-white slideAnimation opacity-0 -translate-x-6",
            font.className
          )}
        >
          Curious.AI
        </h1>
      </Link>
    </nav>
  );
}

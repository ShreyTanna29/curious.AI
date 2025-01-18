"use client";

import { cn } from "@/lib/utils";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";
import Themes from "../extra/themes";
import { Moon, Sun } from "lucide-react";

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
    })

  }, [])
  return (
    <nav className="p-4 w-full  absolute z-50 bg-transparent flex items-center justify-between" >
      <Link href="/" className="flex items-center">
        <div className="relative h-6 w-6 md:h-8 md:w-8 mr-4 slideAnimation opacity-0 -translate-x-10 ">
          <Image fill alt="Logo" src="/logo.png" />
        </div>
        <h1 className={cn(" text-xl md:text-2xl font-bold text-black/70 dark:text-white slideAnimation opacity-0 -translate-x-10 ", font.className)}>
          Curious.AI
        </h1>
      </Link>
      <Themes borders={false} showDropDown={false}>
        <Moon className="hidden dark:block" />
        <Sun className="block dark:hidden" />
      </Themes>
    </nav>
  );
}

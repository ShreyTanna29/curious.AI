"use client";

import { cn } from "@/lib/utils";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { slideAnimation } from "@/packages/features/animations/gsap-animations";
import { useGSAP } from "@gsap/react";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export default function LandingNavbar() {
  useGSAP(() => {
    slideAnimation()
  }, [])
  return (
    <nav className="p-4 w-full absolute z-50 bg-transparent flex items-center justify-between" >
      <Link href="/" className="flex items-center">
        <div className="relative h-6 w-6 md:h-8 md:w-8 mr-4 slideAnimation opacity-0 -translate-x-10 ">
          <Image fill alt="Logo" src="/logo.png" />
        </div>
        <h1 className={cn(" text-xl md:text-2xl font-bold text-white slideAnimation opacity-0 -translate-x-10 ", font.className)}>
          Curious.AI
        </h1>
      </Link>
    </nav>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export default function LandingNavbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="p-4 w-full absolute z-50 bg-transparent flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <div className="relative h-6 w-6 md:h-8 md:w-8 mr-4">
          <Image fill alt="Logo" src="/logo.png" />
        </div>
        <h1 className={cn(" text-xl md:text-2xl font-bold text-white", font.className)}>
          Curious.AI
        </h1>
      </Link>
      <Link href={isSignedIn ? "/dashboard" : "sign-in"} >
        <Button className="z-50 gap-4 hidden md:flex  bg-[#2a2a2a] hover:bg-transparent text-white " >
          {isSignedIn ? "Visit Dashboard" : "Get Started"} <ArrowRight />
        </Button>
      </Link>
    </nav>
  );
}

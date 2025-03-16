"use client";

import {
  LayoutDashboard,
  Menu,
  MessageSquare,
  ImageIcon,
  ShoppingBag,
  Code,
  Settings,
} from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "../ui/sheet";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import UserProfileCard from "./UserProfileCard";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/chat",
    color: "text-violet-500",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-500",
  },
  {
    label: "Marketplace",
    icon: ShoppingBag,
    href: "/marketplace",
    color: "text-orange-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

const monserrat = Montserrat({ weight: "600", subsets: ["latin"] });
const MobileSidebar = () => {
  const [issMounted, setIsMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!issMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0">
        <div className="space-y-4 py-4 w-full flex text-black flex-col h-full bg-slate-100 dark:bg-[#0f0f0f] dark:text-white">
          <div className="px-3 py-2 flex-1 w-full">
            <Link
              href="/dashboard"
              className="flex items-center pl-3 mb-8 mt-6"
            >
              <div className="relative w-8 h-8 mr-4">
                <Image fill src="/logo.png" alt="Logo" />
              </div>
              <div className="flex items-center gap-1">
                <h1 className={cn("text-2xl font-bold", monserrat.className)}>
                  Curious.AI
                </h1>
              </div>
            </Link>
            <div className="mb-8 w-full ">
              <UserProfileCard />
            </div>
            <div>
              {routes.map((route) => (
                <SheetClose key={route.href} asChild>
                  <Link
                    href={route.href}
                    onClick={() => (window.location.href = route.href)}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-black/10  dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition",
                      "text-black dark:text-zinc-400"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                      {route.label}
                    </div>
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;

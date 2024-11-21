"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { cn } from "@/packages/utils";
import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { FreeCounter } from "./FreeCounter";
import UserProfileCard from "./UserProfileCard";
import { useEffect } from "react";

const monserrat = Montserrat({ weight: "600", subsets: ["latin"] });

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

interface sidebarProps {
  apiLimitCount: number;
  isPro: boolean;
}

const Sidebar = ({ apiLimitCount = 0, isPro = false }: sidebarProps) => {
  const pathName = usePathname();

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);

  return (
    <div className="space-y-4 py-4 flex text-black flex-col h-full bg-slate-100 dark:bg-[#0f0f0f] dark:text-white">
      <div className="px-3 py-2 flex-1">
        <Link href={"/dashboard"} className="flex items-center pl-3 mb-8 mt-6">
          <div className="relative w-8 h-8 mr-4">
            <Image fill src="/logo.png" alt="Logo" />
          </div>
          <h1 className={cn("text-2xl font-bold", monserrat.className)}>
            Curious.AI
          </h1>
        </Link>
        <div className="mb-8">
          <UserProfileCard />
        </div>
        <div>
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-black/10  dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition",
                pathName === route.href
                  ? "text-black font-bold bg-black/10 dark:text-white dark:bg-white/10"
                  : "text-black dark:text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />
    </div>
  );
};

export default Sidebar;

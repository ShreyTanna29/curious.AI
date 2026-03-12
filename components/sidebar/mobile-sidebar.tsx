"use client";

import {
  Code,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Mic,
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
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/chat",
  },
  {
    label: "Speech Generation",
    icon: Mic,
    href: "/speech",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const MobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
        (!('theme' in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden rounded-xl border border-slate-200/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[88vw] max-w-sm border-r-0 p-0">
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50 text-black dark:bg-zinc-950 dark:text-white">

          <div className="relative flex h-full flex-col px-4 py-5">
            <Link href="/dashboard" className="mb-5 mt-2 flex items-center rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/70">
              <div className="relative mr-3 h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-500/20 p-1">
                <Image fill src="/logo.png" alt="Logo" className="object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className={cn("text-lg font-bold", montserrat.className)}>Curious.AI</h1>
                <span className="inline-flex items-center rounded-full border border-cyan-200/80 bg-cyan-100/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-700 dark:border-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-300">
                  Pro
                </span>
              </div>
            </Link>

            <div className="mb-5 w-full">
              <UserProfileCard />
            </div>

            <div className="space-y-1.5">
              {routes.map((route) => {
                const isActive =
                  pathname === route.href || pathname.startsWith(`${route.href}/`);

                return (
                  <SheetClose key={route.href} asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "group relative flex w-full items-center justify-start rounded-xl border border-transparent p-3 text-sm font-medium transition-all",
                        "hover:border-slate-300/70 hover:bg-slate-900/10 dark:hover:border-slate-700 dark:hover:bg-black/45",
                        isActive &&
                          "border-slate-300/90 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-zinc-900/90 dark:text-white",
                        "text-black dark:text-white",
                      )}
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-slate-900 dark:bg-zinc-100" />
                      ) : null}
                      <div className="flex items-center">
                        <route.icon
                          className={cn(
                            "mr-3 h-5 w-5 text-slate-900 dark:text-white",
                            isActive && "text-slate-900 dark:text-white",
                          )}
                        />
                        {route.label}
                      </div>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;

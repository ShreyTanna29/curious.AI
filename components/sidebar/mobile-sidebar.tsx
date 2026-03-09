"use client";

import {
  Code,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
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
    color: "text-sky-500",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/chat",
    color: "text-violet-500",
  },
  {
    label: "Speech Generation",
    icon: Mic,
    href: "/speech",
    color: "text-blue-600",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-emerald-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-slate-500",
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
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white text-black dark:from-black dark:via-zinc-950 dark:to-zinc-950 dark:text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(6,182,212,0.16),transparent_25%),radial-gradient(circle_at_90%_20%,rgba(59,130,246,0.16),transparent_30%)]" />

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
                        "hover:border-slate-200/80 hover:bg-white/80 dark:hover:border-slate-700 dark:hover:bg-zinc-900/70",
                        isActive &&
                          "border-cyan-300/70 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-slate-900 shadow-sm dark:border-cyan-700 dark:text-white",
                        "text-black dark:text-zinc-300",
                      )}
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-cyan-500" />
                      ) : null}
                      <div className="flex items-center">
                        <route.icon className={cn("mr-3 h-5 w-5", route.color)} />
                        {route.label}
                      </div>
                      {isActive ? <Sparkles className="ml-auto h-4 w-4 text-cyan-500" /> : null}
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

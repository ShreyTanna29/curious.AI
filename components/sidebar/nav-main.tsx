"use client";

import Link from "next/link";
import { type LucideIcon, Sparkles } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  
  const pathname = usePathname(); 

  const isItemActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <SidebarGroup className="pt-0">
      <SidebarGroupLabel className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500/90 dark:text-zinc-400">
        Workspace
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => { 
          const isActive = isItemActive(item.url);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className={clsx(
                  "group relative h-11 rounded-xl border border-transparent px-3 transition-all",
                  "hover:border-slate-200/70 hover:bg-slate-100/90 dark:hover:border-slate-700 dark:hover:bg-slate-800/80",
                  isActive &&
                    "border-cyan-300/60 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-slate-900 shadow-sm dark:border-cyan-600/70 dark:text-white"
                )}
              >
                <Link href={item.url}>
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-cyan-500" />
                  ) : null}
                  {item.icon && (
                    <item.icon
                      className={clsx(
                        "size-[18px] text-slate-500 transition-colors dark:text-zinc-400",
                        isActive && "text-cyan-600 dark:text-cyan-300",
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                  {isActive ? (
                    <Sparkles className="ml-auto size-3.5 text-cyan-500/90" />
                  ) : null}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        )})}
      </SidebarMenu>
    </SidebarGroup>
  );
}

"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

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
          const gradientId = `sidebar-icon-gradient-${item.title.toLowerCase().replace(/\s+/g, "-")}`;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className={clsx(
                  "group relative h-11 rounded-xl border border-transparent px-3 text-slate-900 dark:text-white transition-all",
                  "hover:border-slate-300/70 hover:bg-slate-900/10 dark:hover:border-slate-700 dark:hover:bg-black/45",
                  isActive &&
                    "border-slate-300/90 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-zinc-900/90 dark:text-white"
                )}
              >
                <Link href={item.url}>
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-slate-900 dark:bg-zinc-100" />
                  ) : null}
                  {item.icon && (
                    <item.icon
                      className={clsx(
                        "size-[18px] transition-colors",
                        !isActive && "stroke-black text-black dark:stroke-white dark:text-white",
                        isActive && "text-slate-900 dark:text-white",
                      )}
                      stroke={isActive ? `url(#${gradientId})` : undefined}
                      fill="none"
                    />
                  )}
                  {item.icon ? (
                    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
                      <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ) : null}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        )})}
      </SidebarMenu>
    </SidebarGroup>
  );
}

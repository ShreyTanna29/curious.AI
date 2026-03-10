"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className="h-14 rounded-2xl border border-slate-200/80 bg-white/80 px-3 shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-zinc-950/70 dark:hover:bg-zinc-900"
        >
          <Link href={"/dashboard"}>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-sidebar-primary-foreground">
              <Image src={"/logo.png"} alt="abc" width={18} height={18} />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-slate-800 dark:text-zinc-100">Curious.AI</span>
              <span className="truncate text-xs text-slate-500 dark:text-zinc-400">Advanced AI Workspace</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

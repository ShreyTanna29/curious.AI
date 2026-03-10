"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Code,
  LayoutDashboard,
  MessageSquare,
  Mic,
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useEffect } from "react"
import { useSession } from "next-auth/react"



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const session = useSession()
  const data = {
    user: {
      name: session.data?.user?.name!,
      email: session.data?.user?.email!,
      avatar: session.data?.user?.image!,
    },
    teams: [
      {
        name: "Curious AI",
        logo: Code,
        plan: "Enterprise",
      },

    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
      },
      {
        title: "Speech Generation",
        url: "/speech",
        icon: Mic,
      },
      {
        title: "Code Generation",
        url: "/code",
        icon: Code,
      }
    ],
  }

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);

  return (
    <Sidebar collapsible="none" className="border-r border-slate-200/70 bg-slate-50 dark:border-white/10 dark:bg-zinc-950" {...props}>
      <SidebarHeader className="border-b border-slate-200/70 px-2 pb-3 pt-2 dark:border-white/10">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <NavMain items={data.navMain} />
        <div className="mx-2 mt-4 rounded-2xl border border-slate-300/80 bg-slate-900/5 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-black/40 dark:text-zinc-200">
          <p className="font-semibold">Upgrade Output</p>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-300">
            Combine Chat + Speech for faster workflows.
          </p>
          <Link
            href="/speech"
            className="mt-2 inline-flex items-center gap-1 font-medium text-cyan-700 transition-colors hover:text-cyan-800 dark:text-cyan-300"
          >
            Open Speech
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200/70 px-2 pb-2 pt-3 dark:border-white/10">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

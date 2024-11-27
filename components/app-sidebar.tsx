"use client"

import * as React from "react"
import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useEffect } from "react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
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
      color: "text-sky-500"
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
      color: "text-violet-500"
    },
    {
      title: "Image Generation",
      url: "/image",
      icon: ImageIcon,
      color: "text-pink-700"

    },
    {
      title: "Code Generation",
      url: "/code",
      icon: Code,
      color: "text-green-500"
    },
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: ShoppingBag,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

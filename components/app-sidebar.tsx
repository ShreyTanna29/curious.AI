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
import { useUser } from "@clerk/nextjs"



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const user = useUser()
  const data = {
    user: {
      name: user.user?.fullName!,
      email: user.user?.emailAddresses[0].emailAddress!,
      avatar: user.user?.imageUrl!,
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
        title: "Image Generation",
        url: "/image",
        icon: ImageIcon,
      },
      {
        title: "Code Generation",
        url: "/code",
        icon: Code,
      },
      {
        title: "Marketplace",
        url: "/marketplace",
        icon: ShoppingBag,
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
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

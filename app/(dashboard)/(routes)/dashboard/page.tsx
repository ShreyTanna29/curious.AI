"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import {
  ArrowRight,
  Code,
  ImageIcon,
  MessageSquare,
  Settings,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

function DashboardPage() {
  useEffect(() => {
    gsap.to(".slideUp", {
      opacity: 1,
      duration: 0.3,
      stagger: 0.1,
    });
  });

  const tools = [
    {
      label: "Chat",
      icon: MessageSquare,
      href: "/chat",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Image Generation",
      icon: ImageIcon,
      href: "/image",
      color: "text-pink-700",
      bgColor: "bg-pink-700/10",
    },
    {
      label: "Code Generation",
      icon: Code,
      href: "/code",
      color: "text-green-700",
      bgColor: "bg-green-700/10",
    },
    {
      label: "Marketplace",
      icon: ShoppingBag,
      href: "/marketplace",
      color: "text-orange-700",
      bgColor: "bg-orange-700/10",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      color: "text-black dark:text-white",
      bgColor: "bg-black/10 dark:bg-white/10",
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8 w-full space-y-4">
        <h2 className="text-2xl font-bold text-center md:text-4xl">
          Explore the power of AI
        </h2>
        <p className="text-muted-foreground text-sm text-center font-light md:text-lg">
          chat with the smartest AI - Experience the power of AI
        </p>
      </div>

      <div className="px-4 w-full space-y-4 ">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="opacity-0 slideUp">
            <Card
              onClick={() => (window.location.href = tool.href)}
              className="p-4 border-black/5 dark:border-white/5 flex w-full mb-5 items-center justify-between hover:shadow-md transition cursor-pointer opacity-0  slideUp"
            >
              <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                  <tool.icon className={cn("w-8 h-8", tool.color)} />
                </div>
                <div className="font-semibold">{tool.label}</div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;

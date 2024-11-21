"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/packages/utils";
import {
  ArrowRight,
  Code,
  ImageIcon,
  MessageSquare,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";

function DashboardPage() {
  const router = useRouter();

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
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl font-bold text-center md:text-4xl ">
          Explore the power of AI
        </h2>
        <p className="text-muted-foreground text-sm text-center font-light md:text-lg">
          chat with the smartest AI - Experience the power of AI
        </p>
      </div>

      <div className="px-4 md:px-20 lg:px-32 space-y-4 ">
        {tools.map((tool) => (
          <Card
            key={tool.href}
            onClick={() => {
              router.push(tool.href);
            }}
            className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div className="font-semibold">{tool.label}</div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;

"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Code,
  ImageIcon,
  MessageSquare,
  Settings,
  ShoppingBag,
} from "lucide-react";

function DashboardPage() {
  const tools = [
    {
      label: "AI Assistant",
      description:
        "Chat with an intelligent AI to answer questions and solve problems",
      icon: MessageSquare,
      href: "/chat",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Create Visuals",
      description: "Generate stunning images from text descriptions",
      icon: ImageIcon,
      href: "/image",
      color: "text-pink-700",
      bgColor: "bg-pink-700/10",
    },
    {
      label: "Build Web Apps",
      description:
        "Generate code snippets and full components with explanations",
      icon: Code,
      href: "/code",
      color: "text-green-700",
      bgColor: "bg-green-700/10",
    },
    {
      label: "AI Marketplace",
      description: "Discover creative visuals",
      icon: ShoppingBag,
      href: "/marketplace",
      color: "text-orange-700",
      bgColor: "bg-orange-700/10",
    },
    {
      label: "Personalize",
      description: "Customize your experience and manage account preferences",
      icon: Settings,
      href: "/settings",
      color: "text-black dark:text-white",
      bgColor: "bg-black/10 dark:bg-white/10",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="w-full"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
          <motion.div
            className="mb-12 w-full space-y-6 text-center"
            initial="hidden"
            animate="visible"
            variants={headerVariants}
          >
            <h2 className="text-3xl font-bold md:text-5xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Explore the Power of AI
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
              Unlock limitless possibilities with our suite of AI-powered tools
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {tools.map((tool) => (
              <motion.div key={tool.href} variants={item}>
                <Card
                  className={cn(
                    "p-6 border-2 border-transparent hover:border-primary/20",
                    "hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
                    "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950",
                    "cursor-pointer relative overflow-hidden group"
                  )}
                  onClick={() => (window.location.href = tool.href)}
                >
                  <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-x-4">
                      <div className={cn("p-3 rounded-xl", tool.bgColor)}>
                        <tool.icon className={cn("w-8 h-8", tool.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tool.label}</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      className="z-10 relative"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight
                        className={cn("w-6 h-6 transition-colors", tool.color)}
                      />
                    </motion.div>
                  </div>

                  {/* Background gradient effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(45deg, ${
                        tool.color.includes("violet")
                          ? "#8b5cf6"
                          : tool.color.includes("pink")
                          ? "#ec4899"
                          : tool.color.includes("green")
                          ? "#10b981"
                          : tool.color.includes("orange")
                          ? "#f59e0b"
                          : "#6b7280"
                      } 0%, transparent 100%)`,
                    }}
                  />
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-sm text-muted-foreground">
              Powered by cutting-edge AI models for the best experience
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DashboardPage;

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
  Mic,
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
      label: "Generate Speech",
      description: "Convert text to natural-sounding speech with AI",
      icon: Mic,
      href: "/speech",
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
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
        className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 relative"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />
        
        <div className="w-full max-w-6xl mx-auto px-4 py-12 relative">
          <motion.div
            className="mb-16 w-full space-y-8 text-center"
            initial="hidden"
            animate="visible"
            variants={headerVariants}
          >
            <h2 className="text-4xl font-bold md:text-6xl bg-gradient-to-r from-purple-600 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Explore the Power of AI
            </h2>
            <p className="text-muted-foreground text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
              Unlock limitless possibilities with our suite of AI-powered tools designed to enhance your creativity and productivity
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {tools.map((tool) => (
              <motion.div key={tool.href} variants={item}>
                <Card
                  className={cn(
                    "p-8 border-2 border-transparent hover:border-primary/20",
                    "hover:shadow-xl hover:shadow-primary/10 transition-all duration-300",
                    "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950",
                    "cursor-pointer relative overflow-hidden group backdrop-blur-sm",
                    "hover:scale-[1.02] transform-gpu"
                  )}
                  onClick={() => (window.location.href = tool.href)}
                >
                  <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-x-6">
                      <div className={cn("p-4 rounded-2xl", tool.bgColor, "group-hover:scale-110 transition-transform duration-300")}>
                        <tool.icon className={cn("w-8 h-8", tool.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-2">{tool.label}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
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

                  {/* Enhanced background gradient effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(45deg, ${
                        tool.color.includes("violet")
                          ? "#8b5cf6"
                          : tool.color.includes("pink")
                          ? "#ec4899"
                          : tool.color.includes("blue")
                          ? "#2563eb"
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
            className="mt-16 text-center"
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

// Add this at the end of the file, before the export
const styles = `
  .bg-grid-pattern {
    background-image: linear-gradient(to right, #80808012 1px, transparent 1px),
      linear-gradient(to bottom, #80808012 1px, transparent 1px);
    background-size: 24px 24px;
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default DashboardPage;

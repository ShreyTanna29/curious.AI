"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  Code,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Settings,
  Mic,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function DashboardPage() {
  const tools = [
    {
      label: "AI Assistant",
      description:
        "Chat with AI for answers, image generation, and problem solving",
      icon: MessageSquare,
      href: "/chat",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
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
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Personalize",
      description: "Customize your experience and manage account preferences",
      icon: Settings,
      href: "/settings",
      color: "text-cyan-300",
      bgColor: "bg-cyan-500/10",
    },
  ];

  const metrics = [
    {
      label: "Active Tools",
      value: "4",
      hint: "Chat, Speech, Code, Settings",
      icon: Layers,
    },
    {
      label: "Daily Sessions",
      value: "120+",
      hint: "Across all AI modules",
      icon: Activity,
    },
    {
      label: "Avg Response",
      value: "< 3s",
      hint: "Optimized model routing",
      icon: Clock3,
    },
    {
      label: "Productivity",
      value: "+38%",
      hint: "Based on weekly usage",
      icon: Sparkles,
    },
  ];

  const activity = [
    "Use Chat for idea generation, quick research, and image prompts.",
    "Switch to Speech to narrate scripts and product walk-throughs.",
    "Move to Code when you need generated snippets and scaffolds.",
  ];

  const quickActions = [
    { label: "Start Brainstorm", href: "/chat" },
    { label: "Generate Voiceover", href: "/speech" },
    { label: "Build With AI Code", href: "/code" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(15,23,42,0.06),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(100,116,139,0.12),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.04),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(161,161,170,0.08),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(100,116,139,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.12)_1px,transparent_1px)] [background-size:36px_36px] dark:[background-image:linear-gradient(to_right,rgba(161,161,170,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(161,161,170,0.08)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:border-white/20 dark:bg-gradient-to-br dark:from-black dark:via-zinc-950 dark:to-black dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.55)] md:p-10"
        >
          <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-slate-400/20 blur-3xl dark:bg-zinc-200/10" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-slate-500/20 blur-3xl dark:bg-zinc-400/10" />
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs tracking-wide text-slate-700 dark:border-white/20 dark:bg-white/5 dark:text-zinc-200">
            <Sparkles className="h-3.5 w-3.5" />
            Intelligent Workspace
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
            Build faster with a modern AI control center.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-700 dark:text-slate-200 md:text-base">
            Launch conversations, generate voiceovers, and produce code from one
            polished workspace designed for high-output teams.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="bg-sky-500 text-slate-950 hover:bg-sky-400">
              <Link href="/chat">Start in Chat</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-400/60 bg-white/80 text-slate-900 hover:bg-white dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              <Link href="/speech">Open Speech Studio</Link>
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-300/70 bg-white/80 p-3 dark:border-white/15 dark:bg-white/5">
              <p className="text-xs text-slate-600 dark:text-slate-200">Model Stability</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                99.9% uptime
              </p>
            </div>
            <div className="rounded-xl border border-slate-300/70 bg-white/80 p-3 dark:border-white/15 dark:bg-white/5">
              <p className="text-xs text-slate-600 dark:text-slate-200">Generation Throughput</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-cyan-200">
                <BarChart3 className="h-4 w-4" />
                3.2x faster
              </p>
            </div>
            <div className="rounded-xl border border-slate-300/70 bg-white/80 p-3 dark:border-white/15 dark:bg-white/5">
              <p className="text-xs text-slate-600 dark:text-slate-200">Automation Readiness</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-violet-200">
                <Zap className="h-4 w-4" />
                High
              </p>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * index }}
            >
              <Card className="border-slate-200/70 bg-white/75 backdrop-blur-xl transition-colors hover:border-sky-200 dark:border-white/10 dark:bg-zinc-950/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                  <item.icon className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tracking-tight">{item.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 * index }}
            >
              <Link href={tool.href} className="group block focus-visible:outline-none">
                <Card
                  className={cn(
                    "relative overflow-hidden border-slate-200/80 bg-white/75 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl",
                    "focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-zinc-950/80",
                  )}
                >
                  <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-sky-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <CardContent className="relative flex items-center justify-between gap-4 p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn("rounded-2xl p-3", tool.bgColor)}>
                        <tool.icon className={cn("h-6 w-6", tool.color)} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{tool.label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-full border border-slate-300/70 bg-white/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:border-white/15 dark:bg-black dark:text-zinc-300">
                        Module
                      </span>
                      <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-sky-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * index }}
            >
              <Link
                href={action.href}
                className="group block rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white/90 to-slate-100/90 p-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:text-slate-900 hover:shadow-md dark:border-white/10 dark:from-zinc-950 dark:to-black dark:text-zinc-200"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white/75 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/75">
          <h2 className="text-lg font-semibold">Recent workflow</h2>
          <div className="mt-4 grid gap-3">
            {activity.map((entry, index) => (
              <div
                key={entry}
                className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/70"
              >
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/15 text-xs font-medium text-sky-500">
                  {index + 1}
                </span>
                <p className="text-muted-foreground">{entry}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;

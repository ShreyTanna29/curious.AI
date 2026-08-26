"use client";

import Link from "next/link";
import { LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GuestFeatureGateProps = {
  title: string;
  description: string;
  details?: string[];
};

export function GuestFeatureGate({
  title,
  description,
  details = [],
}: GuestFeatureGateProps) {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-8 md:px-8">
      <Card className="w-full max-w-3xl border-slate-200/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85 dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <CardHeader className="space-y-3">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            <LockKeyhole className="h-3.5 w-3.5" />
            Account required
          </p>
          <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
          <p className="text-sm text-slate-600 dark:text-zinc-300 md:text-base">
            {description}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {details.length > 0 ? (
            <div className="grid gap-2">
              {details.map((detail) => (
                <div
                  key={detail}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-black/50 dark:text-zinc-200"
                >
                  {detail}
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-2xl border border-cyan-200/80 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-900 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
            <p className="inline-flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4" />
              Upgrade to save work across devices and unlock the full platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/signup?upgrade=1">Create account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signin?upgrade=1">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

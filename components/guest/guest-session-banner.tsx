"use client";

import Link from "next/link";
import { Clock3, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGuestSession } from "@/hooks/useGuestSession";
import { formatGuestTimeRemaining } from "@/lib/guest-session";

export function GuestSessionBanner() {
  const { isGuest, remainingMs } = useGuestSession();

  if (!isGuest) {
    return null;
  }

  return (
    <div className="border-b border-amber-300/70 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 px-4 py-3 text-slate-900 dark:border-amber-400/20 dark:bg-[linear-gradient(90deg,rgba(120,53,15,0.28),rgba(113,63,18,0.22),rgba(127,29,29,0.2))] dark:text-white md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Guest mode is active
          </p>
          <p className="text-xs text-slate-700 dark:text-zinc-200 md:text-sm">
            Chat and code stay local to this browser, while speech, settings,
            and cloud history require an account.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 dark:text-zinc-200">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {formatGuestTimeRemaining(remainingMs)} left
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5" />
              Uploaded or generated images may not survive storage limits
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Link href="/signup?upgrade=1">Create account</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/signin?upgrade=1">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

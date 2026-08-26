"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { History, Volume2 } from "lucide-react";
import { VOICE_PRESETS } from "@/lib/voice_presets";

type SpeechHistoryItem = {
  id: string;
  prompt: string;
  audioUrl: string;
  voicePreset: string;
  createdAt: string;
};

interface SpeechHistorySidebarProps {
  history: SpeechHistoryItem[];
  isOpen: boolean;
  isLoading: boolean;
  selectedId?: string | null;
  onSelect: (item: SpeechHistoryItem) => void;
  onToggle: () => void;
}

const voicePresetNameMap = Object.values(VOICE_PRESETS)
  .flat()
  .reduce<Record<string, string>>((accumulator, voice) => {
    accumulator[voice.id] = voice.name;
    return accumulator;
  }, {});

const formatSpeechTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function SpeechHistorySidebar({
  history,
  isOpen,
  isLoading,
  selectedId,
  onSelect,
  onToggle,
}: SpeechHistorySidebarProps) {
  return (
    <>
      <Button
        variant="custom"
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        )}
        onClick={onToggle}
      >
        <History className="h-4 w-4" />
        <span>{isOpen ? "Hide" : "Show"} History</span>
      </Button>

      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 transform border-l border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:border-white/15 dark:bg-[#0a0a0a] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <h2 className="mb-4 text-xl font-bold">Speech History</h2>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-900"
                  />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="py-4 text-center text-gray-500 dark:text-zinc-400">
                No speech history found
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 transition-colors",
                      selectedId === item.id
                        ? "border-cyan-300 bg-cyan-50 dark:border-cyan-400/40 dark:bg-cyan-400/10"
                        : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => onSelect(item)}
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="mt-0.5 rounded-full border border-slate-200 bg-white/90 p-1.5 dark:border-white/10 dark:bg-black/60">
                        <Volume2 className="h-3.5 w-3.5 text-cyan-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.prompt || "Untitled Speech"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500 dark:text-zinc-400">
                          {voicePresetNameMap[item.voicePreset] || item.voicePreset}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                          {formatSpeechTimestamp(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onToggle} />
      ) : null}
    </>
  );
}

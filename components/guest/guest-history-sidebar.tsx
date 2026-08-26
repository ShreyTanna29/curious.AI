"use client";

import { Trash2, History, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GuestChatConversation } from "@/lib/guest-session";

type GuestHistorySidebarProps = {
  history: GuestChatConversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onNewChat: () => void;
};

function formatConversationTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function GuestHistorySidebar({
  history,
  activeConversationId,
  isOpen,
  onToggle,
  onSelect,
  onDelete,
  onNewChat,
}: GuestHistorySidebarProps) {
  return (
    <>
      <Button
        variant="custom"
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        onClick={onToggle}
      >
        <History className="h-4 w-4" />
        <span>{isOpen ? "Hide" : "Show"} Local History</span>
      </Button>

      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 transform border-l border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:border-white/15 dark:bg-[#0a0a0a] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Guest Chat History</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Stored only on this device during your guest session.
              </p>
            </div>
            <Button size="icon" variant="outline" onClick={onNewChat}>
              <SquarePen className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500 dark:text-zinc-400">
                No guest conversations yet
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((conversation) => (
                  <li
                    key={conversation.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      activeConversationId === conversation.id
                        ? "border-cyan-300 bg-cyan-50 dark:border-cyan-400/40 dark:bg-cyan-400/10"
                        : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => onSelect(conversation.id)}
                    >
                      <p className="truncate text-sm font-medium">
                        {conversation.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                        {formatConversationTimestamp(conversation.updatedAt)}
                      </p>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-2 h-7 w-7 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
                      onClick={() => onDelete(conversation.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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

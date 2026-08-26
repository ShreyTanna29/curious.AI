"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatAttachmentPreviewProps = {
  attachmentUrl: string;
  disabled?: boolean;
  onRemove: () => void;
};

export function ChatAttachmentPreview({
  attachmentUrl,
  disabled,
  onRemove,
}: ChatAttachmentPreviewProps) {
  return (
    <div className="mx-auto mb-3 w-full max-w-4xl rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-950/90 dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-400">
            Image attachment
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-300">
            The AI will receive this image with your next message.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onRemove}
          className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <img
        src={attachmentUrl}
        alt="Attachment preview"
        className="mt-3 max-h-64 w-auto rounded-xl border border-slate-200 object-contain dark:border-white/10"
      />
    </div>
  );
}

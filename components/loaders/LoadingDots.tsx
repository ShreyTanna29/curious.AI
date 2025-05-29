
import React from "react";

export default function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <span className="w-2 h-2 bg-current  rounded-full animate-bounce [animation-delay:0s]" />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  );
}

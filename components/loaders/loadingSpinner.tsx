export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-4 border-foreground/60 border-t-foreground/15 ${className}`}
    />
  );
}

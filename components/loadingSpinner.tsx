
export default function LoadingSpinner({ className, darkTheme }: { className?: string, darkTheme?:boolean }) {
    return (
        <div className={`${!darkTheme? "border-black/60":"border-white"} h-5 w-5 animate-spin rounded-full border-4 border-t-${darkTheme? "white/10":"black/10"} ${className}`} />
    )
}
